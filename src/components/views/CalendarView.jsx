import { TEAMS_2026, FLAG_MAP } from "../../data/f1Data";

export default function CalendarView({ seasonData, selectedRound, onSelectRound }) {
  const nextRaceIdx = seasonData.raceResults.findIndex(r => !r.isLive);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 18, letterSpacing: 4, color: "#00D2BE" }}>
          2026 SEASON CALENDAR — 24 GRANDS PRIX
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, background: "#FFD700", borderRadius: 2 }} />
            <span style={{ fontFamily: "'Space Mono'", fontSize: 7, color: "#666" }}>COMPLETED</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, background: "#22ff88", borderRadius: 2 }} />
            <span style={{ fontFamily: "'Space Mono'", fontSize: 7, color: "#666" }}>NEXT RACE</span>
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 9 }}>
        {seasonData.raceResults.map((r, idx) => {
          const top3   = r.results.slice(0, 3);
          const isSel  = idx === selectedRound;
          const isAct  = r.isLive;
          const isNext = !isAct && idx === nextRaceIdx;

          const borderColor = isSel ? "#00D2BE" : isNext ? "#22ff88" : isAct ? "#FFD700" : "#1e1e2e";
          const bgColor     = isSel ? "#0d1a1a"  : isNext ? "#0d1a10"  : isAct ? "#1a1500"  : "#11111a";

          return (
            <div key={idx}
              onClick={() => onSelectRound(idx)}
              style={{
                background: bgColor,
                border: `1px solid ${borderColor}`,
                borderRadius: 6, padding: 11, cursor: "pointer", transition: "all .2s",
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontFamily: "'Bebas Neue'", fontSize: 10, color: "#555", letterSpacing: 2 }}>R{r.circuit.round}</span>
                  {isAct  && <span className="ab" style={{ background: "#FFD700", color: "#09090f" }}>ACTUAL</span>}
                  {isNext && <span className="ab" style={{ background: "#22ff88", color: "#09090f" }}>NEXT</span>}
                  {r.circuit.sprint && (
                    <span style={{ fontFamily: "'Bebas Neue'", fontSize: 8, background: "rgba(255,100,0,0.2)", color: "#ff6400", padding: "1px 4px", borderRadius: 2 }}>
                      SPRINT
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 14 }}>{FLAG_MAP[r.circuit.country] || "🏁"}</div>
              </div>
              <div style={{ fontFamily: "'Rajdhani'", fontWeight: 600, fontSize: 11, color: "#e8e8f0", marginBottom: 1 }}>
                {r.circuit.name.replace(" Grand Prix", " GP")}
              </div>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: "#555", marginBottom: 7 }}>
                {r.circuit.type.toUpperCase()}
              </div>
              <div style={{ display: "flex", gap: 2 }}>
                {top3.map((p, pi) => {
                  const team = TEAMS_2026.find(t => t.id === p.driver?.team);
                  return (
                    <div key={pi} style={{ flex: 1, background: "#0d0d15", borderRadius: 2, padding: "2px 4px", borderTop: `2px solid ${team?.color || "#333"}` }}>
                      <div style={{ fontFamily: "'Space Mono'", fontSize: 6, color: "#555" }}>P{pi+1}</div>
                      <div style={{ fontFamily: "'Rajdhani'", fontSize: 8, color: "#bbb", fontWeight: 600 }}>{p.driver?.id || "—"}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
