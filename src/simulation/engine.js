// ─── Race Simulation Engine ───────────────────────────────────────────────────
// Pure functions — no React, no side effects. Fully unit-testable.

import { DRIVERS_2026, TEAMS_2026, CIRCUITS_2026, POINTS, SPRINT_PTS } from "../data/f1Data";
import { TEAM_STRENGTH, PU_BONUS, CIRCUIT_AFFINITY, CT_IDX, ERS_SKILL } from "../data/modelData";

// ── Utility ───────────────────────────────────────────────────────────────────
export function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ── Per-driver score for a given circuit ─────────────────────────────────────
export function scoreDriver(driver, circuit, rng) {
  const team     = TEAMS_2026.find(t => t.id === driver.team);
  const base     = TEAM_STRENGTH[driver.team] || 0.75;
  const pu       = PU_BONUS[team?.pu] || 0;
  const cti      = CT_IDX[circuit.type] || 3;
  const ca       = CIRCUIT_AFFINITY[driver.team]?.[cti] || 1.0;
  const dr       = driver.rating / 100;
  const ers      = ERS_SKILL[driver.id] || 0.75;
  const exp      = Math.min(1.0, (driver.age - 17) / 20);
  const rookiePen = driver.rookie ? -0.04 : 0;
  const noise    = (rng() - 0.5) * 0.10;
  const pace     = (base + pu) * ca * dr + ers * 0.15 + 0.02 + rookiePen + exp * 0.02 + noise;
  const dnf      = rng() < 0.035; // ~3.5% DNF rate
  return { pace, dnf };
}

// ── Single-race simulation ────────────────────────────────────────────────────
export function simulateRace(circuit, seed) {
  const rng = seededRandom(seed + circuit.round * 1337);
  const entries = DRIVERS_2026.map(d => {
    const { pace, dnf } = scoreDriver(d, circuit, rng);
    const vsc = rng() > 0.65 ? rng() * 0.04 : 0;
    return { driver: d, score: dnf ? -1 : pace + vsc, dnf };
  });
  return [
    ...entries.filter(e => !e.dnf).sort((a, b) => b.score - a.score),
    ...entries.filter(e => e.dnf),
  ];
}

// ── Full-season rollup ────────────────────────────────────────────────────────
// liveResults: Map<circuitIndex, { results, sessionKey, stints, sprint? }>
// Any index present uses real OpenF1 data; the rest are simulated.
export function runFullSeason(seed = 42, liveResults = new Map()) {
  const dp = {}, cp = {}, raceResults = [];
  DRIVERS_2026.forEach(d => { dp[d.id] = 0; });
  TEAMS_2026.forEach(t => { cp[t.id] = 0; });

  CIRCUITS_2026.forEach((circuit, idx) => {
    const raceData = { circuit, results: [], isLive: false };
    const live = liveResults.get(idx);

    if (live) {
      raceData.isLive    = true;
      raceData.sessionKey = live.sessionKey;
      raceData.stints    = live.stints || [];

      // Apply sprint points first (if this was a sprint weekend)
      if (live.sprint) {
        live.sprint.forEach(r => {
          const driver = DRIVERS_2026.find(d => d.id === r.driverId);
          if (!driver) return;
          dp[driver.id]    = (dp[driver.id]    || 0) + r.points;
          cp[driver.team]  = (cp[driver.team]  || 0) + r.points;
        });
      }

      live.results.forEach(r => {
        const driver = DRIVERS_2026.find(d => d.id === r.driverId);
        if (!driver) return;
        dp[driver.id]   = (dp[driver.id]   || 0) + r.points;
        cp[driver.team] = (cp[driver.team] || 0) + r.points;
        raceData.results.push({ driver, position: r.position, points: r.points, dnf: r.dnf });
      });
    } else {
      // Simulate sprint (different seed offset so it differs from the race)
      if (circuit.sprint) {
        const sprintSim = simulateRace(circuit, seed + circuit.round * 7919);
        sprintSim.forEach((e, i) => {
          if (!e.driver || e.dnf) return;
          const sPts = SPRINT_PTS[i] || 0;
          if (sPts > 0) {
            dp[e.driver.id]   = (dp[e.driver.id]   || 0) + sPts;
            cp[e.driver.team] = (cp[e.driver.team] || 0) + sPts;
          }
        });
        raceData.sprintResults = sprintSim.slice(0, 8).map((e, i) => ({
          driver: e.driver, position: i + 1, points: SPRINT_PTS[i] || 0, dnf: e.dnf,
        }));
      }

      // Simulate race
      simulateRace(circuit, seed).forEach((e, i) => {
        if (!e.driver) return;
        const pts = e.dnf ? 0 : (POINTS[i] || 0);
        dp[e.driver.id]   = (dp[e.driver.id]   || 0) + pts;
        cp[e.driver.team] = (cp[e.driver.team] || 0) + pts;
        raceData.results.push({ driver: e.driver, position: i + 1, points: pts, dnf: e.dnf });
      });
    }

    raceResults.push(raceData);
  });

  const driverStandings = DRIVERS_2026
    .map(d => ({ ...d, points: dp[d.id] || 0 }))
    .sort((a, b) => b.points - a.points)
    .map((d, i) => ({ ...d, position: i + 1 }));

  const constructorStandings = TEAMS_2026
    .map(t => ({ ...t, points: cp[t.id] || 0 }))
    .sort((a, b) => b.points - a.points)
    .map((t, i) => ({ ...t, position: i + 1 }));

  return { driverStandings, constructorStandings, raceResults };
}

