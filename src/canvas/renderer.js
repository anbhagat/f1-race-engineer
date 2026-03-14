// ─── Canvas Rendering Utilities ───────────────────────────────────────────────
// Pure functions — no React, no DOM side-effects beyond the canvas passed in.
// Covers both the simulated lap-map (generated paths) and real GPS telemetry.

// ── Colour mapping ────────────────────────────────────────────────────────────
// Returns [r, g, b] for a speed/metric value in [vMin, vMax].
// Gradient: red (slow) → orange → yellow-green → cyan (fast).
export function speedColor(v, vMin, vMax) {
  const t = Math.max(0, Math.min(1, (v - vMin) / (vMax - vMin)));
  if (t < 0.25) { const s = t / 0.25;        return [220 + Math.round(s * 35),  Math.round(s * 100),          0]; }
  if (t < 0.50) { const s = (t - 0.25)/0.25; return [255,                        100 + Math.round(s * 155),    0]; }
  if (t < 0.75) { const s = (t - 0.50)/0.25; return [255 - Math.round(s * 200),  255,                          Math.round(s * 60)]; }
  const s = (t - 0.75) / 0.25;
  return [Math.round(55 - s * 55), 255 - Math.round(s * 55), 60 + Math.round(s * 195)];
}

export function formatLapTime(seconds) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(3).padStart(6, "0");
  return `${m}:${s}`;
}

