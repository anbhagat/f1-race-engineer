# F1 Virtual Race Engineer 2026

A React app that simulates the full 2026 F1 season, fetches live results from the [OpenF1 API](https://openf1.org), and lets you chat with an AI race engineer powered by Claude.

## Features

- **Live results** — completed races pulled automatically from OpenF1 (no auth needed)
- **Season simulation** — remaining rounds simulated with an XGBoost-inspired model (52 features: ERS skill, Active Aero, PU hierarchy, circuit affinity, and more)
- **Telemetry view** — per-driver stint strategy, ERS utilisation, speed, and tyre wear
- **Lap Map** — real GPS + speed/throttle/brake telemetry painted on an HTML5 canvas
- **AI Race Engineer** — ask strategy questions backed by live season context via Claude

## Getting started

### 1. Clone

```bash
git clone https://github.com/your-username/f1-race-engineer.git
cd f1-race-engineer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your Anthropic API key

```bash
cp .env.example .env
```

Open `.env` and replace the placeholder with your real key:

```
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

Get a key at [console.anthropic.com](https://console.anthropic.com/). The app uses **Claude Haiku** — very low cost (~$0.0002 per message with prompt caching).

> **Note:** The OpenF1 API (live race data) is completely free and requires no key.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Project structure

```
src/
  data/           — F1 constants (teams, drivers, circuits, model coefficients)
  api/            — OpenF1 + Anthropic fetch functions
  simulation/     — Pure race simulation engine (no React, fully testable)
  canvas/         — Canvas rendering utilities (lap map, speed colour scale)
  hooks/          — useLiveData: fetches completed 2026 races on mount
  components/
    views/        — DashboardView, StandingsView, CalendarView, TelemetryView, EngineerView
    Header.jsx
    LapMapTab.jsx
  F1RaceEngineer.jsx  — Root component (~130 lines)
```

## Security note

Your API key is read from the `.env` file at build time and embedded in the browser bundle — **do not deploy this publicly** without adding a backend proxy to keep the key server-side. For local use this is fine.
