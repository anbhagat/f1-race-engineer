// ─── F1RaceEngineer — root component ─────────────────────────────────────────
// Owns only the global state that multiple views need to share.
// All fetch logic lives in useLiveData; all views are their own modules.

import { useState, useEffect } from "react";

import { useLiveData }     from "./hooks/useLiveData";
import { runFullSeason }   from "./simulation/engine";
import { buildTelemetry, buildRealTelemetry } from "./simulation/engine";

import Header          from "./components/Header";
import DashboardView   from "./components/views/DashboardView";
import StandingsView   from "./components/views/StandingsView";
import CalendarView    from "./components/views/CalendarView";
import TelemetryView   from "./components/views/TelemetryView";
import EngineerView    from "./components/views/EngineerView";
import LapMapTab       from "./components/LapMapTab";

// ── Global styles ─────────────────────────────────────────────────────────────
// Injected once at the component boundary rather than per-render.
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');
  *{box-sizing:border-box}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#00D2BE;border-radius:2px}
  .nb{background:none;border:none;cursor:pointer;padding:9px 16px;font-family:'Bebas Neue';font-size:13px;letter-spacing:2px;color:#555;transition:all .2s}
  .nb:hover{color:#00D2BE}.nb.a{color:#00D2BE;border-bottom:2px solid #00D2BE}
  .card{background:#11111a;border:1px solid #1e1e2e;border-radius:8px;padding:18px}
  .dr:hover{background:rgba(0,210,190,0.05)!important}
  .sb{background:#00D2BE;color:#09090f;border:none;padding:9px 18px;cursor:pointer;font-family:'Bebas Neue';font-size:15px;letter-spacing:2px;border-radius:4px;font-weight:700;transition:all .2s}
  .sb:hover{background:#00b5a6}.sb:disabled{background:#222;color:#555;cursor:not-allowed}
  .ci{background:#1a1a24;border:1px solid #2a2a3a;color:#e8e8f0;padding:9px 12px;font-family:'Space Mono';font-size:11px;border-radius:4px;outline:none;flex:1}
  .ci:focus{border-color:#00D2BE}
  .rb{background:#11111a;border:1px solid #1e1e2e;color:#666;padding:4px 9px;cursor:pointer;font-family:'Space Mono';font-size:9px;border-radius:3px;transition:all .15s}
  .rb:hover,.rb.a{border-color:#00D2BE;color:#00D2BE;background:rgba(0,210,190,0.08)}
  .rb.gold{border-color:#FFD700;color:#FFD700;background:rgba(255,215,0,0.08)}
  .pulse{animation:pulse 2s infinite}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
  .si{animation:si .25s ease-out}@keyframes si{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
  .dot span{width:6px;height:6px;background:#00D2BE;border-radius:50%;animation:b 1.2s infinite;display:inline-block;margin:0 2px}
  .dot span:nth-child(2){animation-delay:.2s}.dot span:nth-child(3){animation-delay:.4s}
  @keyframes b{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
  .bf{transition:width .9s ease-out}
  .ab{font-family:'Bebas Neue';font-size:9px;padding:2px 5px;border-radius:2px;letter-spacing:1px}
`;

export default function F1RaceEngineer() {
  const [view,          setView]          = useState("dashboard");
  const [selectedRound, setSelectedRound] = useState(0);
  const [simSeed,       setSimSeed]       = useState(42);
  const [seasonData,    setSeasonData]    = useState(null);
  const [telemetry,     setTelemetry]     = useState(null);

  // All live data fetching is encapsulated in this hook
  const { liveResultsRef, liveStatus, liveCount, dataVersion } = useLiveData();

  // Rebuild season whenever the seed changes or fresh live data arrives
  useEffect(() => {
    setSeasonData(runFullSeason(simSeed, liveResultsRef.current));
  }, [simSeed, dataVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  // Rebuild telemetry whenever the selected round or season data changes
  useEffect(() => {
    if (!seasonData) return;
    const r = seasonData.raceResults[selectedRound];
    if (!r?.results?.length) return;
    let tel;
    try {
      tel = r.isLive && r.stints?.length > 0
        ? buildRealTelemetry(r.circuit, r, r.stints)
        : buildTelemetry(r.circuit, r);
    } catch { tel = null; }
    if (!tel || tel.length === 0) tel = buildTelemetry(r.circuit, r);
    setTelemetry(tel);
  }, [selectedRound, seasonData]);

  if (!seasonData) {
    return (
      <div style={{ background: "#09090f", color: "#00D2BE", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", letterSpacing: 4, flexDirection: "column", gap: 12 }}>
        <div>LOADING 2026 SEASON...</div>
        <div style={{ fontSize: 10, color: "#555" }}>
          {liveStatus === "loading" ? "FETCHING LIVE DATA FROM OPENF1..." : "BUILDING SIMULATION..."}
        </div>
      </div>
    );
  }

  const race        = seasonData.raceResults[selectedRound];
  const isLiveRound = race?.isLive;

  function handleSelectRound(idx) {
    setSelectedRound(idx);
    setView("telemetry");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#09090f", color: "#e8e8f0", fontFamily: "'Rajdhani','Bebas Neue',sans-serif" }}>
      <style>{GLOBAL_CSS}</style>

      <Header
        view={view}
        setView={setView}
        liveStatus={liveStatus}
        liveCount={liveCount}
        simSeed={simSeed}
        onResim={() => setSimSeed(s => s + 1)}
      />

      <div style={{ padding: 18, overflowY: "auto", maxHeight: "calc(100vh - 66px)" }}>
        {view === "dashboard"  && <DashboardView  seasonData={seasonData} liveCount={liveCount} selectedRound={selectedRound} />}
        {view === "standings"  && <StandingsView  seasonData={seasonData} liveCount={liveCount} simSeed={simSeed} />}
        {view === "calendar"   && <CalendarView   seasonData={seasonData} selectedRound={selectedRound} onSelectRound={handleSelectRound} />}
        {view === "telemetry"  && telemetry && (
          <TelemetryView
            race={race}
            telemetry={telemetry}
            selectedRound={selectedRound}
            isLiveRound={isLiveRound}
            onSelectRound={setSelectedRound}
          />
        )}
        {view === "engineer"   && (
          <EngineerView
            race={race}
            selectedRound={selectedRound}
            seasonData={seasonData}
            telemetry={telemetry}
            liveCount={liveCount}
            liveStatus={liveStatus}
          />
        )}
        {view === "lapmap"     && <LapMapTab />}
      </div>
    </div>
  );
}
