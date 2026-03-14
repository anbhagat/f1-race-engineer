import { TEAMS_2026, CIRCUITS_2026, FLAG_MAP } from "../../data/f1Data";

const COMPOUND_COLOR = { SOFT: "#ff1801", MEDIUM: "#FFD700", HARD: "#e8e8f0" };
const MEDAL = ["#FFD700", "#C0C0C0", "#CD7F32"];

const XGBOOST_FEATURES = [
  { n: "driver_rating",    v: 0.94, c: "Driver"   },
  { n: "team_strength",    v: 0.91, c: "Car"       },
  { n: "pu_advantage",     v: 0.89, c: "2026 NEW"  },
  { n: "ers_skill",        v: 0.87, c: "2026 NEW"  },
  { n: "active_aero_eff",  v: 0.85, c: "2026 NEW"  },
  { n: "overtake_mode",    v: 0.83, c: "2026 NEW"  },
  { n: "circuit_affinity", v: 0.81, c: "Circuit"   },
  { n: "tire_management",  v: 0.79, c: "Strategy"  },
  { n: "reliability",      v: 0.77, c: "Car"       },
  { n: "energy_harvest",   v: 0.75, c: "2026 NEW"  },
  { n: "boost_btn",        v: 0.72, c: "2026 NEW"  },
  { n: "dnf_risk",         v: 0.68, c: "Risk"      },
];
const FEATURE_COLORS = { Driver: "#4af", Car: "#fa4", Circuit: "#4fa", Strategy: "#a4f", Risk: "#f44" };

const TEL_ROWS = [
  ["AVG SPEED",    t => `${t.avgSpeed} km/h`,          "#4af"],
  ["TOP SPEED",    t => `${t.topSpeed} km/h`,          "#fa4"],
  ["ERS UTIL",     t => `${t.ersUtil}%`,               "#00D2BE"],
  ["ERS HARVEST",  t => `${t.ersHarvest}MJ/L`,         "#4fa"],
  ["OVERTAKE MODE",t => `${t.overtakeMode}×`,          "#a4f"],
  ["ACTIVE AERO",  t => t.activeAeroChanges,            "#f84"],
  ["TIRE WEAR",    t => `${t.tireWear}%`,              "#f44"],
  ["GAP",          t => t.position === 1 ? "LEADER" : `+${t.gapToLeader}s`, null],
];

export default function TelemetryView({ race, telemetry, selectedRound, isLiveRound, onSelectRound }) {
  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 18, letterSpacing: 4, color: "#00D2BE" }}>
          📡 {race.circuit.name.toUpperCase()}
        </div>
        <span className="ab" style={{ background: isLiveRound ? "#FFD700" : "#1e1e2e", color: isLiveRound ? "#09090f" : "#555" }}>
          {isLiveRound ? "ACTUAL" : "SIMULATED"}
        </span>
        <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: "#555" }}>
          R{selectedRound+1}/24 · {race.circuit.laps}L · {race.circuit.type.toUpperCase()}
        </div>
      </div>

      {/* Round selector */}
      <div style={{ display: "flex", gap: 5, marginBottom: 14, flexWrap: "wrap" }}>
        {CIRCUITS_2026.map((c, idx) => (
          <button key={idx} className={`rb ${idx===selectedRound?"a":""}`}
            onClick={() => onSelectRound(idx)}>
            {FLAG_MAP[c.country] || "🏁"} R{c.round}
          </button>
        ))}
      </div>

      {/* Telemetry cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
        {telemetry.map((t, i) => {
          const team = TEAMS_2026.find(tm => tm.id === t.driver.team);
          return (
            <div key={t.driver.id} className="card si" style={{ borderTop: `3px solid ${team?.color}`, position: "relative" }}>
              <div style={{ position: "absolute", top: 10, right: 12, fontFamily: "'Bebas Neue'", fontSize: 26, color: "rgba(255,255,255,0.04)" }}>
                P{t.position}
              </div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: i < 3 ? MEDAL[i] : "#777", marginBottom: 2 }}>P{t.position}</div>
              <div style={{ fontFamily: "'Rajdhani'", fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 1 }}>{t.driver.name}</div>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: "#555", marginBottom: 10 }}>
                {team?.chassis} · {team?.pu?.toUpperCase()}
              </div>
              {TEL_ROWS.map(([label, getValue, color]) => {
                const c = color || team?.color;
                return (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, paddingBottom: 5, borderBottom: "1px solid #1a1a24" }}>
                    <span style={{ fontFamily: "'Space Mono'", fontSize: 7, color: "#555" }}>{label}</span>
                    <span style={{ fontFamily: "'Space Mono'", fontSize: 8, color: c, fontWeight: 700 }}>{getValue(t)}</span>
                  </div>
                );
              })}
              <div style={{ marginTop: 7 }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 9, letterSpacing: 2, color: "#444", marginBottom: 5 }}>STINT STRATEGY</div>
                <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                  {(t.stints || []).map((s, si) => {
                    const cc = COMPOUND_COLOR[s.compound] || "#888";
                    return (
                      <div key={si} style={{ background: cc+"22", border: `1px solid ${cc}`, borderRadius: 3, padding: "2px 5px" }}>
                        <div style={{ fontFamily: "'Space Mono'", fontSize: 6, color: cc }}>{(s.compound||"?")[0]}</div>
                        <div style={{ fontFamily: "'Space Mono'", fontSize: 6, color: "#888" }}>{s.stintLen}L</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* XGBoost feature pipeline */}
      <div className="card" style={{ marginTop: 14 }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 13, letterSpacing: 3, color: "#00D2BE", marginBottom: 12 }}>
          ⚙️ 2026 XGBOOST FEATURE PIPELINE (52 DIMS)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 7 }}>
          {XGBOOST_FEATURES.map(f => {
            const isNew = f.c === "2026 NEW";
            const cc = isNew ? "#00D2BE" : (FEATURE_COLORS[f.c] || "#888");
            return (
              <div key={f.n} style={{ background: "#0d0d15", borderRadius: 3, padding: 9, border: isNew ? "1px solid rgba(0,210,190,0.25)" : "1px solid transparent" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 3 }}>
                  <span style={{ fontFamily: "'Space Mono'", fontSize: 6, color: cc }}>{f.c}</span>
                  {isNew && <span style={{ fontFamily: "'Space Mono'", fontSize: 5, background: "rgba(0,210,190,0.2)", color: "#00D2BE", padding: "0 2px", borderRadius: 2 }}>NEW</span>}
                </div>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: "#666", marginBottom: 6 }}>{f.n}</div>
                <div style={{ height: 2, background: "#1a1a24", borderRadius: 2 }}>
                  <div style={{ height: "100%", width: `${f.v*100}%`, background: cc, borderRadius: 2 }} />
                </div>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: cc, marginTop: 3 }}>{(f.v*100).toFixed(0)}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
