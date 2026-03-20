import { TEAMS_2026, POWER_UNITS_2026, DRIVERS_2026 } from "../../data/f1Data";

const MEDAL = ["#FFD700", "#C0C0C0", "#CD7F32"];
const RULE_CHANGES = [
  ["⚡", "50/50 ICE + Electric (MGU-K 350kW)"],
  ["🔋", "9MJ/lap ERS harvest (doubled)"],
  ["🪽", "Active Aero (replaces DRS)"],
  ["💥", "Overtake Mode (within 1s)"],
  ["🏋", "Cars 30kg lighter — 770kg"],
  ["🛢", "100% Sustainable Fuel"],
  ["🏎", "2 new teams: Audi + Cadillac"],
];
const STAT_ITEMS = [
  ["22","DRIVERS"], ["11","TEAMS"], ["52","FEATURES"],
  ["8","NEW 2026"], [null,"RACES LIVE"], ["∞","SIMS"],
];

export default function DashboardView({ seasonData, liveCount }) {
  // Compute standings from completed (live) races only
  const liveDriverPts = {};
  const liveTeamPts   = {};
  DRIVERS_2026.forEach(d => { liveDriverPts[d.id] = 0; });
  TEAMS_2026.forEach(t => { liveTeamPts[t.id] = 0; });
  seasonData.raceResults
    .filter(r => r.isLive)
    .forEach(r => r.results.forEach(res => {
      if (!res.driver) return;
      liveDriverPts[res.driver.id] = (liveDriverPts[res.driver.id] || 0) + res.points;
      liveTeamPts[res.driver.team] = (liveTeamPts[res.driver.team] || 0) + res.points;
    }));

  const liveDriverStandings = DRIVERS_2026
    .map(d => ({ ...d, points: liveDriverPts[d.id] || 0 }))
    .sort((a, b) => b.points - a.points);

  const liveTeamStandings = TEAMS_2026
    .map(t => ({ ...t, points: liveTeamPts[t.id] || 0 }))
    .sort((a, b) => b.points - a.points);

  const maxDriverPts = Math.max(liveDriverStandings[0]?.points || 1, 1);
  const maxTeamPts   = Math.max(liveTeamStandings[0]?.points || 1, 1);

  // Always show the latest completed race; fall back to simulated R1
  const latestRace = liveCount > 0
    ? seasonData.raceResults[liveCount - 1]
    : seasonData.raceResults[0];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>

      {/* WDC */}
      <div className="card" style={{ boxShadow: "0 0 20px rgba(0,210,190,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 16, letterSpacing: 3, color: "#00D2BE" }}>
            🏆 WDC — DRIVERS
          </div>
          <span className="ab" style={{ background: liveCount > 0 ? "#22ff88" : "#2a2a3a", color: liveCount > 0 ? "#09090f" : "#666" }}>
            {liveCount > 0 ? `${liveCount} RACE${liveCount > 1 ? "S" : ""}` : "AWAITING DATA"}
          </span>
        </div>
        {liveCount === 0 ? (
          <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: "#555", padding: "20px 0", textAlign: "center", lineHeight: 2.2 }}>
            No completed races in OpenF1 yet.<br />
            Standings will appear here once<br />
            race results are available.
          </div>
        ) : (
          liveDriverStandings.slice(0, 12).map((d, i) => {
            const team = TEAMS_2026.find(t => t.id === d.team);
            return (
              <div key={d.id} className="dr"
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 3px", borderRadius: 3, marginBottom: 2, background: i === 0 ? "rgba(0,210,190,0.06)" : "transparent" }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 15, color: i < 3 ? MEDAL[i] : "#444", width: 20, textAlign: "center" }}>{i+1}</div>
                <div style={{ width: 3, height: 22, background: team?.color, borderRadius: 2 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Rajdhani'", fontWeight: 600, fontSize: 12, color: i < 2 ? "#fff" : "#aaa" }}>{d.name}</div>
                  <div style={{ height: 2, background: "#1e1e2e", borderRadius: 2, marginTop: 2 }}>
                    <div className="bf" style={{ height: "100%", width: `${(d.points/maxDriverPts)*100}%`, background: team?.color, borderRadius: 2 }} />
                  </div>
                </div>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 11, color: "#00D2BE", fontWeight: 700 }}>{d.points}</div>
              </div>
            );
          })
        )}
      </div>

      {/* WCC */}
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 16, letterSpacing: 3, color: "#00D2BE" }}>
            🏗 WCC — CONSTRUCTORS
          </div>
          <span className="ab" style={{ background: liveCount > 0 ? "#22ff88" : "#2a2a3a", color: liveCount > 0 ? "#09090f" : "#666" }}>
            {liveCount > 0 ? "ACTUAL" : "AWAITING DATA"}
          </span>
        </div>
        {liveCount === 0 ? (
          <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: "#555", padding: "20px 0", textAlign: "center", lineHeight: 2.2 }}>
            No completed races in OpenF1 yet.<br />
            Standings will appear here once<br />
            race results are available.
          </div>
        ) : (
          liveTeamStandings.map((t, i) => {
            const pu = Object.entries(POWER_UNITS_2026).find(([, p]) => p.teams.includes(t.id));
            return (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 3px", marginBottom: 5 }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 13, color: "#444", width: 18 }}>{i+1}</div>
                <div style={{ width: 9, height: 9, background: t.color, borderRadius: "50%" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontFamily: "'Rajdhani'", fontSize: 11, fontWeight: 600, color: "#ccc" }}>{t.short}</span>
                    <span style={{ fontFamily: "'Space Mono'", fontSize: 7, color: pu?.[0]==="mercedes"?"#00D2BE":"#555", border: `1px solid ${pu?.[0]==="mercedes"?"#00D2BE":"#333"}`, padding: "0 3px", borderRadius: 2 }}>
                      {pu?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ height: 2, background: "#1e1e2e", borderRadius: 2, marginTop: 3 }}>
                    <div className="bf" style={{ height: "100%", width: `${(t.points/maxTeamPts)*100}%`, background: t.color, borderRadius: 2 }} />
                  </div>
                </div>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 10, color: t.color }}>{t.points}</div>
              </div>
            );
          })
        )}
      </div>

      {/* Right column: latest race + rule changes */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="card" style={{ borderColor: liveCount > 0 ? "#FFD700" : "#2a2a3a" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 14, letterSpacing: 3, color: liveCount > 0 ? "#FFD700" : "#555" }}>
              🏁 R{liveCount > 0 ? liveCount : 1} — {latestRace?.circuit.name.replace(" Grand Prix","").toUpperCase()}
            </div>
            <span className="ab" style={{ background: liveCount > 0 ? "#FFD700" : "#2a2a3a", color: liveCount > 0 ? "#09090f" : "#666" }}>
              {liveCount > 0 ? "ACTUAL" : "SIMULATED"}
            </span>
          </div>
          {latestRace?.results.slice(0, 6).map(r => {
            const team = TEAMS_2026.find(t => t.id === r.driver?.team);
            return (
              <div key={r.driver?.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: "1px solid #1a1a24" }}>
                <span style={{ fontFamily: "'Bebas Neue'", fontSize: 15, color: r.position < 4 ? MEDAL[r.position-1] : "#555" }}>P{r.position}</span>
                <span style={{ fontFamily: "'Rajdhani'", fontSize: 12, color: "#ccc", fontWeight: 600 }}>{r.driver?.name}</span>
                <span style={{ fontFamily: "'Space Mono'", fontSize: 10, color: team?.color }}>{r.points}pts</span>
              </div>
            );
          })}
          {liveCount === 0 && (
            <div style={{ marginTop: 8, fontFamily: "'Space Mono'", fontSize: 8, color: "#444", lineHeight: 1.7 }}>
              ℹ️ These are simulated predictions.<br />
              Actual results load automatically<br />
              from OpenF1 after each race.
            </div>
          )}
          {liveCount > 0 && (
            <div style={{ marginTop: 8, fontFamily: "'Space Mono'", fontSize: 8, color: "#555", lineHeight: 1.7 }}>
              ⚠️ Piastri DNS (formation crash)<br />
              Hülkenberg DNS (technical)<br />
              Ferrari VSC strategy error → P3/P4
            </div>
          )}
        </div>

        <div className="card" style={{ background: "linear-gradient(135deg,#0d1a1a,#0d0d15)" }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 12, letterSpacing: 3, color: "#00D2BE", marginBottom: 8 }}>
            2026 RULE CHANGES
          </div>
          {RULE_CHANGES.map(([ic, rule]) => (
            <div key={rule} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 5 }}>
              <span style={{ fontSize: 11 }}>{ic}</span>
              <span style={{ fontFamily: "'Space Mono'", fontSize: 8, color: "#666" }}>{rule}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats footer bar */}
      <div className="card" style={{ gridColumn: "1/-1", display: "flex", gap: 36, alignItems: "center", background: "#0d0d15" }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 12, letterSpacing: 3, color: "#00D2BE" }}>PREDICTION ENGINE</div>
          <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: "#444", marginTop: 3 }}>
            XGBoost · 52 Features · FastF1 Pipeline · 2026 ERS + Active Aero Model
          </div>
        </div>
        {STAT_ITEMS.map(([v, l]) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, color: "#fff" }}>
              {v === null ? `${liveCount}/24` : v}
            </div>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: "#444", letterSpacing: 1 }}>{l}</div>
          </div>
        ))}
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div className="pulse" style={{ fontFamily: "'Space Mono'", fontSize: 9, color: "#22ff88" }}>
            ● SIM R{liveCount+1}–R24 ACTIVE
          </div>
          <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: "#FFD700", marginTop: 3 }}>
            ● {liveCount} LIVE FROM OPENF1
          </div>
        </div>
      </div>

    </div>
  );
}
