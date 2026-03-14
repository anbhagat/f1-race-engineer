import { TEAMS_2026, POWER_UNITS_2026, NAT_FLAG } from "../../data/f1Data";

const MEDAL = ["#FFD700", "#C0C0C0", "#CD7F32"];

export default function StandingsView({ seasonData, liveCount, simSeed }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 20 }}>

      {/* Driver standings */}
      <div className="card">
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 18, letterSpacing: 4, color: "#00D2BE", marginBottom: 14 }}>
          DRIVERS CHAMPIONSHIP 2026
        </div>
        <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: "#555", marginBottom: 10 }}>
          {liveCount} live + R{liveCount+1}–R24 simulated (seed #{simSeed})
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1e1e2e" }}>
              {["POS","DRIVER","TEAM","PU","NAT","PTS"].map(h => (
                <th key={h} style={{ fontFamily: "'Bebas Neue'", fontSize: 10, color: "#444", letterSpacing: 2, textAlign: h === "PTS" ? "right" : "left", padding: "0 7px 10px" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {seasonData.driverStandings.map((d, i) => {
              const team = TEAMS_2026.find(t => t.id === d.team);
              const pu   = Object.entries(POWER_UNITS_2026).find(([, p]) => p.teams.includes(d.team));
              return (
                <tr key={d.id} className="dr" style={{ borderBottom: "1px solid #1a1a24" }}>
                  <td style={{ padding: "8px 7px", fontFamily: "'Bebas Neue'", fontSize: 16, color: i < 3 ? MEDAL[i] : "#444" }}>{i+1}</td>
                  <td style={{ padding: "8px 7px" }}>
                    <div style={{ fontFamily: "'Rajdhani'", fontWeight: 700, fontSize: 13, color: "#e8e8f0" }}>{d.name}</div>
                    <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: "#555" }}>#{d.num}{d.rookie ? " · ROOKIE" : ""}</div>
                  </td>
                  <td style={{ padding: "8px 7px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 7, height: 7, background: team?.color, borderRadius: "50%" }} />
                      <span style={{ fontFamily: "'Space Mono'", fontSize: 7, color: "#666" }}>{team?.chassis}</span>
                    </div>
                  </td>
                  <td style={{ padding: "8px 7px", fontFamily: "'Space Mono'", fontSize: 7, color: pu?.[0]==="mercedes"?"#00D2BE":"#666" }}>
                    {pu?.[0]?.toUpperCase() || "—"}
                  </td>
                  <td style={{ padding: "8px 7px", fontSize: 12 }}>{NAT_FLAG[d.nationality] || "🏳"}</td>
                  <td style={{ padding: "8px 7px", textAlign: "right", fontFamily: "'Space Mono'", fontSize: 12, fontWeight: 700, color: team?.color }}>
                    {d.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Constructor standings */}
      <div className="card">
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 18, letterSpacing: 4, color: "#00D2BE", marginBottom: 14 }}>
          CONSTRUCTORS 2026
        </div>
        {seasonData.constructorStandings.map((t, i) => {
          const max     = seasonData.constructorStandings[0].points;
          const pu      = Object.entries(POWER_UNITS_2026).find(([, p]) => p.teams.includes(t.id));
          const drivers = seasonData.driverStandings.filter(d => d.team === t.id);
          return (
            <div key={t.id} style={{ marginBottom: 14, padding: 12, background: "#0d0d15", borderRadius: 5, borderLeft: `3px solid ${t.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: i < 3 ? MEDAL[i] : "#444" }}>{i+1}</div>
                  <div>
                    <div style={{ fontFamily: "'Rajdhani'", fontWeight: 700, fontSize: 13, color: "#fff" }}>{t.name}</div>
                    <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: "#555" }}>
                      {t.chassis} · <span style={{ color: pu?.[0]==="mercedes"?"#00D2BE":"#777" }}>{pu?.[1]?.name}</span>
                    </div>
                  </div>
                </div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, color: t.color }}>{t.points}</div>
              </div>
              <div style={{ height: 4, background: "#1a1a24", borderRadius: 3, marginBottom: 6 }}>
                <div className="bf" style={{ height: "100%", width: `${(t.points/max)*100}%`, background: t.color, borderRadius: 3 }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {drivers.map(d => (
                  <div key={d.id} style={{ fontFamily: "'Space Mono'", fontSize: 8, color: "#777" }}>
                    {d.id} <span style={{ color: t.color }}>{d.points}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
