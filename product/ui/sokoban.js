import * as logic from '../logic/sokoban.js';
import { newHistory, play, undo, reset } from '../logic/history.js';

const URI = (s) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
const GRAIN = URI('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .29  0 0 0 0 .17  0 0 0 0 .16  0 0 0 .17 0"/></filter><rect width="160" height="160" filter="url(#n)"/></svg>');
const RACKS = URI('<svg xmlns="http://www.w3.org/2000/svg" width="420" height="190"><g fill="#4A2C2A" fill-opacity=".2"><rect x="10" y="40" width="130" height="6"/><rect x="10" y="100" width="130" height="6"/><rect x="10" y="160" width="130" height="6"/><rect x="10" y="40" width="6" height="130"/><rect x="134" y="40" width="6" height="130"/><rect x="26" y="8" width="38" height="32" rx="4"/><rect x="74" y="16" width="30" height="24" rx="4"/><rect x="40" y="62" width="44" height="38" rx="4"/><rect x="96" y="76" width="30" height="24" rx="4"/><rect x="28" y="126" width="34" height="34" rx="4"/><rect x="220" y="60" width="150" height="6"/><rect x="220" y="124" width="150" height="6"/><rect x="220" y="60" width="6" height="110"/><rect x="364" y="60" width="6" height="110"/><rect x="236" y="26" width="40" height="34" rx="4"/><rect x="290" y="94" width="48" height="30" rx="4"/><rect x="238" y="140" width="36" height="30" rx="4"/></g></svg>');
const SHAFTS = URI('<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360"><g fill="#fff" fill-opacity=".16"><path d="M40 0h40L-60 360h-40z"/><path d="M200 0h70L110 360h-70z"/><path d="M330 0h24L220 360h-24z"/></g></svg>');
const DUST = URI('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><g fill="#FFF3E0" fill-opacity=".8"><circle cx="40" cy="60" r="2.5"/><circle cx="210" cy="30" r="2"/><circle cx="120" cy="170" r="3"/><circle cx="260" cy="230" r="2.4"/><circle cx="60" cy="260" r="2"/><circle cx="170" cy="100" r="1.8"/></g></svg>');
const STARS = URI('<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260"><g fill="#FFF3E0"><circle cx="20" cy="30" r="1.6"/><circle cx="90" cy="70" r="1"/><circle cx="150" cy="20" r="1.8"/><circle cx="210" cy="90" r="1.2"/><circle cx="60" cy="150" r="1.2"/><circle cx="130" cy="130" r="1.6"/><circle cx="235" cy="170" r="1"/><circle cx="30" cy="225" r="1.8"/><circle cx="170" cy="215" r="1.2"/></g></svg>');

