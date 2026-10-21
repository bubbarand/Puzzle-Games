import * as logic from '../logic/golf-tee.js';
import { newHistory, play, undo, reset } from '../logic/history.js';

const URI = (s) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
const GRAIN = URI('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .29  0 0 0 0 .17  0 0 0 0 .16  0 0 0 .17 0"/></filter><rect width="160" height="160" filter="url(#n)"/></svg>');
const CLOUDS = URI('<svg xmlns="http://www.w3.org/2000/svg" width="420" height="240"><g fill="#fff" fill-opacity=".6"><path d="M30 60h96a20 20 0 0 0-8-30 26 26 0 0 0-46-6 22 22 0 0 0-42 36z"/><path d="M250 170h120a18 18 0 0 0-6-28 24 24 0 0 0-44-4 20 20 0 0 0-70 32z"/></g></svg>');
const COURSE = URI('<svg xmlns="http://www.w3.org/2000/svg" width="420" height="130"><path d="M0 70C90 30 170 40 230 64S350 90 420 66V130H0Z" fill="#9ED36B"/><path d="M0 100C100 70 190 110 280 92S380 82 420 100V130H0Z" fill="#6BBF59"/><g stroke="#4A2C2A" stroke-width="2" stroke-linecap="round"><path d="M312 80V52"/><path d="M88 96V76"/></g><path d="M312 52l22 7-22 7z" fill="#F4623A" stroke="#4A2C2A" stroke-width="2" stroke-linejoin="round"/><path d="M88 76l16 5-16 5z" fill="#FFC857" stroke="#4A2C2A" stroke-width="1.6" stroke-linejoin="round"/><g fill="#4A2C2A" fill-opacity=".12"><ellipse cx="312" cy="82" rx="9" ry="2.5"/></g></svg>');
const PETALS = URI('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><g fill="#FFC857" fill-opacity=".7"><circle cx="40" cy="60" r="7"/><circle cx="210" cy="30" r="5"/><circle cx="120" cy="170" r="6"/></g><g fill="#FF8FB1" fill-opacity=".6"><ellipse cx="260" cy="220" rx="8" ry="4" transform="rotate(30 260 220)"/><ellipse cx="60" cy="250" rx="7" ry="3.5" transform="rotate(-20 60 250)"/><ellipse cx="170" cy="100" rx="6" ry="3" transform="rotate(50 170 100)"/></g></svg>');
const STARS = URI('<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260"><g fill="#FFF3E0"><circle cx="20" cy="30" r="1.6"/><circle cx="90" cy="70" r="1"/><circle cx="150" cy="20" r="1.8"/><circle cx="210" cy="90" r="1.2"/><circle cx="60" cy="150" r="1.2"/><circle cx="130" cy="130" r="1.6"/><circle cx="235" cy="170" r="1"/><circle cx="30" cy="225" r="1.8"/><circle cx="170" cy="215" r="1.2"/></g></svg>');
const FLIES = URI('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><g fill="#FFE08A"><circle cx="50" cy="80" r="3"/><circle cx="220" cy="40" r="2.4"/><circle cx="150" cy="200" r="3"/><circle cx="270" cy="260" r="2.4"/><circle cx="60" cy="280" r="2"/></g><g fill="#FFE08A" fill-opacity=".25"><circle cx="50" cy="80" r="9"/><circle cx="220" cy="40" r="8"/><circle cx="150" cy="200" r="9"/><circle cx="270" cy="260" r="8"/></g></svg>');