// ── Simulated circuit paths ───────────────────────────────────────────────────
export function generateCircuitPath(name) {
  const circuits = {
    "Albert Park": () => {
      const pts = [];
      pts.push([0.42, 0.90]);
      for (let i=1;i<=4;i++) { const a=Math.PI+i*(Math.PI*0.10)/4; pts.push([0.44+0.02*Math.cos(a),0.90+0.02*Math.sin(a)]); }
      for (let i=1;i<=4;i++) { const a=Math.PI*1.1+i*(Math.PI*0.12)/4; pts.push([0.50+0.03*Math.cos(a),0.90+0.03*Math.sin(a)]); }
      for (let i=1;i<=22;i++) pts.push([0.54+i*0.017, 0.90]);
      for (let i=1;i<=20;i++) { const a=Math.PI+i*Math.PI/20; pts.push([0.91+0.05*Math.cos(a),0.87+0.05*Math.sin(a)]); }
      for (let i=1;i<=7;i++) pts.push([0.93, 0.82-i*0.032]);
      for (let i=1;i<=7;i++) { const a=0+i*(Math.PI*0.25)/7; pts.push([0.91+0.04*Math.cos(a),0.59+0.04*Math.sin(a)]); }
      for (let i=1;i<=14;i++) { const a=Math.PI*0.25+i*(Math.PI*0.50)/14; pts.push([0.85+0.09*Math.cos(a),0.46+0.09*Math.sin(a)]); }
      for (let i=1;i<=8;i++) pts.push([0.74-i*0.018, 0.30-i*0.008]);
      for (let i=1;i<=28;i++) { const a=-Math.PI*0.1+i*(Math.PI*0.85)/28; pts.push([0.50+0.22*Math.cos(a),0.18+0.16*Math.sin(a)]); }
      for (let i=1;i<=14;i++) { const a=Math.PI*0.75+i*(Math.PI*0.60)/14; pts.push([0.17+0.06*Math.cos(a),0.26+0.06*Math.sin(a)]); }
      for (let i=1;i<=10;i++) pts.push([0.12, 0.34+i*0.022]);
      for (let i=1;i<=10;i++) { const a=Math.PI*1.5+i*(Math.PI*0.42)/10; pts.push([0.14+0.06*Math.cos(a),0.58+0.06*Math.sin(a)]); }
      for (let i=1;i<=11;i++) pts.push([0.19+i*0.013, 0.65+i*0.003]);
      for (let i=1;i<=12;i++) { const a=Math.PI+i*(Math.PI*0.55)/12; pts.push([0.35+0.07*Math.cos(a),0.64+0.07*Math.sin(a)]); }
      for (let i=1;i<=14;i++) pts.push([0.41+i*0.022, 0.58-i*0.005]);
      for (let i=1;i<=20;i++) { const a=Math.PI*1.5+i*Math.PI/20; pts.push([0.73+0.05*Math.cos(a),0.50+0.05*Math.sin(a)]); }
      for (let i=1;i<=6;i++) pts.push([0.76, 0.57+i*0.017]);
      for (let i=1;i<=8;i++) { const a=-Math.PI*0.08+i*(Math.PI*0.42)/8; pts.push([0.74+0.04*Math.cos(a),0.69+0.04*Math.sin(a)]); }
      for (let i=1;i<=8;i++) { const a=Math.PI*0.34+i*(Math.PI*0.32)/8; pts.push([0.67+0.04*Math.cos(a),0.75+0.04*Math.sin(a)]); }
      for (let i=1;i<=9;i++) { const a=Math.PI*0.66+i*(Math.PI*0.38)/9; pts.push([0.58+0.04*Math.cos(a),0.86+0.04*Math.sin(a)]); }
      for (let i=1;i<=5;i++) pts.push([0.48-i*0.012, 0.90]);
      return pts;
    },
    "Shanghai": () => {
      const pts = [];
      for (let i=0;i<=25;i++) pts.push([0.25+i*0.024,0.82]);
      for (let i=1;i<=20;i++) { const a=-Math.PI/2+i*Math.PI/20; pts.push([0.85+0.07*Math.cos(a),0.75+0.07*Math.sin(a)]); }
      for (let i=1;i<=18;i++) pts.push([0.78-i*0.018,0.68]);
      for (let i=1;i<=8;i++) { const a=Math.PI+i*(Math.PI/3)/8; pts.push([0.44+0.05*Math.cos(a),0.61+0.05*Math.sin(a)]); }
      for (let i=1;i<=8;i++) { const a=4*Math.PI/3+i*(Math.PI/3)/8; pts.push([0.36+0.05*Math.cos(a),0.56+0.05*Math.sin(a)]); }
      for (let i=1;i<=22;i++) pts.push([0.28,0.50-i*0.012]);
      for (let i=1;i<=14;i++) { const a=3*Math.PI/2+i*(Math.PI*2/3)/14; pts.push([0.28+0.08*Math.cos(a),0.22+0.08*Math.sin(a)]); }
      for (let i=1;i<=10;i++) pts.push([0.26+i*0.025,0.26]);
      for (let i=1;i<=12;i++) { const a=-Math.PI/6+i*(Math.PI/2)/12; pts.push([0.52+0.06*Math.cos(a),0.26+0.06*Math.sin(a)]); }
      for (let i=1;i<=16;i++) pts.push([0.45,0.38+i*0.028]);
      for (let i=1;i<=10;i++) { const a=Math.PI+i*(Math.PI/2)/10; pts.push([0.33+0.08*Math.cos(a),0.82+0.08*Math.sin(a)]); }
      return pts;
    },
    "Suzuka": () => {
      const pts = [];
      for (let i=0;i<=20;i++) pts.push([0.38+i*0.015,0.75]);
      for (let i=1;i<=16;i++) { const a=-Math.PI/2+i*Math.PI/16; pts.push([0.68+0.05*Math.cos(a),0.75+0.05*Math.sin(a)]); }
      for (let i=1;i<=8;i++) { const a=Math.PI/2+i*(Math.PI/3)/8; pts.push([0.70+0.04*Math.cos(a),0.60+0.04*Math.sin(a)]); }
      for (let i=1;i<=8;i++) { const a=5*Math.PI/6-i*(Math.PI/3)/8; pts.push([0.65+0.04*Math.cos(a),0.52+0.04*Math.sin(a)]); }
      for (let i=1;i<=14;i++) { const a=i*Math.PI/14; pts.push([0.60+0.07*Math.cos(a),0.38+0.07*Math.sin(a)]); }
      for (let i=1;i<=10;i++) pts.push([0.48,0.32-i*0.01]);
      for (let i=1;i<=12;i++) { const a=Math.PI+i*(Math.PI*2/3)/12; pts.push([0.35+0.06*Math.cos(a),0.22+0.06*Math.sin(a)]); }
      for (let i=1;i<=12;i++) pts.push([0.24,0.28+i*0.02]);
      for (let i=1;i<=18;i++) { const a=3*Math.PI/2+i*(Math.PI*2/3)/18; pts.push([0.22+0.10*Math.cos(a),0.55+0.10*Math.sin(a)]); }
      for (let i=1;i<=8;i++) { const a=i*(Math.PI/4)/8; pts.push([0.27+0.04*Math.cos(a),0.68+0.04*Math.sin(a)]); }
      for (let i=1;i<=14;i++) pts.push([0.21+i*0.012,0.75]);
      return pts;
    },
    "Monaco": () => {
      const pts = [];
      for (let i=0;i<=15;i++) pts.push([0.42+i*0.02,0.82]);
      for (let i=1;i<=10;i++) { const a=-Math.PI/2+i*(Math.PI/2)/10; pts.push([0.72+0.04*Math.cos(a),0.82+0.04*Math.sin(a)]); }
      for (let i=1;i<=10;i++) pts.push([0.76,0.74-i*0.018]);
      for (let i=1;i<=10;i++) { const a=i*(Math.PI/2)/10; pts.push([0.76+0.05*Math.cos(a),0.56+0.05*Math.sin(a)]); }
      for (let i=1;i<=8;i++) { const a=Math.PI/2+i*(Math.PI/3)/8; pts.push([0.74+0.04*Math.cos(a),0.50+0.04*Math.sin(a)]); }
      for (let i=1;i<=18;i++) { const a=5*Math.PI/6+i*(Math.PI*2/3)/18; pts.push([0.65+0.04*Math.cos(a),0.42+0.04*Math.sin(a)]); }
      for (let i=1;i<=8;i++) pts.push([0.56,0.36+i*0.012]);
      for (let i=1;i<=10;i++) { const a=3*Math.PI/2+i*(Math.PI/2)/10; pts.push([0.50+0.05*Math.cos(a),0.50+0.05*Math.sin(a)]); }
      for (let i=1;i<=20;i++) pts.push([0.38-i*0.014,0.55]);
      for (let i=1;i<=8;i++) { const a=Math.PI+i*(Math.PI/3)/8; pts.push([0.18+0.03*Math.cos(a),0.58+0.03*Math.sin(a)]); }
      for (let i=1;i<=8;i++) { const a=4*Math.PI/3+i*(Math.PI/3)/8; pts.push([0.14+0.03*Math.cos(a),0.62+0.03*Math.sin(a)]); }
      for (let i=1;i<=8;i++) pts.push([0.18+i*0.015,0.67]);
      for (let i=1;i<=12;i++) { const a=i*(Math.PI)/12; pts.push([0.30+0.05*Math.cos(a),0.73+0.05*Math.sin(a)]); }
      for (let i=1;i<=10;i++) pts.push([0.28+i*0.014,0.82]);
      return pts;
    },
  };
  return (circuits[name] || circuits["Albert Park"])();
}