export const css = `
.g-sokoban { --sk-s1:#FFD9A8; --sk-s2:#FFB26B; --sk-floor:#FFE3B3; --sk-alt:#F7CF8E; --sk-btn:#F2A93B; --sk-night:0; --sk-glow:.35;
  position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; min-height: 420px;
  background: ${GRAIN}, repeating-linear-gradient(90deg, rgba(74,44,42,.05) 0 14px, rgba(255,255,255,.05) 14px 28px), linear-gradient(180deg, var(--sk-s1) 0%, var(--sk-s2) 100%); touch-action: none; user-select: none; -webkit-user-select: none; }
@media (prefers-color-scheme: dark) { .g-sokoban { --sk-s1:#241743; --sk-s2:#6E3A55; --sk-floor:#4D3858; --sk-alt:#432F51; --sk-btn:#8C5A2B; --sk-night:1; --sk-glow:.7; } }
.g-sokoban .sk-l { position: absolute; inset: 0; pointer-events: none; background-repeat: repeat; }
.g-sokoban .sk-l1 { background-image: ${RACKS}; background-size: 420px 190px; background-position: 0 100%; background-repeat: repeat-x; animation: sk-d1 260s linear infinite; }
.g-sokoban .sk-l2 { background-image: ${SHAFTS}; background-size: 360px 360px; opacity: calc(1 - var(--sk-night)); animation: sk-d2 120s linear infinite; }
.g-sokoban .sk-l3 { background-image: ${DUST}; background-size: 300px 300px; animation: sk-d3 70s linear infinite, sk-fl 4s ease-in-out infinite; }
.g-sokoban .sk-l4 { background-image: ${STARS}; background-size: 260px 260px; opacity: var(--sk-night); animation: sk-tw 4s ease-in-out infinite; }
@keyframes sk-d1 { to { background-position: 420px 100%; } } @keyframes sk-d2 { to { background-position: 360px 0; } } @keyframes sk-d3 { to { background-position: -300px 300px; } }
@keyframes sk-fl { 50% { filter: opacity(.5); } } @keyframes sk-tw { 50% { opacity: calc(var(--sk-night) * .5); } }
.g-sokoban svg.sk-main { overflow: visible; position: relative; width: 100%; max-width: 520px; height: auto; display: block; touch-action: none; }
.g-sokoban .sk-mv { transition: transform .15s cubic-bezier(.34,1.45,.64,1); }
.g-sokoban .sk-nt { opacity: calc(var(--sk-night) * var(--sk-glow)); }
.g-sokoban .sk-eh, .g-sokoban .sk-on .sk-e1 { display: none; } .g-sokoban .sk-on .sk-eh { display: inline; }
.g-sokoban .sk-tint { opacity: 0; transition: opacity .3s; } .g-sokoban .sk-on .sk-tint { opacity: .5; }
.g-sokoban .sk-tg { animation: sk-pulse 2.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes sk-pulse { 50% { transform: scale(1.07); opacity: .75; } }
.g-sokoban .sk-eye { transform-box: fill-box; transform-origin: center; animation: sk-blink 4.2s infinite; }
@keyframes sk-blink { 0%,94%,100% { transform: scaleY(1); } 97% { transform: scaleY(.1); } }
.g-sokoban .sk-pad { position: relative; display: grid; grid-template-columns: repeat(3, 56px); grid-template-rows: repeat(2, 56px); gap: 6px; margin-top: 4px; }
.g-sokoban .sk-pad button { width: 56px; height: 56px; border: 3px solid #4A2C2A; border-radius: 18px; background: var(--sk-btn); box-shadow: 0 4px 0 #4A2C2A; display: grid; place-items: center; cursor: pointer; padding: 0; touch-action: manipulation; transition: transform .1s, box-shadow .1s; }
.g-sokoban .sk-pad button:active { transform: translateY(3px); box-shadow: 0 1px 0 #4A2C2A; }
.g-sokoban .sk-pad svg { width: 26px; height: 26px; fill: none; stroke: #FFF3E0; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; }
.g-sokoban.sk-still *, .g-sokoban.sk-still .sk-l { animation: none !important; transition: none !important; }
`;

const C = ['#F4623A', '#FFC857', '#7FC8F8', '#6BBF59', '#FF8FB1', '#B79CED'];
const BROWN = '#4A2C2A';
const NS = 'http://www.w3.org/2000/svg';
const V = 400, M = 22;
const D = [[-1, 0], [0, 1], [1, 0], [0, -1]];
const ARROW = ['M6 16L12 8L18 16', 'M8 6L16 12L8 18', 'M6 8L12 16L18 8', 'M16 6L8 12L16 18'];

