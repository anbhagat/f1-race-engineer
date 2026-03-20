const VIEWS = [
  { id: "dashboard",  label: "📊 OVERVIEW"   },
  { id: "standings",  label: "🏆 STANDINGS"  },
  { id: "calendar",   label: "🗓 CALENDAR"   },
  { id: "telemetry",  label: "📡 TELEMETRY"  },
  { id: "lapmap",     label: "🗺 LAP MAP"    },
  { id: "engineer",   label: "🎙 ENGINEER"   },
];

export default function Header({ view, setView, liveStatus, liveCount, simSeed, onResim, onRetry }) {
  return (
    <div style={{ background: "#0d0d15", borderBottom: "2px solid #00D2BE", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 32, height: 32, background: "#00D2BE", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue'", fontSize: 14, color: "#09090f", fontWeight: "bold" }}>F1</div>
        <div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 18, letterSpacing: 4, color: "#00D2BE" }}>VIRTUAL RACE ENGINEER 2026</div>
          <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: "#444", letterSpacing: 2 }}>
            {liveCount} OF 24 RACES COMPLETED · AUTO-UPDATING VIA OPENF1
          </div>
        </div>
        {/* Live status badge */}
        <div style={{
          marginLeft: 10, display: "flex", alignItems: "center", gap: 6,
          background: liveStatus==="live"?"rgba(255,215,0,0.1)":liveStatus==="loading"?"rgba(0,210,190,0.08)":"rgba(100,100,100,0.1)",
          border: `1px solid ${liveStatus==="live"?"#FFD700":liveStatus==="loading"?"#00D2BE":"#555"}`,
          borderRadius: 4, padding: "3px 8px",
        }}>
          <span style={{ fontFamily: "'Space Mono'", fontSize: 8, color: liveStatus==="live"?"#FFD700":liveStatus==="loading"?"#00D2BE":"#888" }}>
            {liveStatus==="live"    ? `⭐ ${liveCount} LIVE RESULTS`
            : liveStatus==="loading" ? "⏳ FETCHING OPENF1..."
            : "⚠️ OFFLINE MODE"}
          </span>
          {liveStatus === "offline" && (
            <button onClick={onRetry} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontFamily: "'Space Mono'", fontSize: 8, padding: 0, textDecoration: "underline" }}>
              RETRY
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", gap: 1 }}>
        {VIEWS.map(v => (
          <button key={v.id} className={`nb ${view === v.id ? "a" : ""}`} onClick={() => setView(v.id)}>
            {v.label}
          </button>
        ))}
      </div>

      {/* Seed / resim */}
      <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: "#444" }}>
        SEED <span style={{ color: "#00D2BE" }}>{simSeed}</span>
        <button onClick={onResim}
          style={{ marginLeft: 6, background: "#1a1a24", border: "1px solid #333", color: "#888", padding: "2px 7px", cursor: "pointer", borderRadius: 3, fontSize: 9, fontFamily: "'Space Mono'" }}>
          RESIM
        </button>
      </div>
    </div>
  );
}
