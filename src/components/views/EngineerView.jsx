import { useState, useRef, useEffect, useCallback } from "react";
import { TEAMS_2026 } from "../../data/f1Data";
import { STATIC_SYSTEM } from "../../data/modelData";
import { sendChatMessage } from "../../api/openf1";

const SUGGESTED_QUESTIONS = [
  "Why did Mercedes dominate R1?",
  "How does Active Aero affect strategy?",
  "Who wins the 2026 WDC?",
  "Can Verstappen overcome Red Bull's PU deficit?",
  "Hamilton or Leclerc — who leads Ferrari?",
  "Best ERS deployment at Monaco?",
  "Will FIA constrain Mercedes' PU?",
  "Antonelli's rookie chances of top 5 WDC?",
  "Piastri — title threat after DNS in R1?",
  "Predict Baku podium",
];

export default function EngineerView({ race, selectedRound, seasonData, telemetry, liveCount, liveStatus }) {
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [lastSent,  setLastSent]  = useState(0);
  const [cooldown,  setCooldown]  = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Build a compact dynamic context string to prepend to the first message each session
  const buildContext = useCallback(() => {
    if (!seasonData || !telemetry) return "";
    const top3 = race.results.slice(0, 3).map(r => `P${r.position}:${r.driver?.id}`).join(" ");
    const tel  = telemetry.slice(0, 3).map(t =>
      `${t.driver.id}:ERS${t.ersUtil}%,${t.ersHarvest}MJ,OM${t.overtakeMode}x,` +
      `stints:${(t.stints||[]).map(s=>`${(s.compound||"M")[0]}${s.stintLen}`).join("-")},gap:${t.gapToLeader}s`
    ).join(" | ");
    const wdc = seasonData.driverStandings.slice(0, 6).map(d=>`${d.position}.${d.id}:${d.points}`).join(" ");
    const wcc = seasonData.constructorStandings.slice(0, 5).map(t=>`${t.position}.${t.short}:${t.points}`).join(" ");
    return `LIVE_RACES:${liveCount} RACE:${race.circuit.name}(R${selectedRound+1},${race.isLive?"ACTUAL":"SIM"}) PODIUM:${top3} TEL:${tel} WDC:${wdc} WCC:${wcc}`;
  }, [seasonData, telemetry, selectedRound, race, liveCount]);

  async function send() {
    const msg = input.trim();
    if (!msg || loading) return;
    if (Date.now() - lastSent < 5000) return;
    setLastSent(Date.now());
    setCooldown(true);
    setTimeout(() => setCooldown(false), 5000);
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    const dynCtx = buildContext();
    const isSimple = msg.split(" ").length < 8;
    const history  = [...messages, { role: "user", content: msg }];
    const apiMsgs  = history.map((m, i) => ({
      role: m.role,
      content: i === 0 ? `${dynCtx}\n\n${m.content}` : m.content,
    }));

    try {
      const text = await sendChatMessage({
        messages:     apiMsgs,
        systemPrompt: STATIC_SYSTEM,
        maxTokens:    isSimple ? 250 : 600,
      });
      setMessages(prev => [...prev, { role: "assistant", content: text }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Radio comms lost." }]);
    }
    setLoading(false);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, height: "calc(100vh - 110px)" }}>

      {/* Sidebar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* RAG status */}
        <div className="card" style={{ borderColor: "#00D2BE", boxShadow: "0 0 15px rgba(0,210,190,0.1)" }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 12, letterSpacing: 3, color: "#00D2BE", marginBottom: 8 }}>📡 RAG CONTEXT</div>
          <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: "#555", lineHeight: 2 }}>
            <div style={{ color: "#22ff88" }}>● OPENF1 API CONNECTED</div>
            <div style={{ color: liveStatus === "live" ? "#FFD700" : "#555" }}>● {liveCount} RACES LIVE DATA</div>
            <div style={{ color: "#22ff88" }}>● 2026 ERS MODEL ACTIVE</div>
            <div style={{ color: "#22ff88" }}>● PU HIERARCHY CALIBRATED</div>
            <div style={{ color: "#555" }}>● SIM: R{liveCount+1}–R24</div>
          </div>
          <div style={{ marginTop: 10, borderTop: "1px solid #1e1e2e", paddingTop: 10 }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 10, letterSpacing: 2, color: "#00D2BE", marginBottom: 6 }}>COST OPTIMISATIONS</div>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: "#555", lineHeight: 2 }}>
              <div style={{ color: "#4fa" }}>✓ Haiku 4.5 (3× cheaper)</div>
              <div style={{ color: "#4fa" }}>✓ Prompt caching (−80%)</div>
              <div style={{ color: "#4fa" }}>✓ Trimmed context (−30%)</div>
              <div style={{ color: "#4fa" }}>✓ Adaptive max_tokens</div>
              <div style={{ color: "#4fa" }}>✓ 5s send debounce</div>
              <div style={{ color: "#00D2BE", marginTop: 4 }}>~$0.0002 per message</div>
            </div>
          </div>
        </div>

        {/* Active race mini-summary */}
        <div className="card">
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 12, letterSpacing: 3, color: "#00D2BE", marginBottom: 6 }}>ACTIVE RACE</div>
          <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: "#777" }}>{race.circuit.name}</div>
          <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: "#555", marginTop: 2 }}>R{selectedRound+1} · {race.circuit.type}</div>
          <div style={{ marginTop: 8 }}>
            {race.results.slice(0, 3).map((r, i) => {
              const team = TEAMS_2026.find(t => t.id === r.driver?.team);
              return (
                <div key={r.driver?.id} style={{ display: "flex", gap: 5, alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontFamily: "'Bebas Neue'", fontSize: 13, color: ["#FFD700","#C0C0C0","#CD7F32"][i] }}>P{i+1}</span>
                  <div style={{ width: 2, height: 16, background: team?.color }} />
                  <span style={{ fontFamily: "'Space Mono'", fontSize: 8, color: "#bbb" }}>{r.driver?.name?.split(" ")[1]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Suggested questions */}
        <div className="card" style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 12, letterSpacing: 3, color: "#00D2BE", marginBottom: 8 }}>SUGGESTED</div>
          {SUGGESTED_QUESTIONS.map(q => (
            <div key={q} onClick={() => setInput(q)}
              style={{ fontFamily: "'Space Mono'", fontSize: 7, color: "#555", padding: "5px 7px", background: "#0d0d15", borderRadius: 3, marginBottom: 4, cursor: "pointer", borderLeft: "2px solid transparent", transition: "all .15s" }}
              onMouseEnter={e => { e.currentTarget.style.color="#00D2BE"; e.currentTarget.style.borderLeftColor="#00D2BE"; }}
              onMouseLeave={e => { e.currentTarget.style.color="#555";    e.currentTarget.style.borderLeftColor="transparent"; }}>
              {q}
            </div>
          ))}
        </div>
      </div>

      {/* Chat panel */}
      <div className="card" style={{ display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
        {/* Chat header */}
        <div style={{ padding: "12px 18px", borderBottom: "1px solid #1e1e2e", display: "flex", alignItems: "center", gap: 8, background: "#0d0d15" }}>
          <div style={{ width: 7, height: 7, background: "#22ff88", borderRadius: "50%" }} className="pulse" />
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 16, letterSpacing: 3, color: "#00D2BE" }}>VIRTUAL RACE ENGINEER — 2026 SEASON</div>
          <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: "#555" }}>RAG · ERS · OPENF1 LIVE · {liveCount} ACTUAL RACES</div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🎙</div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 16, color: "#222", letterSpacing: 3 }}>RACE ENGINEER ONLINE</div>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: "#2a2a3a", marginTop: 8, lineHeight: 2 }}>
                {liveCount} race{liveCount !== 1 ? "s" : ""} loaded from OpenF1 · 2026 regs active<br />
                Ask about race strategy, championship predictions,<br />
                ERS tactics, or driver performance analysis.
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className="si" style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              {msg.role === "assistant" && (
                <div style={{ width: 24, height: 24, background: "#00D2BE", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue'", fontSize: 10, marginRight: 7, flexShrink: 0, marginTop: 3, color: "#09090f", fontWeight: "bold" }}>RE</div>
              )}
              <div style={{
                maxWidth: "76%", padding: "10px 13px",
                borderRadius: msg.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                background: msg.role === "user" ? "#001a18" : "#13131e",
                border: `1px solid ${msg.role === "user" ? "#00D2BE" : "#1e1e2e"}`,
                fontFamily: "'Rajdhani'", fontSize: 13, lineHeight: 1.6,
                color: msg.role === "user" ? "#b0ffe8" : "#e0e0f0",
                whiteSpace: "pre-wrap",
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 24, height: 24, background: "#00D2BE", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#09090f", fontWeight: "bold", fontFamily: "'Bebas Neue'" }}>RE</div>
              <div style={{ background: "#13131e", border: "1px solid #1e1e2e", borderRadius: "12px 12px 12px 4px", padding: "11px 15px" }}>
                <div className="dot"><span /><span /><span /></div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input bar */}
        <div style={{ padding: 12, borderTop: "1px solid #1e1e2e", display: "flex", gap: 8, background: "#0d0d15" }}>
          <input className="ci" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Ask the Race Engineer... e.g. 'Who wins the WDC?' or 'Why is Mercedes so fast?'" />
          <button className="sb" onClick={send} disabled={loading || !input.trim() || cooldown}>
            {loading ? "..." : cooldown ? "WAIT ⏱" : "TRANSMIT"}
          </button>
        </div>
      </div>

    </div>
  );
}