export function mount(root, ctx) {
  root.classList.add('g-sokoban');
  const level = logic.makeLevel(ctx.level);
  const best = logic.bestScore(level);
  let h = newHistory(logic.initialState(level));
  const R = level.rows.length, W = Math.max(...level.rows.map((r) => r.length));
  const cell = Math.min(52, 360 / W), ox = (V - W * cell) / 2, oy = M + 8, VH = R * cell + 2 * M + 8;
  const walls = h.present.walls;
  let won = false, face = 2, ac = null, queue = [], stepT = null, swipe = null;
  const timers = new Set(), anims = [];
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; };
  const anim = (node, kf, opt) => { if (ctx.reduceMotion) return null; const a = node.animate(kf, opt); anims.push(a); return a; };

  // Own voices: scrape and thud for pushes, a bright ding when a crate lands home.
  const blip = (f0, f1, dur, gain, type = 'sine', at = 0) => {
    if (!ac) return;
    const t = ac.currentTime + at, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + 0.05);
  };
  const unlock = () => { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { ac = null; } } if (ac && ac.state === 'suspended') ac.resume(); };
  const SCRAPE = () => { blip(150, 90, 0.14, 0.05, 'sawtooth'); blip(80, 60, 0.12, 0.08, 'sine', 0.09); };
  const DING = () => { blip(1047, 1047, 0.2, 0.05, 'triangle'); blip(1568, 1568, 0.3, 0.05, 'triangle', 0.08); };
  const BONK = () => blip(140, 100, 0.1, 0.06, 'triangle');

  root.textContent = '';
  if (ctx.reduceMotion) root.classList.add('sk-still');
  else for (const c of ['sk-l4', 'sk-l1', 'sk-l2', 'sk-l3']) { const d = document.createElement('div'); d.className = 'sk-l ' + c; root.appendChild(d); }
  const svg = el('svg', { viewBox: `0 0 ${V} ${VH}`, class: 'sk-main' });
  root.appendChild(svg);
  const defs = el('defs', {}, svg);
  const pat = (id, w, hh, build) => { const p = el('pattern', { id, width: w, height: hh, patternUnits: 'userSpaceOnUse' }, defs); build(p); };
  pat('sk-stip', 14, 14, (p) => { for (const [x, y] of [[2, 3], [9, 7], [5, 12], [12, 1]]) el('circle', { cx: x, cy: y, r: 0.9, fill: BROWN, 'fill-opacity': '.2' }, p); });
  pat('sk-brick', cell, cell / 2, (p) => { el('path', { d: `M0 ${cell / 4}H${cell}M${cell / 2} 0V${cell / 4}M${cell / 4} ${cell / 4}V${cell / 2}M${cell * 0.75} ${cell / 4}V${cell / 2}`, stroke: '#FFE3B3', 'stroke-opacity': '.55', 'stroke-width': 1.6, fill: 'none' }, p); });
  pat('sk-haz', 12, 12, (p) => { el('rect', { width: 12, height: 12, fill: '#FFC857' }, p); el('path', { d: 'M-2 2L2 -2M0 12L12 0M10 14L14 10', stroke: BROWN, 'stroke-width': 4 }, p); });
  const sheen = el('linearGradient', { id: 'sk-sheen', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  for (const [o, c, a] of [[0, '#fff', 0.42], [0.45, '#fff', 0], [1, BROWN, 0.28]]) el('stop', { offset: o, 'stop-color': c, 'stop-opacity': a }, sheen);
  const pool = el('radialGradient', { id: 'sk-pool' }, defs);
  el('stop', { offset: 0, 'stop-color': '#FFC95C', 'stop-opacity': 0.7 }, pool); el('stop', { offset: 1, 'stop-color': '#FFC95C', 'stop-opacity': 0 }, pool);

  // room: interior floor = every non-wall cell reachable from the player ignoring crates
  const inside = new Set(), stack = [h.present.player.join(',')];
  while (stack.length) { const k = stack.pop(); if (inside.has(k)) continue; inside.add(k); const [r, c] = k.split(',').map(Number); for (const [dr, dc] of D) if (walls[r + dr]?.[c + dc] === 0) stack.push(`${r + dr},${c + dc}`); }
  const X = (c) => ox + c * cell, Y = (r) => oy + r * cell;
  const near = (r, c) => { for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if (inside.has(`${r + a},${c + b}`)) return true; return false; };
  const sh = el('g', { fill: BROWN, 'fill-opacity': '.25', transform: 'translate(4 6)' }, svg);
  for (let r = 0; r < R; r++) for (let c = 0; c < W; c++) if (near(r, c) && (inside.has(`${r},${c}`) || walls[r][c] === 1)) el('rect', { x: X(c), y: Y(r), width: cell, height: cell, rx: 4 }, sh);
  for (let r = 0; r < R; r++) for (let c = 0; c < W; c++) if (inside.has(`${r},${c}`)) {
    el('rect', { x: X(c), y: Y(r), width: cell + 0.5, height: cell + 0.5, style: (r + c) % 2 ? 'fill:var(--sk-alt)' : 'fill:var(--sk-floor)' }, svg);
    el('rect', { x: X(c), y: Y(r), width: cell + 0.5, height: cell + 0.5, fill: 'url(#sk-stip)' }, svg);
  }
  // lamp pools at night
  for (const [px, py] of [[0.25, 0.3], [0.75, 0.7]]) el('circle', { cx: ox + W * cell * px, cy: oy + R * cell * py, r: Math.max(W, R) * cell * 0.4, fill: 'url(#sk-pool)', class: 'sk-nt', 'pointer-events': 'none' }, svg);
  // targets: painted dashed squares with a cross
  const pad = cell * 0.12;
  for (const [r, c] of h.present.targets) {
    const g = el('g', { class: 'sk-tg' }, svg);
    el('rect', { x: X(c) + pad, y: Y(r) + pad, width: cell - 2 * pad, height: cell - 2 * pad, rx: 5, fill: '#FFC857', 'fill-opacity': '.55', stroke: '#C98A12', 'stroke-width': 2, 'stroke-dasharray': '5 4' }, g);
    el('path', { d: `M${X(c) + cell * 0.34} ${Y(r) + cell * 0.34}L${X(c) + cell * 0.66} ${Y(r) + cell * 0.66}M${X(c) + cell * 0.66} ${Y(r) + cell * 0.34}L${X(c) + cell * 0.34} ${Y(r) + cell * 0.66}`, stroke: '#C98A12', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
  }
  // walls: bricks on the edge, hazard-striped pillars standing alone in the room
  for (let r = 0; r < R; r++) for (let c = 0; c < W; c++) {
    if (walls[r][c] !== 1 || !near(r, c)) continue;
    const pillar = [0, 1, 2, 3].every((d) => walls[r + D[d][0]]?.[c + D[d][1]] === 0);
    const g = el('g', {}, svg);
    if (pillar) {
      el('ellipse', { cx: X(c) + cell / 2 + 2, cy: Y(r) + cell * 0.9, rx: cell * 0.42, ry: cell * 0.14, fill: BROWN, 'fill-opacity': '.3' }, g);
      el('rect', { x: X(c) + cell * 0.12, y: Y(r) - cell * 0.08, width: cell * 0.76, height: cell * 0.94, rx: cell * 0.26, fill: 'url(#sk-haz)', stroke: BROWN, 'stroke-width': 2.4 }, g);
      el('rect', { x: X(c) + cell * 0.12, y: Y(r) - cell * 0.08, width: cell * 0.76, height: cell * 0.94, rx: cell * 0.26, fill: 'url(#sk-sheen)' }, g);
    } else {
      el('rect', { x: X(c), y: Y(r) - 3, width: cell, height: cell + 3, style: 'fill:#C8704A', stroke: BROWN, 'stroke-width': 2.2, rx: 4 }, g);
      el('rect', { x: X(c), y: Y(r) - 3, width: cell, height: cell + 3, fill: 'url(#sk-brick)', rx: 4 }, g);
      el('rect', { x: X(c) + 1.5, y: Y(r) - 3, width: cell - 3, height: cell * 0.2, rx: 3, fill: '#fff', 'fill-opacity': '.28' }, g);
    }
  }

  // crates: cardboard boxes with a sleepy face that wakes up happy on a target
  const crateEls = h.present.crates.map((_, i) => {
    const g = el('g', { class: 'sk-mv' }, svg), b = el('g', {}, g), s = cell * 0.84, o = (cell - s) / 2, col = '#E9A85C';
    el('ellipse', { cx: cell / 2 + 2, cy: cell * 0.9, rx: s * 0.45, ry: cell * 0.1, fill: BROWN, 'fill-opacity': '.3' }, b);
    el('rect', { x: o, y: o, width: s, height: s, rx: 6, fill: col, stroke: BROWN, 'stroke-width': 2.4 }, b);
    el('rect', { x: o + 3, y: o + 3, width: s - 6, height: s - 6, rx: 4, fill: 'none', stroke: BROWN, 'stroke-opacity': '.3', 'stroke-width': 1.6 }, b);
    el('path', { d: `M${o + 5} ${o + 5}L${o + s - 5} ${o + s - 5}M${o + s - 5} ${o + 5}L${o + 5} ${o + s - 5}`, stroke: BROWN, 'stroke-opacity': '.28', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, b);
    el('rect', { x: o, y: o, width: s, height: s, rx: 6, fill: '#6BBF59', class: 'sk-tint' }, b);
    el('rect', { x: o, y: o, width: s, height: s, rx: 6, fill: 'url(#sk-sheen)' }, b);
    el('rect', { x: cell / 2 - s * 0.3, y: cell / 2 - s * 0.24, width: s * 0.6, height: s * 0.48, rx: 5, fill: '#FFF3E0', stroke: BROWN, 'stroke-width': 1.6 }, b);
    for (const dx of [-1, 1]) {
      const ex = cell / 2 + dx * s * 0.14, ey = cell / 2 - s * 0.04;
      el('circle', { cx: ex, cy: ey, r: s * 0.065, fill: BROWN, class: 'sk-e1 sk-eye' }, b);
      el('path', { d: `M${ex - s * 0.07} ${ey + s * 0.02}q${s * 0.07} -${s * 0.12} ${s * 0.14} 0`, fill: 'none', stroke: BROWN, 'stroke-width': 1.8, 'stroke-linecap': 'round', class: 'sk-eh' }, b);
    }
    el('path', { d: `M${cell / 2 - s * 0.07} ${cell / 2 + s * 0.12}q${s * 0.07} ${s * 0.07} ${s * 0.14} 0`, fill: 'none', stroke: BROWN, 'stroke-width': 1.6, 'stroke-linecap': 'round' }, b);
    el('rect', { x: cell / 2 - s * 0.06, y: o - 1, width: s * 0.12, height: s * 0.2, fill: '#FFF3E0', 'fill-opacity': '.8', stroke: BROWN, 'stroke-width': 1 }, b);
    return { g, b };
  });

  // the worker: round face, honey hard hat, stubby hands and boots
  const pl = el('g', { class: 'sk-mv' }, svg), pb = el('g', {}, pl), hands = el('g', { class: 'sk-mv' }, pb), hat = el('g', {}, pb), eyes = el('g', { class: 'sk-mv' }, pb);
  const cx = cell / 2, cy = cell / 2, u = cell;
  el('ellipse', { cx: cx + 2, cy: cy + u * 0.4, rx: u * 0.32, ry: u * 0.09, fill: BROWN, 'fill-opacity': '.3' }, pb);
  for (const dx of [-1, 1]) el('ellipse', { cx: cx + dx * u * 0.15, cy: cy + u * 0.36, rx: u * 0.13, ry: u * 0.08, fill: '#7A4A2A', stroke: BROWN, 'stroke-width': 1.8 }, pb);
  el('circle', { cx, cy: cy + u * 0.02, r: u * 0.34, fill: '#FFDDB8', stroke: BROWN, 'stroke-width': 2.6 }, pb);
  el('circle', { cx, cy: cy + u * 0.02, r: u * 0.34, fill: 'url(#sk-sheen)' }, pb);
  for (const dx of [-1, 1]) {
    el('circle', { cx: cx + dx * u * 0.2, cy: cy + u * 0.16, r: u * 0.06, fill: '#F4623A', 'fill-opacity': '.35' }, pb);
    const ey = el('g', { class: 'sk-eye' }, eyes);
    el('circle', { cx: cx + dx * u * 0.12, cy: cy, r: u * 0.09, fill: '#fff', stroke: BROWN, 'stroke-width': 1.4 }, ey);
    el('circle', { cx: cx + dx * u * 0.12, cy: cy, r: u * 0.045, fill: BROWN }, ey);
    el('ellipse', { cx: cx + dx * u * 0.43, cy: cy + u * 0.12, rx: u * 0.07, ry: u * 0.09, fill: '#FFDDB8', stroke: BROWN, 'stroke-width': 1.8 }, hands);
  }
  el('path', { d: `M${cx - u * 0.1} ${cy + u * 0.15}q${u * 0.1} ${u * 0.1} ${u * 0.2} 0`, fill: 'none', stroke: BROWN, 'stroke-width': 1.8, 'stroke-linecap': 'round' }, pb);
  el('path', { d: `M${cx - u * 0.36} ${cy - u * 0.12}Q${cx - u * 0.34} ${cy - u * 0.5} ${cx} ${cy - u * 0.5}Q${cx + u * 0.34} ${cy - u * 0.5} ${cx + u * 0.36} ${cy - u * 0.12}Z`, fill: '#FFC857', stroke: BROWN, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, hat);
  el('rect', { x: cx - u * 0.42, y: cy - u * 0.15, width: u * 0.84, height: u * 0.08, rx: u * 0.04, fill: '#FFC857', stroke: BROWN, 'stroke-width': 2 }, hat);
  el('path', { d: `M${cx} ${cy - u * 0.5}V${cy - u * 0.16}`, stroke: BROWN, 'stroke-opacity': '.4', 'stroke-width': 2 }, hat);
  el('path', { d: `M${cx - u * 0.22} ${cy - u * 0.3}q${u * 0.06} -${u * 0.1} ${u * 0.16} -${u * 0.12}`, fill: 'none', stroke: '#fff', 'stroke-opacity': '.8', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, hat);
  const fx = el('g', { 'pointer-events': 'none' }, svg);

  const tr = (n, [r, c]) => { n.style.transform = `translate(${X(c)}px, ${Y(r)}px)`; };
  const onTarget = (p) => h.present.targets.some((t) => t[0] === p[0] && t[1] === p[1]);
  const place = () => {
    h.present.crates.forEach((p, i) => { tr(crateEls[i].g, p); crateEls[i].g.classList.toggle('sk-on', onTarget(p)); });
    tr(pl, h.present.player);
    const [dr, dc] = D[face];
    eyes.style.transform = `translate(${dc * u * 0.05}px, ${dr * u * 0.04}px)`;
    hands.style.transform = 'none';
  };
  const hud = () => ctx.hud({ moves: h.present.moves, best, tries: h.tries, maxTries: logic.maxTries(), canUndo: h.past.length > 0 });
  const sq = (node, d, a, b) => { // squash and stretch along the move axis
    const [x, y] = d % 2 ? [a, b] : [b, a];
    anim(node, [{ transform: 'none' }, { transform: `scale(${x},${y})`, offset: 0.35 }, { transform: `scale(${2 - x * 0.5},${2 - y * 0.5}) translateY(-2px)`, offset: 0.7 }, { transform: 'none' }], { duration: 300, easing: 'ease-out' });
  };

  function step(d) {
    const before = h.present, nh = play(h, logic, { d });
    if (nh === h) { face = d; place(); anim(pb, [{ transform: 'none' }, { transform: `translate(${D[d][1] * 4}px, ${D[d][0] * 4}px)` }, { transform: 'none' }], { duration: 160 }); BONK(); return false; }
    h = nh; face = d;
    const ci = h.present.crates.findIndex((p, i) => p[0] !== before.crates[i][0] || p[1] !== before.crates[i][1]);
    place(); hud();
    ctx.sound.move(h.present.moves);
    if (ci >= 0) {
      sq(crateEls[ci].b, d, 1.12, 0.88); sq(pb, d, 1.14, 0.9);
      const [dr, dc] = D[d]; hands.style.transform = `translate(${dc * u * 0.18}px, ${dr * u * 0.12}px)`;
      SCRAPE();
      if (onTarget(h.present.crates[ci]) && !onTarget(before.crates[ci])) {
        later(DING, 120);
        for (let k = 0; k < 5; k++) spark(X(h.present.crates[ci][1]) + cell / 2, Y(h.present.crates[ci][0]) + cell / 2, k);
      }
    } else anim(pb, [{ transform: 'none' }, { transform: 'translateY(-4px) scale(.95,1.08)', offset: 0.45 }, { transform: 'scale(1.05,.95)', offset: 0.8 }, { transform: 'none' }], { duration: 190, easing: 'ease-out' });
    if (logic.isSolved(h.present)) { queue = []; win(); }
    return true;
  }
  const spark = (x, y, k) => {
    const p = el('path', { d: 'M0 -6Q.9 -.9 6 0Q.9 .9 0 6Q-.9 .9 -6 0Q-.9 -.9 0 -6Z', fill: '#FFD04A', stroke: BROWN, 'stroke-width': 0.9 }, fx), a = (k / 5) * Math.PI * 2;
    const an = anim(p, [{ transform: `translate(${x}px, ${y}px) scale(0)`, opacity: 1 }, { transform: `translate(${x + Math.cos(a) * 24}px, ${y + Math.sin(a) * 24}px) scale(1.2) rotate(45deg)`, offset: 0.5 }, { transform: `translate(${x + Math.cos(a) * 34}px, ${y + Math.sin(a) * 34}px) scale(0) rotate(90deg)`, opacity: 0 }], { duration: 650, fill: 'both', easing: 'ease-out' });
    an ? (an.onfinish = () => p.remove()) : p.remove();
  };

  const pump = () => {
    stepT = null;
    if (!queue.length || won) return;
    const ok = step(queue.shift());
    if (!ok) queue = [];
    if (queue.length) stepT = later(pump, ctx.reduceMotion ? 70 : 150);
  };
  const go = (dirs) => { queue = dirs; if (stepT == null && dirs.length) pump(); };

  const bfs = (target) => {
    const s = h.present, key = (r, c) => r * W + c, blocked = new Set(s.crates.map((p) => key(...p))), prev = new Map([[key(...s.player), null]]);
    const q = [s.player];
    while (q.length) {
      const [r, c] = q.shift();
      if (r === target[0] && c === target[1]) { const out = []; for (let k = key(r, c); prev.get(k); k = prev.get(k).from) out.unshift(prev.get(k).d); return out; }
      for (let d = 0; d < 4; d++) { const nr = r + D[d][0], nc = c + D[d][1], k = key(nr, nc); if (walls[nr]?.[nc] !== 0 || blocked.has(k) || prev.has(k)) continue; prev.set(k, { from: key(r, c), d }); q.push([nr, nc]); }
    }
    return null;
  };
  const tapTile = (r, c) => {
    const [pr, pc] = h.present.player;
    if (r === pr && c === pc) return;
    const path = bfs([r, c]);
    if (path) return go(path);
    if (r === pr || c === pc) { const d = r === pr ? (c > pc ? 1 : 3) : r > pr ? 2 : 0; return go(Array(Math.abs(r - pr) + Math.abs(c - pc)).fill(d)); }
  };

  const onDown = (e) => { if (won || (e.pointerType === 'mouse' && e.button !== 0)) return; unlock(); swipe = { id: e.pointerId, x: e.clientX, y: e.clientY }; };
  const onUp = (e) => {
    if (!swipe || e.pointerId !== swipe.id) return;
    const dx = e.clientX - swipe.x, dy = e.clientY - swipe.y; swipe = null;
    if (Math.hypot(dx, dy) > 22) return go([Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : dy > 0 ? 2 : 0]);
    const b = svg.getBoundingClientRect(), s = V / b.width, c = Math.floor(((e.clientX - b.left) * s - ox) / cell), r = Math.floor(((e.clientY - b.top) * s - oy) / cell);
    if (inside.has(`${r},${c}`)) tapTile(r, c);
  };
  svg.addEventListener('pointerdown', onDown); svg.addEventListener('pointerup', onUp);
  svg.addEventListener('pointercancel', () => { swipe = null; });

  const pad2 = document.createElement('div'); pad2.className = 'sk-pad';
  [[0, 2, 1], [1, 1, 2], [2, 2, 2], [3, 3, 2]].forEach(([d, col, row]) => {
    const b = document.createElement('button'); b.style.gridColumn = col; b.style.gridRow = row; b.setAttribute('aria-label', ['up', 'right', 'down', 'left'][d]);
    b.innerHTML = `<svg viewBox="0 0 24 24"><path d="${ARROW[d]}"/></svg>`;
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); unlock(); if (!won) go([d]); });
    pad2.appendChild(b);
  });
  root.appendChild(pad2);
  const onKey = (e) => { const d = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3 }[e.key]; if (d != null && !won) { e.preventDefault(); go([d]); } };
  addEventListener('keydown', onKey);

  function win() {
    won = true;
    later(() => {
      ctx.sound.win(); [784, 988, 1175, 1568].forEach((f, k) => blip(f, f, 0.3, 0.05, 'triangle', k * 0.09));
      anim(pb, [{ transform: 'none' }, { transform: 'translateY(-16px) scale(.92,1.14)' }, { transform: 'scale(1.12,.88)' }, { transform: 'translateY(-10px) scale(.96,1.07)' }, { transform: 'none' }], { duration: 1000, easing: 'ease-out' });
      anim(hat, [{ transform: 'none' }, { transform: 'translateY(-34px) rotate(200deg)', offset: 0.5 }, { transform: 'none' }], { duration: 900, delay: 100, easing: 'cubic-bezier(.3,.7,.4,1)' });
      hands.style.transform = `translate(0, -${u * 0.3}px)`;
      h.present.crates.forEach((p, i) => {
        anim(crateEls[i].b, [{ transform: 'none' }, { transform: 'translateY(-12px) scale(.95,1.08)', offset: 0.4 }, { transform: 'none' }], { duration: 480, delay: 100 + i * 80, easing: 'cubic-bezier(.34,1.56,.64,1)' });
        for (let k = 0; k < 6; k++) {
          const q = el(k % 3 ? 'circle' : 'rect', k % 3 ? { cx: 0, cy: 0, r: 4.5 } : { x: -4, y: -4, width: 8, height: 8, rx: 2 }, fx);
          q.setAttribute('fill', C[(i + k) % C.length]); q.setAttribute('stroke', BROWN); q.setAttribute('stroke-width', 1.2);
          const x = X(p[1]) + cell / 2, y = Y(p[0]) + cell / 2, ang = Math.PI * (1.15 + 0.7 * (k / 5)), v = 40 + (k * 29 % 40);
          const a = anim(q, [{ transform: `translate(${x}px, ${y}px)`, opacity: 1 }, { transform: `translate(${x + Math.cos(ang) * v}px, ${y + Math.sin(ang) * v}px) rotate(140deg)`, opacity: 1, offset: 0.45 }, { transform: `translate(${x + Math.cos(ang) * v * 1.2}px, ${y + 70}px) rotate(300deg)`, opacity: 0 }], { duration: 950, delay: 100 + i * 80, easing: 'cubic-bezier(.215,.61,.355,1)', fill: 'both' });
          a ? (a.onfinish = () => q.remove()) : q.remove();
        }
      });
    }, 250);
    later(() => ctx.solved({ score: logic.score(h.present) }), 700);
  }

  const settle = () => {
    queue = []; if (stepT != null) { clearTimeout(stepT); timers.delete(stepT); stepT = null; }
    for (const t of timers) clearTimeout(t);
    timers.clear(); anims.splice(0).forEach((a) => { try { a.cancel(); } catch (_) {} });
    won = false; fx.textContent = ''; place(); hud();
  };
  place(); hud();

  return {
    undo() { // back to just before the last crate push (steps after it come back too)
      queue = [];
      const sameCrates = (a, b) => a.crates.every((p, i) => p[0] === b.crates[i][0] && p[1] === b.crates[i][1]);
      for (let pushed = false; h.past.length && !pushed; ) { pushed = !sameCrates(h.present, h.past[h.past.length - 1]); h = undo(h, logic.maxTries()); }
      settle();
    },
    reset() { h = reset(h, logic.maxTries()); settle(); },
    destroy() {
      for (const t of timers) clearTimeout(t);
      timers.clear(); anims.splice(0).forEach((a) => { try { a.cancel(); } catch (_) {} });
      removeEventListener('keydown', onKey);
      svg.removeEventListener('pointerdown', onDown); svg.removeEventListener('pointerup', onUp);
      if (ac) { try { ac.close(); } catch (_) {} ac = null; }
      root.classList.remove('sk-still', 'g-sokoban');
      root.textContent = '';
    },
  };
}