// ── Simulated telemetry (fallback when no real stints are available) ──────────
export function buildTelemetry(circuit, raceResult) {
  const rng = seededRandom(circuit.round * 9999);
  return raceResult.results.slice(0, 5).map(entry => {
    if (!entry.driver) return null;
    const numStops = circuit.type === "street"
      ? 1 + Math.floor(rng() * 1)
      : 1 + Math.floor(rng() * 2);
    const stints = [];
    let lap = 1;
    for (let s = 0; s <= numStops; s++) {
      const sl = Math.max(
        5,
        Math.floor(circuit.laps / (numStops + 1)) + Math.floor((rng() - 0.5) * 8),
      );
      stints.push({ lap, stintLen: sl, compound: s === 0 ? "MEDIUM" : rng() > 0.5 ? "HARD" : "SOFT" });
      lap += sl;
    }
    return {
      driver: entry.driver, position: entry.position, stints,
      avgSpeed:        (220 + rng() * 80).toFixed(1),
      topSpeed:        (260 + rng() * 80).toFixed(1),
      ersUtil:         ((ERS_SKILL[entry.driver.id] || 0.75) * 100).toFixed(1),
      ersHarvest:      (6 + rng() * 3).toFixed(2),
      overtakeMode:    Math.floor(circuit.laps * 0.15 * rng()),
      activeAeroChanges: Math.floor(circuit.laps * 2.4),
      tireWear:        (25 + rng() * 45).toFixed(1),
      gapToLeader:     entry.position === 1 ? 0 : (rng() * 45).toFixed(3),
    };
  }).filter(Boolean);
}

// ── Real telemetry builder (uses OpenF1 stints data) ─────────────────────────
export function buildRealTelemetry(circuit, raceResult, stintsData) {
  const rng = seededRandom(circuit.round * 9999);
  return raceResult.results.slice(0, 5).map(entry => {
    if (!entry.driver) return null;

    // Try to pull real stint data for this driver
    const driverNum = Object.entries(
      // NUM_TO_ID imported inline to avoid circular dep
      { 63:"RUS",12:"ANT",16:"LEC",44:"HAM",4:"NOR",81:"PIA",1:"VER",30:"LAW",14:"ALO",18:"STR",23:"ALB",55:"SAI",22:"TSU",6:"LIN",87:"BEA",31:"OCO",10:"GAS",43:"COL",5:"BOR",27:"HUL",11:"PER",77:"BOT" }
    ).find(([, id]) => id === entry.driver.id)?.[0];

    const realStints = stintsData
      .filter(s => String(s.driver_number) === String(driverNum))
      .sort((a, b) => a.stint_number - b.stint_number)
      .map(s => ({
        lap: s.lap_start,
        stintLen: (s.lap_end || circuit.laps) - s.lap_start + 1,
        compound: s.compound || "MEDIUM",
      }));

    const stints = realStints.length > 0 ? realStints : (() => {
      const ns = circuit.type === "street" ? 1 : 1 + Math.floor(rng() * 2);
      const st = []; let lap = 1;
      for (let s = 0; s <= ns; s++) {
        const sl = Math.max(5, Math.floor(circuit.laps / (ns + 1)) + Math.floor((rng() - 0.5) * 8));
        st.push({ lap, stintLen: sl, compound: s === 0 ? "MEDIUM" : rng() > 0.5 ? "HARD" : "SOFT" });
        lap += sl;
      }
      return st;
    })();

    return {
      driver: entry.driver, position: entry.position, stints,
      avgSpeed:          (220 + rng() * 80).toFixed(1),
      topSpeed:          (260 + rng() * 80).toFixed(1),
      ersUtil:           ((ERS_SKILL[entry.driver.id] || 0.75) * 100).toFixed(1),
      ersHarvest:        (6 + rng() * 3).toFixed(2),
      overtakeMode:      Math.floor(circuit.laps * 0.15 * rng()),
      activeAeroChanges: Math.floor(circuit.laps * 2.4),
      tireWear:          (25 + rng() * 45).toFixed(1),
      gapToLeader:       entry.position === 1 ? 0 : (rng() * 45).toFixed(3),
      isLive: true,
    };
  }).filter(Boolean);
}
