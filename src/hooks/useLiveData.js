// ─── useLiveData ──────────────────────────────────────────────────────────────
// Fetches all completed 2026 race and sprint results from OpenF1 on mount.
// Returns a stable ref to the live results map plus loading state.
//
// Note: OpenF1 blocks unauthenticated access during live sessions. The app
// gracefully falls back to fully simulated data during that window.

import { useEffect, useRef, useState } from "react";
import {
  fetchCompletedRaces,
  fetchCompletedSprints,
  fetchSessionResult,
  fetchSessionStints,
  matchCircuitIndex,
  parseResult,
} from "../api/openf1";

/**
 * @returns {{
 *   liveResultsRef: React.MutableRefObject<Map>,
 *   liveStatus: "loading" | "live" | "offline",
 *   liveCount: number,
 *   dataVersion: number,   // increments once when live data is ready
 * }}
 */
export function useLiveData() {
  const liveResultsRef = useRef(new Map());
  const [liveStatus, setLiveStatus]   = useState("loading");
  const [liveCount,  setLiveCount]    = useState(0);
  // Incrementing this signals consumers to rebuild season data.
  const [dataVersion, setDataVersion] = useState(0);
  // Incrementing this triggers a fresh fetch (used by the retry button).
  const [fetchTick,   setFetchTick]   = useState(0);

  const reload = () => {
    setLiveStatus("loading");
    setFetchTick(t => t + 1);
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLiveStatus("loading");
      try {
        const [races, sprints] = await Promise.all([
          fetchCompletedRaces(),
          fetchCompletedSprints(),
        ]);
        if (cancelled) return;

        // Pre-fetch all sprint results keyed by meeting
        const sprintByMeeting = new Map();
        for (const sp of sprints) {
          const raw = await fetchSessionResult(sp.session_key);
          if (cancelled) return;
          if (raw.length > 0) {
            sprintByMeeting.set(sp.meeting_key, parseResult(raw, true));
          }
        }

        const liveMap = new Map();
        for (const session of races) {
          const circuitIdx = matchCircuitIndex(session);
          if (circuitIdx === -1) continue;

          const [raw, stints] = await Promise.all([
            fetchSessionResult(session.session_key),
            fetchSessionStints(session.session_key),
          ]);
          if (cancelled) return;
          if (raw.length === 0) continue;

          liveMap.set(circuitIdx, {
            results:    parseResult(raw, false),
            sessionKey: session.session_key,
            stints,
            sprint:     sprintByMeeting.get(session.meeting_key) || null,
          });
        }

        if (cancelled) return;
        liveResultsRef.current = liveMap;
        setLiveCount(liveMap.size);
        setLiveStatus(liveMap.size > 0 ? "live" : "offline");
      } catch {
        if (!cancelled) setLiveStatus("offline");
      }

      if (!cancelled) setDataVersion(v => v + 1);
    }

    load();
    return () => { cancelled = true; };
  }, [fetchTick]); // re-runs when reload() is called

  return { liveResultsRef, liveStatus, liveCount, dataVersion, reload };
}
