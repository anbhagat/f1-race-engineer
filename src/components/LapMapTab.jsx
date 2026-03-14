import { useState, useRef, useEffect } from "react";
import { OPENF1_BASE } from "../data/f1Data";
import { sendChatMessage } from "../api/openf1";
import { drawRealTelemetry, formatLapTime } from "../canvas/renderer";

// ─── LapMapTab ────────────────────────────────────────────────────────────────
// Fetches the real fastest lap from the 2026 Australian GP via OpenF1, then
// renders GPS-accurate speed/throttle/brake telemetry on an HTML5 canvas.

const OVERLAY_OPTIONS = ["speed", "throttle", "brake"];

export default function LapMapTab() {
  const canvasRef = useRef(null);
  const [status,   setStatus]  = useState("idle"); // idle | loading | done | error
  const [lapInfo,  setLapInfo] = useState(null);
  const [telemetry,setTelemetry] = useState(null);
  const [aiText,   setAiText]  = useState("");
  const [aiLoad,   setAiLoad]  = useState(false);
  const [overlay,  setOverlay] = useState("speed");

  // Redraw whenever telemetry or selected overlay changes
  useEffect(() => {
    if (telemetry && canvasRef.current) {
      drawRealTelemetry(canvasRef.current, telemetry, overlay);
    }
  }, [telemetry, overlay]);

  async function fetchFastestLap() {
    setStatus("loading");
    setLapInfo(null);
    setTelemetry(null);
    setAiText("");
    try {
      // 1. Resolve session key for 2026 Australian GP
      const sessRes  = await fetch(`${OPENF1_BASE}/sessions?year=2026&country_name=Australia&session_name=Race`);
      const sessions = await sessRes.json();
      if (!sessions.length) throw new Error("No Australian GP session found");
      const sessionKey = sessions[0].session_key;

      // 2. Find the overall fastest lap
      const lapsRes  = await fetch(`${OPENF1_BASE}/laps?session_key=${sessionKey}`);
      const laps     = await lapsRes.json();
      const valid    = laps.filter(l => l.lap_duration && l.lap_duration > 60 && l.date_start);
      if (!valid.length) throw new Error("No valid laps found");
      const fastest  = valid.reduce((a, b) => a.lap_duration < b.lap_duration ? a : b);

      // 3. Driver info
      const drvRes  = await fetch(`${OPENF1_BASE}/drivers?session_key=${sessionKey}&driver_number=${fastest.driver_number}`);
      const drivers = await drvRes.json();
      const driver  = drivers[0] || { full_name: `Driver #${fastest.driver_number}`, name_acronym: "??", team_name: "Unknown" };

      const lapStart = fastest.date_start;
      const lapEnd   = new Date(new Date(lapStart).getTime() + fastest.lap_duration * 1000 + 5000).toISOString();

      setLapInfo({
        driver:    driver.full_name,
        acronym:   driver.name_acronym,
        team:      driver.team_name,
        lapTime:   formatLapTime(fastest.lap_duration),
        lapNum:    fastest.lap_number,
        driverNum: fastest.driver_number,
        sessionKey,
        lapStart,
        lapEnd,
        sectors: [fastest.duration_sector_1, fastest.duration_sector_2, fastest.duration_sector_3],
      });

      // 4. Fetch car data + GPS in parallel
      const [carRes, locRes] = await Promise.all([
        fetch(`${OPENF1_BASE}/car_data?session_key=${sessionKey}&driver_number=${fastest.driver_number}&date>=${lapStart}&date<=${lapEnd}`),
        fetch(`${OPENF1_BASE}/location?session_key=${sessionKey}&driver_number=${fastest.driver_number}&date>=${lapStart}&date<=${lapEnd}`),
      ]);
      const carData = await carRes.json();
      const locData = await locRes.json();
      if (!carData.length || !locData.length) throw new Error("No telemetry data for this lap");

      // 5. Merge by nearest timestamp
      carData.sort((a, b) => new Date(a.date) - new Date(b.date));
      locData.sort((a, b) => new Date(a.date) - new Date(b.date));

      const merged = carData.map(c => {
        const ct = new Date(c.date).getTime();
        let best = locData[0], bestDiff = Infinity;
        for (const l of locData) {
          const diff = Math.abs(new Date(l.date).getTime() - ct);
          if (diff < bestDiff) { bestDiff = diff; best = l; }
          else if (diff > bestDiff) break;
        }
        return { x: best.x, y: best.y, speed: c.speed, throttle: c.throttle, brake: c.brake, date: c.date };
      }).filter(p => p.x != null && p.y != null);

      if (merged.length < 10) throw new Error("Insufficient merged telemetry points");
      setTelemetry(merged);
      setStatus("done");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  }

  async function fetchDebrief() {
    if (!lapInfo || !telemetry) return;
    setAiLoad(true);
    const speeds      = telemetry.map(p => p.speed);
    const vMin        = Math.round(Math.min(...speeds));
    const vMax        = Math.round(Math.max(...speeds));
    const vAvg        = Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length);
    const heavyBrakes = telemetry.filter(p => p.brake > 60).length;
    const fullThrottle= telemetry.filter(p => p.throttle > 80).length;
    const pct         = v => ((v / telemetry.length) * 100).toFixed(0) + "%";
    try {
      const text = await sendChatMessage({
        messages: [{
          role: "user",
          content: `REAL FASTEST LAP TELEMETRY — 2026 Australian GP\nDriver: ${lapInfo.driver} (${lapInfo.team})\nLap: ${lapInfo.lapNum} | Time: ${lapInfo.lapTime}\nReal OpenF1 telemetry — ${telemetry.length} data points at 3.7Hz\nSpeed: min ${vMin} km/h, max ${vMax} km/h, avg ${vAvg} km/h\nFull throttle: ${pct(fullThrottle)} of lap | Heavy braking: ${pct(heavyBrakes)} of lap\nSectors: S1=${lapInfo.sectors[0]?.toFixed(3)}s S2=${lapInfo.sectors[1]?.toFixed(3)}s S3=${lapInfo.sectors[2]?.toFixed(3)}s\nProvide a 3-sentence debrief: (1) key insight from the speed trace, (2) where lap time was made or lost, (3) one setup recommendation.`,
        }],
        systemPrompt: "You are a world-class F1 race engineer. Analyse real telemetry data. Be precise and technical. 3 sentences only.",
        maxTokens: 300,
      });
      setAiText(text);
    } catch {
      setAiText("⚠️ Radio comms lost.");
    }
    setAiLoad(false);
  }

  // Derived stats for the currently-selected overlay
  const overlayVals = telemetry
    ? telemetry.map(p => overlay === "speed" ? p.speed : overlay === "throttle" ? p.throttle : p.brake)
    : null;
  const vMin = overlayVals ? Math.min(...overlayVals) : 0;
  const vMax = overlayVals ? Math.max(...overlayVals) : 100;
  const vAvg = overlayVals ? Math.round(overlayVals.reduce((a, b) => a + b, 0) / overlayVals.length) : 0;

  return (
    <div style={{ background: "#050508", borderRadius: 8, overflow: "hidden", border: "1px solid #1e1e2e" }}>

      {/* Header */}
      <div style={{ background: "#0d0d15", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, borderBottom: "1px solid #1a1a2e" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, letterSpacing: 4, color: "#00D2BE" }}>🗺 FASTEST LAP — REAL TELEMETRY</div>
          <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: "#555", letterSpacing: 2 }}>OpenF1 API · GPS XY + Speed/Throttle/Brake at 3.7Hz · Albert Park 2026</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {OVERLAY_OPTIONS.map(o => (
            <button key={o} onClick={() => setOverlay(o)} disabled={!telemetry}
              style={{ background: overlay===o?"rgba(0,210,190,0.08)":"#11111a", border: `1px solid ${overlay===o?"#00D2BE":"#1e1e2e"}`, color: overlay===o?"#00D2BE":"#555", padding: "4px 10px", cursor: "pointer", fontFamily: "'Bebas Neue',sans-serif", fontSize: 11, letterSpacing: 2, borderRadius: 3, transition: "all .2s" }}>
              {o.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Status / driver strip */}
      <div style={{ background: "#0a0a10", padding: "10px 16px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", borderBottom: "1px solid #111" }}>
        {status === "idle" && (
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={fetchFastestLap}
              style={{ background: "#00D2BE", color: "#050508", border: "none", padding: "8px 20px", cursor: "pointer", fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, letterSpacing: 3, borderRadius: 4, fontWeight: "bold" }}>
              ⬇ LOAD REAL TELEMETRY
            </button>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: "#555", lineHeight: 1.8 }}>
              Fetches live from OpenF1:<br />GPS coordinates · Speed · Throttle · Brake · Sector times
            </div>
          </div>
        )}
        {status === "loading" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
            {[
              "1. Fetching 2026 Australian GP session key...",
              "2. Scanning all laps → finding fastest lap_duration...",
              "3. Fetching driver info...",
              "4. Loading car_data (speed/throttle/brake at 3.7Hz)...",
              "5. Loading GPS location data (X/Y coordinates)...",
              "6. Merging telemetry streams by timestamp...",
            ].map((step, i) => (
              <div key={i} style={{ fontFamily: "'Space Mono'", fontSize: 8, color: "#444", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 6, height: 6, background: "#00D2BE", borderRadius: "50%", animation: "pulse 1s infinite", animationDelay: `${i*0.15}s` }} />
                {step}
              </div>
            ))}
          </div>
        )}
        {status === "error" && (
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: "#ff4444" }}>
              ⚠️ Failed to fetch telemetry — OpenF1 may not have 2026 Australian GP car_data yet.
            </div>
            <button onClick={fetchFastestLap}
              style={{ background: "#1a1a24", border: "1px solid #ff4444", color: "#ff4444", padding: "5px 12px", cursor: "pointer", fontFamily: "'Bebas Neue',sans-serif", fontSize: 11, letterSpacing: 2, borderRadius: 3 }}>
              RETRY
            </button>
          </div>
        )}
        {status === "done" && lapInfo && (
          <>
            <div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, letterSpacing: 3, color: "#FFD700" }}>{lapInfo.driver?.toUpperCase()}</div>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: "#555", marginTop: 1 }}>{lapInfo.team} · Lap {lapInfo.lapNum} · Albert Park 2026</div>
            </div>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: "#666" }}>FASTEST LAP</div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: 3, color: "#00D2BE" }}>{lapInfo.lapTime}</div>
            {lapInfo.sectors.map((s, i) => s && (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: ["#ff4444","#44ff88","#4488ff"][i] }}>S{i+1}</div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, color: "#ccc", letterSpacing: 1 }}>{s.toFixed(3)}s</div>
              </div>
            ))}
            {[["MIN",Math.round(vMin),"#ff4444"],["MAX",Math.round(vMax),"#00aaff"],["AVG",vAvg,"#00D2BE"]].map(([l, v, c]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: "#555" }}>{l} {overlay.toUpperCase()}</div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, color: c, letterSpacing: 2 }}>{v}{overlay==="speed"?" km/h":"%"}</div>
              </div>
            ))}
            <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: "#555" }}>
              <div style={{ color: "#22ff88" }}>● {telemetry?.length} telemetry points</div>
              <div>● Real GPS XY coords</div>
              <div>● 3.7Hz sample rate</div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <button onClick={fetchDebrief} disabled={aiLoad}
                style={{ background: "rgba(0,210,190,0.08)", border: "1px solid #00D2BE", color: aiLoad?"#444":"#00D2BE", padding: "5px 14px", cursor: "pointer", fontFamily: "'Bebas Neue',sans-serif", fontSize: 12, letterSpacing: 2, borderRadius: 3 }}>
                {aiLoad ? "⏳ ANALYSING..." : "🎙 AI DEBRIEF"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Canvas area */}
      <div style={{ position: "relative", background: "#050508", minHeight: 480 }}>
        {status === "idle" && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 480, flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 48, opacity: 0.3 }}>📡</div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 4, color: "#1a1a2e" }}>AWAITING TELEMETRY LOAD</div>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: "#2a2a3a", textAlign: "center", lineHeight: 1.8 }}>
              Press LOAD REAL TELEMETRY to fetch the actual fastest lap<br />
              GPS coordinates, speed, throttle and brake from OpenF1
            </div>
          </div>
        )}
        {status === "loading" && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 480 }}>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 10, color: "#00D2BE", letterSpacing: 4 }} className="pulse">FETCHING REAL TELEMETRY...</div>
          </div>
        )}
        {status === "error" && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 480, flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 36, opacity: 0.4 }}>⚠️</div>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: "#ff4444", textAlign: "center", lineHeight: 1.8 }}>
              OpenF1 may not have car_data for the 2026 Australian GP yet.<br />
              Car telemetry data (speed/throttle/brake) becomes available<br />
              shortly after the session ends. Try again later.
            </div>
          </div>
        )}
        <canvas ref={canvasRef} width={860} height={500}
          style={{ display: status==="done"?"block":"none", width: "100%", height: "auto", maxHeight: 500 }} />

        {/* Speed legend */}
        {status === "done" && (
          <div style={{ position: "absolute", bottom: 14, left: 14, display: "flex", flexDirection: "column", gap: 5 }}>
            {overlay === "speed" && [["#ff2200","HEAVY BRAKING"],["#ffcc00","CORNER EXIT"],["#88ff44","ACCELERATION"],["#00aaff","TOP SPEED"]].map(([c, l]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 22, height: 5, background: c, borderRadius: 2, flexShrink: 0 }} />
                <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: "#666", letterSpacing: 1 }}>{l}</div>
              </div>
            ))}
            {overlay === "throttle" && <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: "#88ff44" }}>GREEN = FULL THROTTLE · DARK = LIFT</div>}
            {overlay === "brake"    && <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: "#ff4444" }}>RED = HEAVY BRAKING · DARK = NO BRAKE</div>}
          </div>
        )}

        {/* Sector badges */}
        {status === "done" && lapInfo?.sectors && (
          <div style={{ position: "absolute", top: 12, left: 14, display: "flex", gap: 8 }}>
            {lapInfo.sectors.map((s, i) => s && (
              <div key={i} style={{ background: "rgba(0,0,0,0.7)", border: `1px solid ${["#ff4444","#44ff88","#4488ff"][i]}`, borderRadius: 3, padding: "3px 8px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 10, color: ["#ff4444","#44ff88","#4488ff"][i], letterSpacing: 2 }}>S{i+1}</div>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: "#aaa" }}>{s.toFixed(3)}s</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI debrief */}
      {aiText && (
        <div style={{ background: "#0d0d18", borderTop: "1px solid #1a1a2e", padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div style={{ width: 22, height: 22, background: "#00D2BE", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue',sans-serif", fontSize: 9, color: "#050508", fontWeight: "bold", flexShrink: 0, marginTop: 1 }}>RE</div>
          <div style={{ fontFamily: "'Space Mono'", fontSize: 11, color: "#ccc", lineHeight: 1.7, maxWidth: 760 }}>{aiText}</div>
        </div>
      )}

      {/* Pipeline footer */}
      <div style={{ background: "#0a0a10", borderTop: "1px solid #111", padding: "6px 16px", display: "flex", gap: 18, flexWrap: "wrap" }}>
        {[
          ["TELEMETRY", "Real OpenF1 car_data (speed/throttle/brake/DRS)"],
          ["GPS",       "Real OpenF1 location (X/Y/Z at 3.7Hz)"],
          ["FASTEST LAP","Auto-detected from all laps in session"],
          ["CACHE",     "Loaded once per session"],
          ["RENDER",    "HTML5 Canvas 2D, coloured by real data"],
        ].map(([k, v]) => (
          <div key={k} style={{ fontFamily: "'Space Mono'", fontSize: 7, color: "#333" }}>
            <span style={{ color: "#3a3a4a" }}>{k}: </span>
            <span style={{ color: "#4a4a5a" }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
