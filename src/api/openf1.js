// ─── OpenF1 API Layer ─────────────────────────────────────────────────────────
// All network calls to api.openf1.org live here. No auth required for
// historical data. Note: OpenF1 blocks unauthenticated access while any live
// session is in progress; the app shows simulated data during that window.

import { OPENF1_BASE, NUM_TO_ID, SPRINT_PTS, POINTS } from "../data/f1Data";
import { CIRCUITS_2026 } from "../data/f1Data";

// ── Base fetch ────────────────────────────────────────────────────────────────
export async function openf1Fetch(path) {
  try {
    const r = await fetch(OPENF1_BASE + path, { cache: "no-store" });
    if (!r.ok) return [];
    return await r.json();
  } catch {
    return [];
  }
}

// ── Session fetchers ──────────────────────────────────────────────────────────
export async function fetchCompletedRaces() {
  const sessions = await openf1Fetch("/sessions?year=2026&session_name=Race");
  if (!Array.isArray(sessions)) return [];
  const now = Date.now();
  return sessions.filter(s => new Date(s.date_end).getTime() < now);
}

export async function fetchCompletedSprints() {
  const sessions = await openf1Fetch("/sessions?year=2026&session_name=Sprint");
  if (!Array.isArray(sessions)) return [];
  const now = Date.now();
  return sessions.filter(s => new Date(s.date_end).getTime() < now);
}

export async function fetchSessionResult(sessionKey) {
  return openf1Fetch(`/session_result?session_key=${sessionKey}`);
}

export async function fetchSessionStints(sessionKey) {
  return openf1Fetch(`/stints?session_key=${sessionKey}`);
}

// ── Circuit matching ──────────────────────────────────────────────────────────
// Handles multi-country collisions (ESP has Barcelona + Madrid, USA has 3 venues).
const LOCATION_HINTS = {
  "Melbourne":    0,  "Shanghai":    1,  "Suzuka":      2,  "Sakhir":      3,
  "Jeddah":       4,  "Miami":       5,  "Monte Carlo": 6,  "Barcelona":   7,
  "Montréal":     8,  "Madrid":      9,  "Spielberg":  10,  "Silverstone": 11,
  "Spa":         12,  "Budapest":   13,  "Zandvoort":  14,  "Monza":       15,
  "Baku":        16,  "Marina Bay": 17,  "Austin":     18,  "Mexico City": 19,
  "São Paulo":   20,  "Las Vegas":  21,  "Lusail":     22,  "Yas Marina":  23,
};

export function matchCircuitIndex(session) {
  const loc = (session.location || "").trim();
  for (const [hint, idx] of Object.entries(LOCATION_HINTS)) {
    if (loc.toLowerCase().includes(hint.toLowerCase())) return idx;
  }
  // Fallback: country code — only safe for countries with a single round
  const cc = (session.country_code || "").toUpperCase();
  const matches = CIRCUITS_2026
    .map((c, i) => (c.country === cc ? i : -1))
    .filter(i => i !== -1);
  return matches.length === 1 ? matches[0] : -1; // -1 = ambiguous, skip
}

// ── Result parsing ────────────────────────────────────────────────────────────
export function parseResult(raw, isSprint = false) {
  const pts = isSprint ? SPRINT_PTS : POINTS;
  return raw
    .sort((a, b) => a.position - b.position)
    .map(r => {
      const driverId = NUM_TO_ID[r.driver_number];
      if (!driverId) return null;
      const dnf    = !!(r.dnf || r.dns || r.dsq);
      const points = dnf ? 0 : (pts[r.position - 1] || 0);
      return { driverId, position: r.position, points, dnf };
    })
    .filter(Boolean);
}

// ── Anthropic chat (moved here to centralise all external API calls) ──────────
export async function sendChatMessage({ messages, systemPrompt, maxTokens = 400 }) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("VITE_ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key.");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "prompt-caching-2024-07-31",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: maxTokens,
      system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
      messages,
    }),
  });
  const data = await res.json();
  return data.content?.map(c => c.text || "").join("") || "No response.";
}
