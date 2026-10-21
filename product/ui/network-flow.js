import * as logic from '../logic/network-flow.js';
import { newHistory, play, undo, reset } from '../logic/history.js';

const URI = (s) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
const STARS = URI('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><g fill="#fff">' + [[30, 40, 1.4, 0.7], [110, 20, 1, 0.5], [210, 70, 1.8, 0.8], [270, 150, 1.1, 0.5], [60, 140, 1.2, 0.6], [160, 190, 1.6, 0.7], [240, 260, 1, 0.5], [90, 250, 1.7, 0.8]].map(([x, y, r, o]) => `<circle cx="${x}" cy="${y}" r="${r}" fill-opacity="${o}"/>`).join('') + '</g></svg>');
const HAZE = URI('<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480"><defs><radialGradient id="a"><stop offset="0" stop-color="#3FB8AF" stop-opacity=".3"/><stop offset="1" stop-color="#3FB8AF" stop-opacity="0"/></radialGradient><radialGradient id="b"><stop offset="0" stop-color="#E8A0BF" stop-opacity=".22"/><stop offset="1" stop-color="#E8A0BF" stop-opacity="0"/></radialGradient></defs><circle cx="130" cy="130" r="120" fill="url(#a)"/><circle cx="340" cy="330" r="130" fill="url(#b)"/></svg>');
const MOTES = URI('<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360">' + [[40, 60, 2], [130, 210, 1.6], [220, 40, 2.2], [300, 150, 1.5], [90, 320, 1.8], [250, 290, 2], [180, 120, 1.3]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r * 2.5}" fill="#A8E6CF" fill-opacity=".14"/><circle cx="${x}" cy="${y}" r="${r}" fill="#E8FFF6" fill-opacity=".6"/>`).join('') + '</svg>');
const E = 'cubic-bezier(.215,.61,.355,1)';

export const css = `
.g-network-flow { position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; min-height: 560px; padding: 6px 0 14px;
  touch-action: none; user-select: none; -webkit-user-select: none;
  background: radial-gradient(110% 55% at 50% 0%, #3C4A9A 0%, rgba(60,74,154,0) 65%), linear-gradient(180deg, #232A66 0%, #2B2D5B 55%, #1B2150 100%); }
@media (prefers-color-scheme: dark) { .g-network-flow { background: radial-gradient(110% 55% at 50% 0%, #2A3377 0%, rgba(42,51,119,0) 65%), linear-gradient(180deg, #141842 0%, #1B1C42 55%, #0E1233 100%); } }
.g-network-flow .nf-l { position: absolute; inset: -20px; pointer-events: none; background-repeat: repeat; }
.g-network-flow .nf-l1 { background-image: ${STARS}; background-size: 300px 300px; animation: nf-d1 170s linear infinite; }
.g-network-flow .nf-l2 { background-image: ${HAZE}; background-size: 480px 480px; animation: nf-d2 260s linear infinite reverse; }
.g-network-flow .nf-l3 { background-image: ${MOTES}; background-size: 360px 360px; animation: nf-d3 70s linear infinite; }
@keyframes nf-d1 { to { background-position: 300px 0; } }
@keyframes nf-d2 { to { background-position: 480px 0; } }
@keyframes nf-d3 { to { background-position: 120px -360px; } }
.g-network-flow .nf-tilt { position: relative; width: 100%; max-width: 420px; transform-origin: 50% 70%; transform: perspective(1000px) rotateX(14deg); transition: transform .12s linear; }
.g-network-flow.nf-rel .nf-tilt { transition: transform .7s cubic-bezier(.34,1.56,.64,1); }
.g-network-flow svg.nf-s { display: block; width: 100%; height: auto; overflow: visible; }
.g-network-flow .nf-liq { fill: none; stroke-linecap: round; stroke: #3FB8AF; transition: stroke-width .4s ${E}, stroke .5s ${E}; }
.g-network-flow .nf-glow { fill: none; stroke-linecap: round; stroke: #7FF0DC; opacity: .5; transition: stroke-width .4s ${E}, stroke .5s ${E}; }
.g-network-flow .nf-hi { fill: none; stroke: #fff; stroke-opacity: .75; stroke-width: 1.6; stroke-linecap: round; stroke-dasharray: 2 14; opacity: 0; transition: opacity .4s ${E}; }
.g-network-flow .nf-hi.on { opacity: 1; }
.g-network-flow.nf-m .nf-hi.on { animation: nf-fl 1.4s linear infinite; }
@keyframes nf-fl { to { stroke-dashoffset: -32; } }
.g-network-flow.nf-win .nf-liq { stroke: #FFD45A; }
.g-network-flow.nf-win .nf-glow { stroke: #FFF0A8; }
.g-network-flow .nf-num { font: 300 15px/1 ui-sans-serif, system-ui, "Helvetica Neue", sans-serif; text-anchor: middle; dominant-baseline: central; fill: #F4F1FF; pointer-events: none; }
.g-network-flow .nf-sm { font-size: 11px; }
.g-network-flow .nf-amber { fill: #FFD9A0; }
.g-network-flow .nf-valve { fill: rgba(27,33,80,.82); stroke: rgba(255,255,255,.4); stroke-width: 1.2; transition: stroke .4s ${E}; }
.g-network-flow .nf-full .nf-valve { stroke: #FFE27A; }
.g-network-flow .nf-fullr { fill: none; stroke: #FFE27A; stroke-width: 1; opacity: 0; transition: opacity .4s ${E}; }
.g-network-flow .nf-full .nf-fullr { opacity: 1; }
.g-network-flow .nf-no { animation: nf-sh .4s ${E}; }
@keyframes nf-sh { 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }
.g-network-flow .nf-ok { stroke: #A8E6CF; stroke-width: 2.4; opacity: 0; transition: opacity .5s ${E}; fill: none; }
.g-network-flow .nf-okn .nf-ok, .g-network-flow .nf-oks .nf-ok { opacity: 1; }
.g-network-flow.nf-m .nf-okn .nf-ok, .g-network-flow.nf-m .nf-oks .nf-ok { animation: nf-pu 3s ease-in-out infinite; }
@keyframes nf-pu { 50% { opacity: .45; } }
.g-network-flow .nf-over { stroke: #FFB8A0; stroke-width: 1.6; stroke-dasharray: 3 3; fill: none; opacity: 0; transition: opacity .4s ${E}; }
.g-network-flow .nf-ovr .nf-over { opacity: 1; }
.g-network-flow .nf-arc { fill: none; stroke: #FFE27A; stroke-width: 3; stroke-linecap: round; transition: stroke-dasharray .45s ${E}; }
.g-network-flow .nf-lvl { transition: transform .45s ${E}; }
.g-network-flow .nf-flood { position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity .6s ${E}; background: radial-gradient(70% 55% at 50% 50%, rgba(255,226,122,.55), rgba(255,184,160,.22) 55%, rgba(255,184,160,0) 80%); }
.g-network-flow .nf-row { position: relative; display: flex; gap: 18px; }
.g-network-flow .nf-bt { width: 56px; height: 56px; padding: 0; border: 0; border-radius: 18px; cursor: pointer; touch-action: manipulation; background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1.5px rgba(255,255,255,.3); transition: transform .3s ${E}, background .3s, box-shadow .3s; }
.g-network-flow .nf-bt:active { transform: scale(.92); }
.g-network-flow .nf-bt.cur { background: rgba(168,230,207,.34); box-shadow: inset 0 0 0 2px #A8E6CF; }
.g-network-flow .nf-bt svg { width: 34px; height: 34px; display: block; margin: auto; }
`;

const NS = 'http://www.w3.org/2000/svg', SC = [0, 4, 7, 11, 14], R = 17;
const TUBE = (cap) => 6 + cap * 3.4;

export function mount(root, ctx) {
  root.classList.add('g-network-flow');
  root.textContent = '';
  const rm = ctx.reduceMotion;
  if (!rm) root.classList.add('nf-m');
  const level = logic.makeLevel(ctx.level), best = logic.bestScore(level), N = level.nodes, ed = level.edges;
  let h = newHistory(logic.initialState(level));
  let won = false, mode = 1, ac, bus, hum;
  const timers = new Set(), offs = [];
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
  const on = (n, type, fn) => { n.addEventListener(type, fn); offs.push(() => n.removeEventListener(type, fn)); };
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; };

  // ---- sound: vibraphone voice plus a soft water hum that follows the total flow; made on the first touch, closed in destroy
  const audio = () => {
    if (ac !== undefined) return ac;
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      bus = ac.createGain();
      const dl = ac.createDelay(1), fb = ac.createGain(), lp = ac.createBiquadFilter();
      dl.delayTime.value = 0.28; fb.gain.value = 0.3; lp.type = 'lowpass'; lp.frequency.value = 2400;
      bus.connect(ac.destination); bus.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(ac.destination);
      const buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = ac.createBufferSource(), f = ac.createBiquadFilter();
      hum = ac.createGain(); hum.gain.value = 0.0001;
      src.buffer = buf; src.loop = true; f.type = 'lowpass'; f.frequency.value = 520;
      src.connect(f).connect(hum).connect(ac.destination); src.start();
      setHum();
    } catch { ac = null; }
    if (ac && ac.state === 'suspended') ac.resume();
    return ac;
  };
  const setHum = () => { if (ac && hum) hum.gain.setTargetAtTime(0.004 + 0.03 * h.present.flow.reduce((a, b) => a + b, 0) / Math.max(1, ed.reduce((a, e) => a + e[2], 0)), ac.currentTime, 0.4); };
  function bell(i, delay = 0, len = 1.3, vol = 0.13) {
    const f = 330 * 2 ** ((SC[((i % 5) + 5) % 5] + 12 * (Math.floor(i / 5) & 1)) / 12), t = ac.currentTime + delay;
    [[1, 1, len], [4, 0.3, len * 0.35], [10, 0.08, 0.05]].forEach(([k, a, d]) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.frequency.value = f * k; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol * a, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g).connect(bus); o.start(t); o.stop(t + d + 0.05);
    });
  }
  const snd = (i, vol) => { if (audio()) bell(i, 0, 1.3, vol); else ctx.sound.move(i); };
  const shellWin = ctx.sound.win; // silence the shell chord; the game plays its own (restored in destroy)
  ctx.sound.win = () => {};
  const chord = () => { if (audio()) [5, 7, 9, 12].forEach((k, j) => bell(k, j * 0.11, 2.4, 0.1)); else shellWin(); };

  // ---- layout: layers by longest path from the source, sinks pinned to the last layer, rows ordered by neighbours' average x
  const layer = Array(N).fill(0), isSink = Array(N).fill(false);
  level.demands.forEach(([v]) => { isSink[v] = !ed.some((e) => e[0] === v); });
  for (let k = 0; k < N; k++) ed.forEach(([a, b]) => { if (layer[b] < layer[a] + 1) layer[b] = layer[a] + 1; });
  const L = Math.max(...layer.filter((_, v) => !isSink[v])) + (level.demands.some(([v]) => isSink[v] && layer[v] > 0) ? 1 : 0), rows = [];
  for (let v = 0; v < N; v++) { if (isSink[v]) layer[v] = Math.max(L, layer[v]); }
  const top = Math.max(...layer);
  for (let i = 0; i <= top; i++) rows.push([]);
  for (let v = 0; v < N; v++) rows[layer[v]].push(v);
  const X = Array(N).fill(179), spread = () => rows.forEach((r) => r.forEach((v, j) => { X[v] = 358 * (j + 1) / (r.length + 1); }));
  spread();
  for (let it = 0; it < 6; it++) {
    const seq = it % 2 ? [...rows.keys()].reverse() : [...rows.keys()];
    seq.forEach((i) => {
      const bary = (v) => { const nb = ed.filter(([a, b]) => (it % 2 ? a === v : b === v)).map(([a, b]) => X[it % 2 ? b : a]); return nb.length ? nb.reduce((p, q) => p + q, 0) / nb.length : X[v]; };
      rows[i].sort((p, q) => bary(p) - bary(q));
    });
    spread();
  }
  const Y = layer.map((l) => 66 + l * (300 / Math.max(1, top)));

  // ---- scene
  for (const c of rm ? [] : ['nf-l1', 'nf-l2', 'nf-l3']) { const d = document.createElement('div'); d.className = 'nf-l ' + c; root.appendChild(d); }
  const tilt = document.createElement('div');
  tilt.className = 'nf-tilt';
  const svg = el('svg', { class: 'nf-s', viewBox: '0 0 358 440' });
  tilt.append(svg);
  const flood = document.createElement('div');
  flood.className = 'nf-flood';
  root.append(tilt, flood);
  const defs = el('defs', {}, svg);
  const bf = el('filter', { id: 'nf-bl', x: '-20%', y: '-20%', width: '140%', height: '140%' }, defs);
  el('feGaussianBlur', { stdDeviation: 4 }, bf);
  const plg = el('linearGradient', { id: 'nf-pl', x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
  el('stop', { offset: 0, 'stop-color': '#41468F' }, plg);
  el('stop', { offset: 1, 'stop-color': '#2D3170' }, plg);
  const sph = el('radialGradient', { id: 'nf-sp', cx: '35%', cy: '30%', r: '75%' }, defs);
  el('stop', { offset: 0, 'stop-color': '#8C93E8' }, sph);
  el('stop', { offset: 1, 'stop-color': '#2B2D5B' }, sph);
  const sun = el('radialGradient', { id: 'nf-sun', cx: '35%', cy: '30%', r: '75%' }, defs);
  el('stop', { offset: 0, 'stop-color': '#FFF6C8' }, sun);
  el('stop', { offset: 1, 'stop-color': '#FFB8A0' }, sun);
  // floating platform: a slab with thickness, a soft shadow, and a faint grid
  el('rect', { x: 26, y: 56, width: 306, height: 380, rx: 30, fill: '#0A0D2E', opacity: 0.45, filter: 'url(#nf-bl)' }, svg);
  el('rect', { x: 14, y: 40, width: 330, height: 376, rx: 30, fill: '#1F2352' }, svg);
  el('rect', { x: 14, y: 26, width: 330, height: 376, rx: 30, fill: 'url(#nf-pl)' }, svg);
  el('rect', { x: 14.8, y: 26.8, width: 328.4, height: 374.4, rx: 29, fill: 'none', stroke: '#fff', 'stroke-opacity': 0.18, 'stroke-width': 1.5 }, svg);
  for (let g = 1; g < 8; g++) el('path', { d: `M${14 + g * 41.25},40 V388`, stroke: '#fff', 'stroke-opacity': 0.05 }, svg);
  const glowL = el('g', { filter: 'url(#nf-bl)', 'pointer-events': 'none' }, svg), pipeL = el('g', {}, svg), nodeL = el('g', {}, svg), valveL = el('g', {}, svg), hitL = el('g', {}, svg);

  const pipes = ed.map(([a, b, cap], e) => {
    const ym = (Y[a] + Y[b]) / 2, d = `M${X[a]},${Y[a]} C${X[a]},${ym} ${X[b]},${ym} ${X[b]},${Y[b]}`;
    const w = TUBE(cap), g = el('g', {}, pipeL);
    el('path', { d, stroke: '#0A0D2E', 'stroke-opacity': 0.35, 'stroke-width': w + 3, fill: 'none', transform: 'translate(0 5)', 'stroke-linecap': 'round' }, g);
    el('path', { d, stroke: '#9FA6F2', 'stroke-opacity': 0.55, 'stroke-width': w + 2, fill: 'none', 'stroke-linecap': 'round' }, g);
    el('path', { d, stroke: '#1B2150', 'stroke-width': w - 2, fill: 'none', 'stroke-linecap': 'round' }, g);
    const glow = el('path', { d, class: 'nf-glow' }, glowL), liq = el('path', { d, class: 'nf-liq' }, g), hi = el('path', { d, class: 'nf-hi' }, g);
    const p = g.lastChild, len = p.getTotalLength(), ar = p.getPointAtLength(len * 0.84), ar2 = p.getPointAtLength(len * 0.84 + 2);
    const ang = Math.atan2(ar2.y - ar.y, ar2.x - ar.x) * 180 / Math.PI;
    el('path', { d: 'M-4,-4 L3,0 L-4,4', fill: 'none', stroke: '#fff', 'stroke-opacity': 0.7, 'stroke-width': 1.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', transform: `translate(${ar.x} ${ar.y}) rotate(${ang})` }, g);
    const v = el('g', {}, valveL), vi = el('g', {}, v);
    el('circle', { class: 'nf-valve', r: 12.5 }, vi);
    el('circle', { class: 'nf-fullr', r: 15.5 }, vi);
    const num = el('text', { class: 'nf-num' }, vi);
    const hit = el('circle', { r: 24, fill: '#000', 'fill-opacity': 0, 'data-e': e, style: 'cursor:pointer' }, hitL);
    return { glow, liq, hi, num, vi, w, cap, hit, v, p, len };
  });
  // valves sit on their pipe where they crowd neither another valve nor a node (keeps every tap target apart)
  const placed = pipes.map(() => null);
  for (let pass = 0; pass < 5; pass++) pipes.forEach((q, i) => {
    let bestS = -1, bp;
    for (let t = 0.25; t <= 0.751; t += 0.025) {
      const pt = q.p.getPointAtLength(q.len * t);
      const s = Math.min(...placed.filter((o, j) => o && j !== i).map((o) => Math.hypot(o.x - pt.x, o.y - pt.y)), ...X.map((x, v) => Math.hypot(x - pt.x, Y[v] - pt.y) * 1.3), 99) - Math.abs(t - 0.5) * 8;
      if (s > bestS) { bestS = s; bp = pt; }
    }
    placed[i] = bp;
    q.v.setAttribute('transform', `translate(${bp.x} ${bp.y})`);
    q.hit.setAttribute('cx', bp.x); q.hit.setAttribute('cy', bp.y);
  });

  const net = () => { const n = Array(N).fill(0); ed.forEach(([a, b], e) => { n[a] -= h.present.flow[e]; n[b] += h.present.flow[e]; }); return n; };
  const need = (v) => level.demands.find((d) => d[0] === v)?.[1];
  const nodes = [...Array(N).keys()].map((v) => {
    const g = el('g', { transform: `translate(${X[v]} ${Y[v]})` }, nodeL), sink = need(v) !== undefined, src = v === 0;
    el('ellipse', { cy: 22, rx: 17, ry: 5, fill: '#0A0D2E', opacity: 0.4 }, g);
    if (src) {
      for (let k = 0; k < 8; k++) el('path', { d: 'M0,-24 L3,-30 L-3,-30 Z', fill: '#FFE27A', transform: `rotate(${k * 45})` }, g);
      el('circle', { r: 20, fill: 'url(#nf-sun)' }, g);
    } else if (sink) el('rect', { x: -R, y: -R, width: 2 * R, height: 2 * R, rx: 8, fill: 'url(#nf-sp)' }, g);
    else el('circle', { r: R, fill: 'url(#nf-sp)' }, g);
    const ok = el('g', { class: 'nf-st' }, g);
    if (sink) el('rect', { class: 'nf-ok', x: -R - 4, y: -R - 4, width: 2 * R + 8, height: 2 * R + 8, rx: 11 }, ok);
    else el('circle', { class: 'nf-ok', r: R + 4 }, ok);
    el('circle', { class: 'nf-over', r: R + 8 }, ok);
    const arc = sink ? el('circle', { class: 'nf-arc', r: R + 8, transform: 'rotate(-90)', 'stroke-dasharray': '0 999' }, g) : null;
    const num = el('text', { class: 'nf-num' + (src ? '' : sink ? ' nf-sm' : '') }, g);
    if (src) num.style.fill = '#5A2D3A';
    return { g, st: ok, num, arc, sink, src };
  });

  const row = document.createElement('div');
  row.className = 'nf-row';
  const mk = (sign) => { const b = document.createElement('button'); b.className = 'nf-bt'; b.style.touchAction = 'manipulation'; b.innerHTML = `<svg viewBox="0 0 34 34" fill="none" stroke="#E8FFF6" stroke-width="2" stroke-linecap="round"><path d="M17 4 C 24 13 27 17 27 21 A10 10 0 0 1 7 21 C 7 17 10 13 17 4 Z"/><path d="M12 22 H22${sign > 0 ? ' M17 17 V27' : ''}"/></svg>`; on(b, 'click', () => { audio(); mode = sign; sync(); }); return b; };
  const bPlus = mk(1), bMinus = mk(-1);
  row.append(bPlus, bMinus);
  root.append(row);

  function sync() {
    const f = h.present.flow, n = net();
    pipes.forEach((p, e) => {
      const fr = f[e] / p.cap, lw = f[e] ? Math.max(3, (p.w - 4) * fr) : 0;
      p.liq.style.strokeWidth = lw; p.glow.style.strokeWidth = lw + 5;
      p.hi.classList.toggle('on', f[e] > 0);
      if (p.num.textContent !== String(f[e])) p.num.textContent = f[e];
      p.vi.classList.toggle('nf-full', f[e] === p.cap);
    });
    nodes.forEach((k, v) => {
      const want = need(v), m = n[v];
      k.st.classList.remove('nf-okn', 'nf-oks', 'nf-ovr');
      if (k.src) k.num.textContent = -m;
      else if (k.sink) { k.num.textContent = `${m}/${want}`; k.arc.style.strokeDasharray = `${Math.min(1, m / want) * 2 * Math.PI * (R + 8)} 999`; k.st.classList.add(m === want ? 'nf-oks' : m > want ? 'nf-ovr' : 'x'); }
      else { k.num.textContent = m ? (m > 0 ? '+' : '−') + Math.abs(m) : ''; k.num.classList.toggle('nf-amber', !!m); k.st.classList.add(m === 0 ? (f.some((x, e) => x && (ed[e][0] === v || ed[e][1] === v)) ? 'nf-okn' : 'x') : 'x'); }
    });
    bPlus.classList.toggle('cur', mode > 0); bMinus.classList.toggle('cur', mode < 0);
    setHum();
    ctx.hud({ moves: h.present.moves, best, tries: h.tries, maxTries: Infinity, canUndo: h.past.length > 0 });
    if (!won && logic.isSolved(h.present)) {
      won = true;
      root.classList.add('nf-win');
      flood.style.opacity = 1;
      chord();
      later(() => ctx.solved({ score: logic.score(h.present) }), 700);
    }
  }
  function tapPipe(e) {
    if (won) return;
    const p = pipes[e], n = play(h, logic, { e, d: mode });
    if (n === h) { p.vi.classList.remove('nf-no'); void p.vi.getBoundingClientRect(); p.vi.classList.add('nf-no'); snd(-3, 0.05); return; }
    h = n;
    snd(mode > 0 ? h.present.flow[e] + 2 : h.present.flow[e] - 4, 0.12);
    sync();
  }

  // ---- input: a still tap on a valve moves 1 unit (in the chosen direction); a drag tilts the platform a few degrees
  let ds = null;
  const tiltTo = (ry, rx) => { tilt.style.transform = `perspective(1000px) rotateX(${14 + rx}deg) rotateY(${ry}deg)`; };
  on(root, 'pointerdown', (e) => {
    if ((e.pointerType === 'mouse' && e.button !== 0) || e.target.closest('button')) return;
    audio();
    ds = { x: e.clientX, y: e.clientY, moved: false, e: e.target.getAttribute && e.target.getAttribute('data-e') };
    root.classList.remove('nf-rel');
    root.setPointerCapture?.(e.pointerId);
  });
  on(root, 'pointermove', (e) => {
    if (!ds) return;
    const dx = e.clientX - ds.x, dy = e.clientY - ds.y;
    if (Math.hypot(dx, dy) > 8) ds.moved = true;
    if (!rm && ds.moved) tiltTo(Math.max(-6, Math.min(6, dx / 14)), Math.max(-5, Math.min(5, -dy / 18)));
  });
  const up = (e) => {
    if (!ds) return;
    const s = ds; ds = null;
    root.classList.add('nf-rel');
    tiltTo(0, 0);
    if (!s.moved && e.type === 'pointerup' && s.e !== null && s.e !== undefined) tapPipe(+s.e);
  };
  on(root, 'pointerup', up);
  on(root, 'pointercancel', up);

  sync();
  return {
    undo() { if (won) return; const n = undo(h); if (n !== h) { h = n; sync(); } },
    reset() { if (won) return; h = reset(h); sync(); },
    destroy() {
      timers.forEach(clearTimeout); timers.clear();
      offs.forEach((f) => f());
      ctx.sound.win = shellWin;
      if (ac) try { ac.close(); } catch { /* already closed */ }
      root.classList.remove('g-network-flow', 'nf-m', 'nf-rel', 'nf-win');
      root.textContent = '';
    },
  };
}