// ── Speed profile from curvature ─────────────────────────────────────────────
export function generateSpeedProfile(pts, circuit) {
  const n = pts.length;
  const curvature = new Array(n).fill(0);
  for (let i = 1; i < n - 1; i++) {
    const dx1 = pts[i][0]-pts[i-1][0], dy1 = pts[i][1]-pts[i-1][1];
    const dx2 = pts[i+1][0]-pts[i][0], dy2 = pts[i+1][1]-pts[i][1];
    const cross = Math.abs(dx1*dy2 - dy1*dx2);
    const mag   = Math.sqrt(dx1*dx1+dy1*dy1) + Math.sqrt(dx2*dx2+dy2*dy2) + 1e-9;
    curvature[i] = cross / mag;
  }
  const vMax = { Monaco: 290, Suzuka: 315, Shanghai: 325 }[circuit] || 305;
  const vMin = { Monaco:  55, Suzuka:  70 }[circuit] || 75;
  const raw  = new Array(n);
  for (let i = 0; i < n; i++) raw[i] = Math.max(vMin, Math.min(vMax, vMax - curvature[i] * 3400));
  for (let i = 1; i < n; i++)     raw[i] = Math.min(raw[i], raw[i-1] + 16);   // acceleration
  for (let i = n-2; i >= 0; i--) raw[i] = Math.min(raw[i], raw[i+1] + 32);   // braking
  const spd = [...raw];
  for (let p = 0; p < 3; p++)
    for (let i = 1; i < n-1; i++)
      spd[i] = (raw[i-1] + raw[i]*2 + raw[i+1]) / 4;
  return spd;
}