export const css = `
.g-golf-tee { --gt-s1:#BFE6FF; --gt-s2:#FFE9C7; --gt-wood:#E3A04F; --gt-wood2:#C98438; --gt-hole:#5A3322; --gt-hill:1; --gt-night:0;
  position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; min-height: 420px;
  background: ${GRAIN}, linear-gradient(180deg, var(--gt-s1) 0%, var(--gt-s2) 100%); touch-action: none; user-select: none; -webkit-user-select: none; }
@media (prefers-color-scheme: dark) { .g-golf-tee .gt-l1 { opacity: .16; } .g-golf-tee { --gt-s1:#1E1A3F; --gt-s2:#7A3F5E; --gt-wood:#9A6232; --gt-wood2:#7C4C25; --gt-hole:#2A140D; --gt-hill:.35; --gt-night:1; } }
.g-golf-tee .gt-l { position: absolute; inset: 0; pointer-events: none; background-repeat: repeat; }
.g-golf-tee .gt-l1 { background-image: ${CLOUDS}; background-size: 420px 240px; animation: gt-d1 100s linear infinite; }
.g-golf-tee .gt-l2 { background-image: ${COURSE}; background-size: 420px 130px; background-position: 0 100%; background-repeat: repeat-x; opacity: var(--gt-hill); animation: gt-d2 220s linear infinite; }
.g-golf-tee .gt-l3 { background-image: ${PETALS}; background-size: 300px 300px; animation: gt-d3 60s linear infinite, gt-fl 4s ease-in-out infinite; opacity: calc(1 - var(--gt-night)); }
.g-golf-tee .gt-l4 { background-image: ${STARS}; background-size: 260px 260px; opacity: var(--gt-night); animation: gt-tw 4s ease-in-out infinite; }
.g-golf-tee .gt-l5 { background-image: ${FLIES}; background-size: 320px 320px; opacity: var(--gt-night); animation: gt-d3 80s linear infinite reverse, gt-fl 3s ease-in-out infinite; }
@keyframes gt-d1 { to { background-position: 420px 0; } } @keyframes gt-d2 { to { background-position: 420px 100%; } } @keyframes gt-d3 { to { background-position: 300px 300px; } }
@keyframes gt-fl { 50% { filter: opacity(.5); } } @keyframes gt-tw { 50% { opacity: calc(var(--gt-night) * .5); } }
.g-golf-tee svg.gt-main { position: relative; width: 100%; max-width: 520px; height: auto; display: block; touch-action: none; }
.g-golf-tee .gt-dy { opacity: calc(1 - var(--gt-night)); } .g-golf-tee .gt-nt { opacity: var(--gt-night); }
.g-golf-tee .gt-sun { animation: gt-pulse 3s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes gt-pulse { 50% { transform: scale(1.1); } }
.g-golf-tee .gt-pb { transform-box: fill-box; transform-origin: 50% 100%; }
.g-golf-tee .gt-sel .gt-pb { animation: gt-wig .55s ease-in-out infinite; }
@keyframes gt-wig { 0%,100% { transform: translateY(-5px) rotate(-5deg); } 50% { transform: translateY(-8px) rotate(5deg); } }
.g-golf-tee .gt-eye { transform-box: fill-box; transform-origin: center; animation: gt-blink 4.5s infinite; }
@keyframes gt-blink { 0%,94%,100% { transform: scaleY(1); } 97% { transform: scaleY(.1); } }
.g-golf-tee .gt-meh { display: none; } .g-golf-tee.gt-stuck .gt-meh { display: inline; } .g-golf-tee.gt-stuck .gt-grin { display: none; }
.g-golf-tee.gt-stuck .gt-pb { animation: gt-sway 2.4s ease-in-out infinite; }
@keyframes gt-sway { 50% { transform: rotate(4deg); } }
.g-golf-tee .gt-ring { transform-box: fill-box; transform-origin: center; animation: gt-ring 1s ease-in-out infinite; }
@keyframes gt-ring { 50% { transform: scale(1.18); opacity: .7; } }
.g-golf-tee .gt-flag { transform-box: fill-box; transform-origin: 0 50%; animation: gt-wave 1s ease-in-out infinite; }
@keyframes gt-wave { 50% { transform: skewY(8deg) scaleX(.9); } }
.g-golf-tee.gt-still *, .g-golf-tee.gt-still .gt-l { animation: none !important; transition: none !important; }
`;

const C = ['#F4623A', '#FFC857', '#7FC8F8', '#6BBF59', '#FF8FB1', '#B79CED'];
const BROWN = '#4A2C2A';
const NS = 'http://www.w3.org/2000/svg';
const V = 400;

