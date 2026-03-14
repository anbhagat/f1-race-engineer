// ─── 2026 XGBoost Feature Model Constants ────────────────────────────────────
// Team/driver performance coefficients used by the simulation engine.

export const TEAM_STRENGTH = {
  mercedes: 0.97, ferrari: 0.91, mclaren: 0.90, red_bull: 0.83,
  aston:    0.79, williams: 0.80, rb:      0.77, haas:     0.76,
  alpine:   0.78, audi:    0.74, cadillac: 0.70,
};

export const PU_BONUS = {
  mercedes: 0.05, honda: 0.01, ferrari: 0.00, rb_ford: -0.02, audi: -0.05,
};

// Indexed by CT_IDX: [technical, high_speed, street, balanced]
export const CIRCUIT_AFFINITY = {
  mercedes: [0.96, 1.00, 1.02, 0.99], ferrari:  [1.03, 1.04, 1.01, 1.00],
  mclaren:  [1.02, 1.06, 0.97, 1.01], red_bull: [1.07, 1.02, 0.96, 1.02],
  aston:    [0.99, 0.95, 0.93, 0.98], williams: [0.97, 1.00, 0.95, 0.98],
  rb:       [0.98, 0.99, 0.96, 0.97], haas:     [0.96, 0.98, 0.95, 0.97],
  alpine:   [0.97, 0.98, 0.98, 0.98], audi:     [0.95, 0.97, 0.94, 0.96],
  cadillac: [0.93, 0.94, 0.93, 0.94],
};

export const CT_IDX = { technical: 0, high_speed: 1, street: 2, balanced: 3 };

export const ERS_SKILL = {
  VER: 0.96, NOR: 0.93, HAM: 0.92, LEC: 0.91, RUS: 0.90, ALO: 0.89,
  PIA: 0.87, SAI: 0.86, ALB: 0.84, GAS: 0.83, OCO: 0.82, HUL: 0.81,
  TSU: 0.80, STR: 0.78, LAW: 0.78, BEA: 0.77, COL: 0.76, ANT: 0.75,
  BOT: 0.74, PER: 0.73, BOR: 0.72, LIN: 0.70,
};

// ─── System prompt (module-level so it's never recreated on render) ───────────
export const STATIC_SYSTEM = `You are a world-class F1 Race Engineer for the 2026 season. Be tactical, concise, and precise. Use F1 terminology. Reference ERS management, Active Aero, Overtake Mode, PU hierarchies, and specific driver/team data from the context provided.

2026 KEY REGULATIONS:
- 50/50 ICE+electric split, MGU-K 350kW, MGU-H deleted
- ERS: 9MJ/lap harvest (2×), lap-by-lap energy management critical
- Active Aero replaces DRS entirely (wings auto-adjust every straight)
- Overtake Mode: extra electric boost only when within 1s of car ahead
- Cars: 200mm shorter, 100mm narrower, 30kg lighter (770kg min)
- New: Audi (ex-Sauber), Cadillac (new, Ferrari PU)
- PU supply: Alpine/Williams/McLaren→Mercedes, Aston→Honda, RB/RB→Red Bull/Ford

PU HIERARCHY (R1 confirmed): 1.Mercedes(dominant) 2.Honda 3.Ferrari 4.RB/Ford 5.Audi
⚠️ FIA may revise Mercedes PU rules mid-season.

R1 ACTUAL — Australian GP (8 Mar 2026):
P1 Russell(MER) P2 Antonelli(MER-rookie) P3 Leclerc(FER) P4 Hamilton(FER) P5 Norris(MCL) P6 Verstappen(RBR,from P20) P7 Bearman(HAS) P8 Lindblad(RB-debut) P9 Bortoleto(AUD) P10 Gasly(ALP)
DNS: Piastri(sighting crash), Hülkenberg(technical). Ferrari VSC strategy error cost P1.`;