// ── Draw simulated lap map (generated path + curvature-based speed) ───────────
export function drawLapMap(canvas, pts, speed) {
  if (!canvas || !pts.length) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#050508"; ctx.fillRect(0, 0, W, H);

  const pad = 56, cbGap = 44, drawW = W - pad*2 - cbGap;
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = Math.min(...ys), yMax = Math.max(...ys);
  const sc = Math.min(drawW / (xMax-xMin||1), (H-pad*2) / (yMax-yMin||1));
  const ox = pad + (drawW - (xMax-xMin)*sc) / 2;
  const oy = pad + ((H-pad*2) - (yMax-yMin)*sc) / 2;
  const tx = x => ox + (x-xMin)*sc;
  const ty = y => oy + (y-yMin)*sc;
  const vMin = Math.min(...speed), vMax = Math.max(...speed), n = pts.length;

  // Track outline
  ctx.beginPath();
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(tx(p[0]),ty(p[1])) : ctx.lineTo(tx(p[0]),ty(p[1])));
  ctx.closePath();
  ctx.strokeStyle="rgba(255,255,255,0.08)"; ctx.lineWidth=18; ctx.lineJoin="round"; ctx.lineCap="round"; ctx.stroke();
  ctx.strokeStyle="rgba(255,255,255,0.04)"; ctx.lineWidth=22; ctx.stroke();

  // Speed-coloured segments
  for (let i = 0; i < n-1; i++) {
    const [r,g,b] = speedColor(speed[i], vMin, vMax);
    ctx.beginPath(); ctx.moveTo(tx(pts[i][0]),ty(pts[i][1])); ctx.lineTo(tx(pts[i+1][0]),ty(pts[i+1][1]));
    ctx.strokeStyle=`rgb(${r},${g},${b})`; ctx.lineWidth=7; ctx.lineJoin="round"; ctx.lineCap="round"; ctx.stroke();
  }

  // Braking glow
  const brake = [];
  for (let i = 1; i < n; i++) { const dv = speed[i]-speed[i-1]; brake.push(dv < 0 ? Math.min(100,-dv*5) : 0); }
  brake.unshift(brake[0]);
  for (let i = 0; i < n-1; i++) {
    if (brake[i] > 50) {
      const inten = (brake[i]-50)/50;
      ctx.beginPath(); ctx.moveTo(tx(pts[i][0]),ty(pts[i][1])); ctx.lineTo(tx(pts[i+1][0]),ty(pts[i+1][1]));
      ctx.strokeStyle=`rgba(255,20,0,${inten*0.5})`; ctx.lineWidth=16+inten*8; ctx.lineCap="round"; ctx.stroke();
    }
  }

  // S/F chequered marker
  const sfX=tx(pts[0][0]), sfY=ty(pts[0][1]);
  const ang=Math.atan2(ty(pts[1][1])-sfY, tx(pts[1][0])-sfX)+Math.PI/2;
  ctx.save(); ctx.translate(sfX,sfY); ctx.rotate(ang);
  for (let b=0; b<8; b++) {
    ctx.fillStyle=b%2===0?"#fff":"#000"; ctx.fillRect(-8,b*2-8,8,2);
    ctx.fillStyle=b%2===0?"#000":"#fff"; ctx.fillRect(0, b*2-8,8,2);
  }
  ctx.restore();

  // Top-speed marker
  const maxI = speed.indexOf(Math.max(...speed));
  if (maxI >= 0) {
    const mx=tx(pts[maxI][0]), my=ty(pts[maxI][1]);
    ctx.beginPath(); ctx.arc(mx,my,7,0,Math.PI*2); ctx.fillStyle="rgba(0,180,255,0.95)"; ctx.fill();
    ctx.fillStyle="#fff"; ctx.font="bold 10px monospace"; ctx.textAlign="left";
    ctx.fillText(`▲ ${Math.round(speed[maxI])} km/h`, mx+10, my+4);
  }
  // Slowest apex
  const minI = speed.indexOf(Math.min(...speed));
  if (minI >= 0) {
    const mx=tx(pts[minI][0]), my=ty(pts[minI][1]);
    ctx.beginPath(); ctx.arc(mx,my,6,0,Math.PI*2); ctx.fillStyle="rgba(255,40,0,0.95)"; ctx.fill();
    ctx.fillStyle="#fff"; ctx.font="bold 10px monospace"; ctx.textAlign="left";
    ctx.fillText(`▼ ${Math.round(speed[minI])} km/h`, mx+9, my+4);
  }

  _drawColorBar(ctx, W, H, vMin, vMax, cbGap, "SPEED  km/h", (v) => speedColor(v, vMin, vMax));
  ctx.fillStyle="rgba(0,210,190,0.03)"; ctx.font="bold 48px 'Bebas Neue',sans-serif";
  ctx.textAlign="center"; ctx.fillText("FastF1", W/2, H/2+20);
}