export function mount(root, ctx) {
  root.classList.add('g-golf-tee');
  const level = logic.makeLevel(ctx.level);
  const best = logic.bestScore(level);
  const tri = level.dirs.length > 4, rows = level.board.length, cols = Math.max(...level.board.map((r) => r.length));
  const total = level.board.flat().filter((v) => v === 1).length;
  const nCols = tri ? rows : cols, cell = Math.min(66, 352 / nCols), R = cell * 0.36, pad = cell * 0.3, rowStep = tri ? cell * 0.9 : cell, Y0 = cell / 2 + pad + 16;
  const pos = (r, c) => (tri ? [V / 2 + (c - r / 2) * cell, Y0 + r * rowStep] : [(V - (cols - 1) * cell) / 2 + c * cell, Y0 + r * rowStep]);
  const boardBottom = Y0 + (rows - 1) * rowStep + cell / 2 + pad, H = boardBottom + 118;
  let h = newHistory(logic.initialState(level));
  let won = false, sel = null, dests = [], drag = null, ac = null;
  const pegs = new Map(), timers = new Set(), anims = [];
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; };
  const anim = (node, kf, opt) => { if (ctx.reduceMotion) return null; const a = node.animate(kf, opt); anims.push(a); return a; };
  const key = (r, c) => r + ',' + c;

  // Own wooden voices: pock for a jump, tick for picking up, plop in the basket.
  const blip = (f0, f1, dur, gain, type = 'sine', at = 0) => {
    if (!ac) return;
    const t = ac.currentTime + at, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + 0.05);
  };
  const unlock = () => { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { ac = null; } } if (ac && ac.state === 'suspended') ac.resume(); };
  const POCK = () => { blip(620, 190, 0.1, 0.12, 'sine'); blip(1400, 500, 0.04, 0.03, 'triangle'); };
  const TICK = () => blip(1100, 1500, 0.05, 0.05, 'triangle');
  const PLOP = () => { blip(330, 130, 0.16, 0.09, 'sine', 0.05); };

  root.textContent = '';
  if (ctx.reduceMotion) root.classList.add('gt-still');
  else for (const c of ['gt-l4', 'gt-l5', 'gt-l1', 'gt-l2', 'gt-l3']) { const d = document.createElement('div'); d.className = 'gt-l ' + c; root.appendChild(d); }
  const svg = el('svg', { viewBox: `0 0 ${V} ${H}`, class: 'gt-main' });
  root.appendChild(svg);
  const defs = el('defs', {}, svg);
  const grain = el('pattern', { id: 'gt-grain', width: 60, height: 14, patternUnits: 'userSpaceOnUse' }, defs);
  el('path', { d: 'M0 4q15 -3 30 0t30 0M0 10q15 3 30 0t30 0', fill: 'none', stroke: BROWN, 'stroke-opacity': '.16', 'stroke-width': 1.6, 'stroke-linecap': 'round' }, grain);
  const sheen = el('linearGradient', { id: 'gt-sheen', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  for (const [o, c, a] of [[0, '#fff', 0.5], [0.5, '#fff', 0], [1, BROWN, 0.25]]) el('stop', { offset: o, 'stop-color': c, 'stop-opacity': a }, sheen);

  // sun by day, moon by night
  const sun = el('g', { class: 'gt-sun gt-dy' }, svg);
  for (let k = 0; k < 8; k++) el('path', { d: 'M-2.5 -13L0 -19L2.5 -13Z', transform: `translate(${V - 30} 28) rotate(${k * 45})`, fill: '#FFC857', stroke: BROWN, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, sun);
  el('circle', { cx: V - 30, cy: 28, r: 9.5, fill: '#FFC857', stroke: BROWN, 'stroke-width': 2.4 }, sun);
  const moon = el('g', { class: 'gt-sun gt-nt' }, svg);
  el('circle', { cx: V - 30, cy: 28, r: 10.5, fill: '#FFE9B0', stroke: BROWN, 'stroke-width': 2.4 }, moon);
  el('circle', { cx: V - 27, cy: 31, r: 2.2, fill: '#E7CE94' }, moon);

  // board: chunky wooden slab, drawn as an outline pass then a wood pass so any shape (block, triangle, cross) gets a round border
  const shapes = (parent, attrs) => {
    if (tri) { const [a, b, c] = [pos(0, 0), pos(rows - 1, 0), pos(rows - 1, rows - 1)]; el('polygon', { points: [a, b, c].map((p) => p.join(',')).join(' '), 'stroke-linejoin': 'round', ...attrs }, parent); return; }
    level.board.forEach((row, r) => row.forEach((v, c) => { if (v) { const [x, y] = pos(r, c); el('rect', { x: x - cell / 2, y: y - cell / 2, width: cell, height: cell, rx: 4, 'stroke-linejoin': 'round', ...attrs }, parent); } }));
  };
  const bw = pad * 2 + (tri ? cell * 0.35 : 0);
  const shadow = el('g', { transform: 'translate(5 8)', opacity: '.28' }, svg); shapes(shadow, { fill: BROWN, stroke: BROWN, 'stroke-width': bw + 6 });
  shapes(el('g', {}, svg), { fill: BROWN, stroke: BROWN, 'stroke-width': bw + 6 });
  shapes(el('g', {}, svg), { style: 'fill:var(--gt-wood);stroke:var(--gt-wood)', 'stroke-width': bw });
  shapes(el('g', {}, svg), { fill: 'url(#gt-grain)', stroke: 'url(#gt-grain)', 'stroke-width': bw });
  shapes(el('g', { opacity: '.5' }, svg), { fill: 'none', style: 'stroke:var(--gt-wood2)', 'stroke-width': 3 });
  if (!tri && level.board.every((row) => row.every((v) => v))) for (const [sr, sc] of [[0, 0], [0, 1], [1, 0], [1, 1]]) { const [x, y] = pos(sr * (rows - 1), sc * (cols - 1)), o = cell / 2 + pad * 0.5; el('circle', { cx: x + (sc ? o : -o), cy: y + (sr ? o : -o), r: 2.8, fill: BROWN, 'fill-opacity': '.5' }, svg); }
  // holes: dark cups with a pale lower lip
  level.board.forEach((row, r) => row.forEach((v, c) => {
    if (!v) return;
    const [x, y] = pos(r, c);
    el('ellipse', { cx: x, cy: y + 2.5, rx: R * 0.62, ry: R * 0.5, fill: '#fff', 'fill-opacity': '.28' }, svg);
    el('ellipse', { cx: x, cy: y, rx: R * 0.62, ry: R * 0.5, style: 'fill:var(--gt-hole)', stroke: BROWN, 'stroke-width': 1.6 }, svg);
    el('ellipse', { cx: x - R * 0.12, cy: y - R * 0.12, rx: R * 0.3, ry: R * 0.16, fill: '#000', 'fill-opacity': '.3' }, svg);
  }));
  const mk = el('g', {}, svg), pegLayer = el('g', {}, svg), fx = el('g', { 'pointer-events': 'none' }, svg);

  // basket (right) and a flag in a hole (left) under the board
  const bx = V - 80, by = boardBottom + 50;
  const basket = el('g', { transform: `translate(${bx} ${by})` }, svg), bk = el('g', {}, basket), tees = el('g', {}, bk);
  el('ellipse', { cx: 4, cy: 40, rx: 44, ry: 7, fill: BROWN, 'fill-opacity': '.25' }, bk);
  el('path', { d: 'M-36 0L-28 38Q0 46 28 38L36 0Z', fill: '#C98438', stroke: BROWN, 'stroke-width': 3, 'stroke-linejoin': 'round' }, bk);
  el('path', { d: 'M-33 12H33M-30 25H30M-14 2L-10 42M6 2L6 44M24 2L20 42', stroke: BROWN, 'stroke-opacity': '.45', 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }, bk);
  el('path', { d: 'M-38 0Q0 -10 38 0', fill: 'none', stroke: BROWN, 'stroke-width': 5.5, 'stroke-linecap': 'round' }, bk);
  el('path', { d: 'M-38 0Q0 -10 38 0', fill: 'none', stroke: '#F2A93B', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, bk);
  const fl = el('g', { transform: `translate(${50} ${by + 30})` }, svg);
  el('ellipse', { cx: 0, cy: 8, rx: 16, ry: 5, style: 'fill:var(--gt-hole)', stroke: BROWN, 'stroke-width': 2 }, fl);
  el('path', { d: 'M0 8V-28', stroke: BROWN, 'stroke-width': 3, 'stroke-linecap': 'round' }, fl);
  el('path', { d: 'M1.5 -28l24 8-24 8z', fill: '#F4623A', stroke: BROWN, 'stroke-width': 2.2, 'stroke-linejoin': 'round', class: 'gt-flag' }, fl);
  el('circle', { cx: 22, cy: 12, r: 6, fill: '#fff', stroke: BROWN, 'stroke-width': 2 }, fl);
  el('circle', { cx: 20, cy: 10, r: 1, fill: BROWN, 'fill-opacity': '.4' }, fl);

  const headAt = (g, col, x, y, r, face) => { // a tee head with stem; face optional
    el('path', { d: `M${x - r * 0.28} ${y + r * 0.6}L${x + r * 0.28} ${y + r * 0.6}L${x + r * 0.15} ${y + r * 1.5}L${x - r * 0.15} ${y + r * 1.5}Z`, fill: col, stroke: BROWN, 'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
    el('ellipse', { cx: x, cy: y, rx: r, ry: r * 0.92, fill: col, stroke: BROWN, 'stroke-width': 2.6 }, g);
    el('ellipse', { cx: x, cy: y, rx: r, ry: r * 0.92, fill: 'url(#gt-sheen)' }, g);
    el('path', { d: `M${x - r * 0.62} ${y - r * 0.3}Q${x - r * 0.45} ${y - r * 0.7} ${x - r * 0.1} ${y - r * 0.75}`, fill: 'none', stroke: '#fff', 'stroke-opacity': '.85', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, g);
    if (!face) return;
    for (const dx of [-1, 1]) {
      const eye = el('g', { class: 'gt-eye' }, g);
      el('circle', { cx: x + dx * r * 0.36, cy: y - r * 0.1, r: r * 0.24, fill: '#fff', stroke: BROWN, 'stroke-width': 1.2 }, eye);
      el('circle', { cx: x + dx * r * 0.36, cy: y - r * 0.04, r: r * 0.12, fill: BROWN }, eye);
      el('circle', { cx: x + dx * r * 0.66, cy: y + r * 0.3, r: r * 0.13, fill: '#F4623A', 'fill-opacity': '.35' }, g);
    }
    el('path', { d: `M${x - r * 0.34} ${y + r * 0.26}q${r * 0.34} ${r * 0.5} ${r * 0.68} 0z`, fill: '#fff', stroke: BROWN, 'stroke-width': 1.6, 'stroke-linejoin': 'round', class: 'gt-grin' }, g);
    el('path', { d: `M${x - r * 0.3} ${y + r * 0.42}q${r * 0.15} -${r * 0.2} ${r * 0.3} 0t${r * 0.3} 0`, fill: 'none', stroke: BROWN, 'stroke-width': 1.7, 'stroke-linecap': 'round', class: 'gt-meh' }, g);
  };
  const setBasket = (n) => {
    tees.textContent = '';
    for (let k = 0; k < Math.min(n, 9); k++) headAt(tees, C[k % C.length], -26 + (k % 5) * 13, -10 - Math.floor(k / 5) * 10 - (k % 2) * 4, 7, false);
  };
  const mkPeg = (r, c, delay) => {
    const [x, y] = pos(r, c), col = C[(r * 2 + c) % C.length];
    const g = el('g', { class: 'gt-peg' }, pegLayer);
    g.style.transform = `translate(${x}px, ${y}px)`;
    el('ellipse', { cx: 0, cy: 1, rx: R * 0.5, ry: R * 0.2, fill: BROWN, 'fill-opacity': '.3' }, g);
    const body = el('g', { class: 'gt-pb' }, g);
    headAt(body, col, 0, -R * 0.55, R, true);
    pegs.set(key(r, c), { g, body, col });
    if (delay != null) anim(body, [{ transform: 'scale(0)' }, { transform: 'scale(1.15,.9)', offset: 0.6 }, { transform: 'none' }], { duration: 380, delay, easing: 'cubic-bezier(.34,1.56,.64,1)', fill: 'backwards' });
  };

  const confetti = (x, y) => {
    for (let k = 0; k < 18; k++) {
      const p = el(k % 3 ? 'circle' : 'rect', k % 3 ? { cx: 0, cy: 0, r: 5 } : { x: -4.5, y: -4.5, width: 9, height: 9, rx: 2.5 }, fx);
      p.setAttribute('fill', C[k % C.length]); p.setAttribute('stroke', BROWN); p.setAttribute('stroke-width', 1.2);
      const ang = Math.PI * (1.1 + 0.8 * (k / 17)), v = 60 + (k * 37 % 70);
      const a = anim(p, [{ transform: `translate(${x}px, ${y}px)`, opacity: 1 }, { transform: `translate(${x + Math.cos(ang) * v}px, ${y + Math.sin(ang) * v}px) rotate(160deg)`, opacity: 1, offset: 0.45 }, { transform: `translate(${x + Math.cos(ang) * v * 1.3}px, ${y + 110}px) rotate(320deg)`, opacity: 0 }], { duration: 1000 + (k % 4) * 90, easing: 'cubic-bezier(.215,.61,.355,1)', fill: 'both' });
      a ? (a.onfinish = () => p.remove()) : p.remove();
    }
  };

  const clearSel = () => { sel = null; dests = []; mk.textContent = ''; pegs.forEach((p) => p.g.classList.remove('gt-sel')); };
  const select = (r, c) => {
    clearSel();
    const ms = logic.legalMoves(h.present).filter((m) => m.from[0] === r && m.from[1] === c);
    const p = pegs.get(key(r, c));
    if (!ms.length || !p) { if (p) anim(p.body, [{ transform: 'none' }, { transform: 'rotate(-9deg)' }, { transform: 'rotate(9deg)' }, { transform: 'none' }], { duration: 300 }); blip(180, 140, 0.12, 0.05, 'triangle'); return; }
    sel = [r, c]; dests = ms; p.g.classList.add('gt-sel'); TICK();
    for (const m of ms) {
      const [x, y] = pos(r + 2 * m.dir[0], c + 2 * m.dir[1]);
      const ring = el('g', { transform: `translate(${x} ${y})` }, mk);
      el('circle', { r: R * 0.95, fill: '#FFE08A', 'fill-opacity': '.45', stroke: '#fff', 'stroke-width': 3, 'stroke-dasharray': '5 5', class: 'gt-ring' }, ring);
      el('circle', { r: 4, fill: '#fff', stroke: BROWN, 'stroke-width': 1.5 }, ring);
    }
  };
  const stuckCheck = () => root.classList.toggle('gt-stuck', !logic.isSolved(h.present) && logic.legalMoves(h.present).length === 0);
  const hud = () => ctx.hud({ moves: h.present.moves, best, tries: h.tries, maxTries: logic.maxTries(), canUndo: h.past.length > 0 });

  function doMove(m) {
    const [r, c] = m.from, [dr, dc] = m.dir, [x0, y0] = pos(r, c), [x1, y1] = pos(r + 2 * dr, c + 2 * dc);
    const mid = pegs.get(key(r + dr, c + dc)), me = pegs.get(key(r, c));
    clearSel();
    h = play(h, logic, m);
    if (!me || !mid) return rebuild();
    pegs.delete(key(r, c)); pegs.delete(key(r + dr, c + dc)); pegs.set(key(r + 2 * dr, c + 2 * dc), me);
    me.g.style.transform = `translate(${x1}px, ${y1}px)`;
    const arc = Math.hypot(x1 - x0, y1 - y0) * 0.45;
    anim(me.g, [{ transform: `translate(${x0}px, ${y0}px)` }, { transform: `translate(${(x0 + x1) / 2}px, ${(y0 + y1) / 2 - arc}px)`, offset: 0.5 }, { transform: `translate(${x1}px, ${y1}px)` }], { duration: 420, easing: 'cubic-bezier(.3,.7,.4,1)' });
    anim(me.body, [{ transform: 'none' }, { transform: 'scale(.9,1.2)', offset: 0.2 }, { transform: 'scale(.95,1.1)', offset: 0.55 }, { transform: 'scale(1.22,.74)', offset: 0.82 }, { transform: 'scale(.95,1.06)', offset: 0.92 }, { transform: 'none' }], { duration: 420 });
    // the jumped tee pops up and arcs into the basket
    const [mx, my] = pos(r + dr, c + dc);
    const tx = bx - 6, ty = by - 14;
    if (ctx.reduceMotion) mid.g.remove();
    else {
      anim(mid.body, [{ transform: 'none' }, { transform: 'scale(1.3,1.3)', offset: 0.4 }, { transform: 'scale(.7)' }], { duration: 520, delay: 160, easing: 'ease-out', fill: 'forwards' });
      const a = anim(mid.g, [{ transform: `translate(${mx}px, ${my}px) rotate(0)` }, { transform: `translate(${(mx + tx) / 2}px, ${Math.min(my, ty) - 70}px) rotate(200deg)`, offset: 0.5 }, { transform: `translate(${tx}px, ${ty}px) rotate(360deg)` }], { duration: 640, delay: 160, easing: 'cubic-bezier(.4,.1,.6,.9)', fill: 'forwards' });
      a.onfinish = () => mid.g.remove();
    }
    later(POCK, 330);
    ctx.sound.move(h.present.moves);
    later(() => { setBasket(total - pegCount()); PLOP(); anim(bk, [{ transform: 'none' }, { transform: 'rotate(-6deg) scale(1.05,.95)' }, { transform: 'rotate(4deg)' }, { transform: 'none' }], { duration: 380 }); }, ctx.reduceMotion ? 0 : 780);
    hud(); stuckCheck();
    if (logic.isSolved(h.present)) win(x1, y1, me);
  }
  const pegCount = () => h.present.board.flat().filter((v) => v === 1).length;

  function win(x, y, me) {
    won = true;
    later(() => {
      ctx.sound.win(); [784, 988, 1175, 1568].forEach((f, k) => blip(f, f, 0.3, 0.05, 'triangle', k * 0.09));
      anim(me.body, [{ transform: 'none' }, { transform: 'translateY(-20px) scale(.9,1.15)' }, { transform: 'scale(1.15,.85)' }, { transform: 'translateY(-14px) scale(.95,1.08)' }, { transform: 'scale(1.1,.9)' }, { transform: 'none' }], { duration: 1100, easing: 'ease-out' });
      const flag = el('g', { transform: `translate(${x} ${y - R * 2.2})` }, fx);
      el('path', { d: 'M0 4V-24', stroke: BROWN, 'stroke-width': 3, 'stroke-linecap': 'round' }, flag);
      el('path', { d: 'M1.5 -24l20 7-20 7z', fill: '#FFC857', stroke: BROWN, 'stroke-width': 2.2, 'stroke-linejoin': 'round', class: 'gt-flag' }, flag);
      anim(flag, [{ opacity: 0 }, { opacity: 1 }], { duration: 250 });
      confetti(x, y - 10);
    }, 330);
    later(() => ctx.solved({ score: logic.score(h.present) }), 700);
  }

  function rebuild() {
    for (const t of timers) clearTimeout(t);
    timers.clear(); anims.splice(0).forEach((a) => { try { a.cancel(); } catch (_) {} });
    won = false; drag = null; clearSel(); fx.textContent = ''; pegLayer.textContent = ''; pegs.clear();
    let n = 0;
    h.present.board.forEach((row, r) => row.forEach((v, c) => { if (v === 1) mkPeg(r, c, ctx.reduceMotion ? null : (n++ % 6) * 25); }));
    setBasket(total - pegCount());
    hud(); stuckCheck();
  }

  // input: tap a tee, then a glowing hole; or drag a tee onto a glowing hole
  const toView = (e) => { const b = svg.getBoundingClientRect(), s = V / b.width; return [(e.clientX - b.left) * s, (e.clientY - b.top) * s]; };
  const nearest = (px, py) => {
    let bestD = cell * 0.62, out = null;
    level.board.forEach((row, r) => row.forEach((v, c) => { if (v) { const [x, y] = pos(r, c), d = Math.hypot(x - px, y - py); if (d < bestD) { bestD = d; out = [r, c]; } } }));
    return out;
  };
  const destAt = (hole) => hole && dests.find((m) => m.from[0] + 2 * m.dir[0] === hole[0] && m.from[1] + 2 * m.dir[1] === hole[1]);
  const onDown = (e) => {
    if (won || (e.pointerType === 'mouse' && e.button !== 0)) return;
    unlock();
    const [px, py] = toView(e), hole = nearest(px, py);
    if (!hole) return clearSel();
    const m = destAt(hole);
    if (m) return doMove(m);
    if (h.present.board[hole[0]][hole[1]] === 1) {
      select(hole[0], hole[1]);
      if (sel) { drag = { id: e.pointerId, sx: px, sy: py, moved: false, hole }; try { svg.setPointerCapture(e.pointerId); } catch (_) {} }
    } else clearSel();
    e.preventDefault();
  };
  const onMove = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const [px, py] = toView(e);
    if (!drag.moved && Math.hypot(px - drag.sx, py - drag.sy) < 8) return;
    drag.moved = true;
    const p = pegs.get(key(...drag.hole)); if (!p) return;
    const [x, y] = pos(...drag.hole);
    p.g.style.transform = `translate(${x + px - drag.sx}px, ${y + py - drag.sy - 8}px)`;
  };
  const onUp = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag; drag = null;
    if (!d.moved) return;
    const [px, py] = toView(e), m = destAt(nearest(px, py)), p = pegs.get(key(...d.hole)), [x, y] = pos(...d.hole);
    if (m) { if (p) p.g.style.transform = `translate(${x}px, ${y}px)`; doMove(m); } else if (p) { p.g.style.transform = `translate(${x}px, ${y}px)`; anim(p.g, [{ transform: `translate(${x + px - d.sx}px, ${y + py - d.sy - 8}px)` }, { transform: `translate(${x}px, ${y}px)` }], { duration: 260, easing: 'cubic-bezier(.34,1.56,.64,1)' }); }
  };
  svg.addEventListener('pointerdown', onDown);
  svg.addEventListener('pointermove', onMove);
  svg.addEventListener('pointerup', onUp);
  svg.addEventListener('pointercancel', onUp);

  rebuild();

  return {
    undo() { if (drag) return; h = undo(h, logic.maxTries()); rebuild(); },
    reset() { if (drag) return; h = reset(h, logic.maxTries()); rebuild(); },
    destroy() {
      for (const t of timers) clearTimeout(t);
      timers.clear(); anims.splice(0).forEach((a) => { try { a.cancel(); } catch (_) {} });
      svg.removeEventListener('pointerdown', onDown); svg.removeEventListener('pointermove', onMove);
      svg.removeEventListener('pointerup', onUp); svg.removeEventListener('pointercancel', onUp);
      if (ac) { try { ac.close(); } catch (_) {} ac = null; }
      root.classList.remove('gt-still', 'gt-stuck', 'g-golf-tee');
      root.textContent = '';
    },
  };
}