// ── Draw real GPS telemetry (OpenF1 data) ─────────────────────────────────────
export function drawRealTelemetry(canvas, points, overlay) {
  if (!canvas || !points.length) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  ctx.fillStyle="#050508"; ctx.fillRect(0,0,W,H);

  const vals = points.map(p =>
    overlay==="speed" ? p.speed : overlay==="throttle" ? p.throttle : p.brake
  );
  const vMin=Math.min(...vals), vMax=Math.max(...vals);
  const xs=points.map(p=>p.x), ys=points.map(p=>p.y);
  const xMin=Math.min(...xs), xMax=Math.max(...xs);
  const yMin=Math.min(...ys), yMax=Math.max(...ys);
  const pad=54, cbGap=48;
  const sc=Math.min((W-pad*2-cbGap)/(xMax-xMin||1),(H-pad*2)/(yMax-yMin||1));
  const ox=pad+((W-pad*2-cbGap)-(xMax-xMin)*sc)/2;
  const oy=pad+((H-pad*2)-(yMax-yMin)*sc)/2;
  const tx=x=>ox+(x-xMin)*sc;
  const ty=y=>oy+(yMax-y)*sc; // flip Y axis
  const n=points.length;

  // Track ghost outline
  ctx.beginPath();
  points.forEach((p,i)=>i===0?ctx.moveTo(tx(p.x),ty(p.y)):ctx.lineTo(tx(p.x),ty(p.y)));
  ctx.strokeStyle="rgba(255,255,255,0.07)"; ctx.lineWidth=20; ctx.lineJoin="round"; ctx.lineCap="round"; ctx.stroke();

  const colorFn = _overlayColor(overlay);
  for (let i=0; i<n-1; i++) {
    const [r,g,b]=colorFn(vals[i],vMin,vMax);
    ctx.beginPath(); ctx.moveTo(tx(points[i].x),ty(points[i].y)); ctx.lineTo(tx(points[i+1].x),ty(points[i+1].y));
    ctx.strokeStyle=`rgb(${r},${g},${b})`; ctx.lineWidth=7; ctx.lineCap="round"; ctx.lineJoin="round"; ctx.stroke();
  }

  if (overlay==="speed") {
    for (let i=0; i<n-1; i++) {
      if (points[i].brake>50) {
        const f=(points[i].brake-50)/50;
        ctx.beginPath(); ctx.moveTo(tx(points[i].x),ty(points[i].y)); ctx.lineTo(tx(points[i+1].x),ty(points[i+1].y));
        ctx.strokeStyle=`rgba(255,10,0,${f*0.4})`; ctx.lineWidth=16+f*10; ctx.lineCap="round"; ctx.stroke();
      }
    }
  }

  // S/F chequered
  const sfX=tx(points[0].x), sfY=ty(points[0].y);
  const ang=Math.atan2(ty(points[1].y)-sfY,tx(points[1].x)-sfX)+Math.PI/2;
  ctx.save(); ctx.translate(sfX,sfY); ctx.rotate(ang);
  for (let b=0;b<8;b++) {
    ctx.fillStyle=b%2===0?"#fff":"#111"; ctx.fillRect(-8,b*2-8,8,2);
    ctx.fillStyle=b%2===0?"#111":"#fff"; ctx.fillRect(0, b*2-8,8,2);
  }
  ctx.restore();

  // Max/min annotations
  const maxI=vals.indexOf(Math.max(...vals)), minI=vals.indexOf(Math.min(...vals));
  const unit=overlay==="speed"?" km/h":"%";
  if (maxI>=0) {
    ctx.beginPath(); ctx.arc(tx(points[maxI].x),ty(points[maxI].y),7,0,Math.PI*2);
    ctx.fillStyle="rgba(0,170,255,0.95)"; ctx.fill();
    ctx.fillStyle="#fff"; ctx.font="bold 9px monospace"; ctx.textAlign="left";
    ctx.fillText(`▲ ${Math.round(vals[maxI])}${unit}`,tx(points[maxI].x)+9,ty(points[maxI].y)+3);
  }
  if (minI>=0) {
    ctx.beginPath(); ctx.arc(tx(points[minI].x),ty(points[minI].y),6,0,Math.PI*2);
    ctx.fillStyle="rgba(255,30,0,0.95)"; ctx.fill();
    ctx.fillStyle="#fff"; ctx.font="bold 9px monospace"; ctx.textAlign="left";
    ctx.fillText(`▼ ${Math.round(vals[minI])}${unit}`,tx(points[minI].x)+8,ty(points[minI].y)+3);
  }

  // Direction arrow
  const ai=Math.floor(n*0.2);
  if (ai<n-1) {
    const ax=tx(points[ai].x), ay=ty(points[ai].y);
    const aang=Math.atan2(ty(points[ai+1].y)-ay,tx(points[ai+1].x)-ax);
    ctx.save(); ctx.translate(ax,ay); ctx.rotate(aang);
    ctx.fillStyle="rgba(255,255,255,0.6)";
    ctx.beginPath(); ctx.moveTo(10,0); ctx.lineTo(-5,-5); ctx.lineTo(-5,5); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  const label=overlay==="speed"?"SPEED  km/h":overlay.toUpperCase()+"  %";
  _drawColorBar(ctx,W,H,vMin,vMax,cbGap,label,colorFn,overlay);
  ctx.fillStyle="#2a3a3a"; ctx.font="9px monospace"; ctx.textAlign="right";
  ctx.fillText(`${n} pts · real GPS · OpenF1`,W-cbGap-8,H-10);
}

// ── Private helpers ───────────────────────────────────────────────────────────
function _overlayColor(overlay) {
  if (overlay==="throttle") {
    return (v) => [Math.round((1-(v/100))*40), Math.round(100+(v/100)*155), Math.round((1-(v/100))*40)];
  }
  if (overlay==="brake") {
    return (v) => [Math.round(180+(v/100)*75), Math.round((1-(v/100))*60), 0];
  }
  return (v, vMin, vMax) => speedColor(v, vMin, vMax);
}

function _drawColorBar(ctx, W, H, vMin, vMax, cbGap, label, colorFn, overlay) {
  const cbX=W-cbGap+2, cbY=60, cbH=H-130, cbW=14;
  for (let i=0; i<cbH; i++) {
    const t=1-i/cbH, v=vMin+t*(vMax-vMin);
    const [r,g,b]=colorFn(v,vMin,vMax);
    ctx.fillStyle=`rgb(${r},${g},${b})`; ctx.fillRect(cbX,cbY+i,cbW,1);
  }
  ctx.strokeStyle="rgba(255,255,255,0.2)"; ctx.lineWidth=0.5; ctx.strokeRect(cbX,cbY,cbW,cbH);
  ctx.fillStyle="#aaa"; ctx.font="9px monospace"; ctx.textAlign="right";
  [0,0.25,0.5,0.75,1].forEach(t => {
    const v=Math.round(vMin+t*(vMax-vMin)), y=cbY+cbH*(1-t);
    ctx.fillText(overlay==="speed"?v:`${v}%`, cbX-4, y+3);
    ctx.beginPath(); ctx.moveTo(cbX-3,y); ctx.lineTo(cbX,y);
    ctx.strokeStyle="rgba(255,255,255,0.3)"; ctx.lineWidth=1; ctx.stroke();
  });
  ctx.save(); ctx.translate(cbX+cbW+12,cbY+cbH/2); ctx.rotate(Math.PI/2);
  ctx.fillStyle="#555"; ctx.font="8px monospace"; ctx.textAlign="center";
  ctx.fillText(label,0,0); ctx.restore();
}
