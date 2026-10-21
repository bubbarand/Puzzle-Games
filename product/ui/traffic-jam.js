import * as logic from '../logic/traffic-jam.js';
import { newHistory, play, undo, reset } from '../logic/history.js';

const URI = (s) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
const GRAIN = URI('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .29  0 0 0 0 .17  0 0 0 0 .16  0 0 0 .17 0"/></filter><rect width="160" height="160" filter="url(#n)"/></svg>');
const CLOUDS = URI('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260"><g fill="#fff" fill-opacity=".55"><path d="M40 70h90a20 20 0 0 0-8-30 26 26 0 0 0-46-6 22 22 0 0 0-36 36z"/><path d="M240 190h110a18 18 0 0 0-6-28 24 24 0 0 0-44-4 20 20 0 0 0-60 32z"/></g></svg>');
const HILLS = URI('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="110"><path d="M0 70C80 30 160 30 200 56S320 84 400 70V110H0Z" fill="#F4A25A" fill-opacity=".55"/><path d="M0 92C90 62 170 100 250 84S350 70 400 92V110H0Z" fill="#E98B4B" fill-opacity=".5"/><g fill="#6BBF59" fill-opacity=".7"><circle cx="70" cy="76" r="7"/><circle cx="82" cy="80" r="5"/><circle cx="300" cy="88" r="8"/><circle cx="314" cy="92" r="5"/></g></svg>');
const DOTS = URI('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><g fill="#FFC857" fill-opacity=".6"><circle cx="40" cy="60" r="10"/><circle cx="210" cy="30" r="6"/><circle cx="120" cy="150" r="8"/><circle cx="260" cy="230" r="12"/><circle cx="60" cy="260" r="5"/></g></svg>');
const STARS = URI('<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260"><g fill="#FFF3E0"><circle cx="20" cy="30" r="1.6"/><circle cx="90" cy="70" r="1"/><circle cx="150" cy="20" r="1.8"/><circle cx="210" cy="90" r="1.2"/><circle cx="60" cy="150" r="1.2"/><circle cx="130" cy="130" r="1.6"/><circle cx="235" cy="170" r="1"/><circle cx="30" cy="225" r="1.8"/><circle cx="170" cy="215" r="1.2"/></g></svg>');
const HOUSES = [[10, 50, 34], [52, 36, 48], [104, 60, 30], [142, 44, 40], [196, 30, 52], [258, 56, 32], [300, 40, 44], [352, 52, 36]]; // x, top, width: night skyline with lit windows
const TOWN = URI('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="120"><g fill="#1A1030">' + HOUSES.map(([x, y, w]) => `<rect x="${x}" y="${y + 40}" width="${w}" height="${80 - y}" rx="3"/>`).join('') + '</g><g fill="#FFD36B">' + HOUSES.map(([x, y, w], k) => [0, 1, 2].map((j) => (k * 3 + j) % 4 === 3 ? '' : `<rect x="${x + 6 + (j % 2) * (w / 2 - 2)}" y="${y + 50 + Math.floor(j / 2) * 14 + (k % 2) * 8}" width="6" height="7" rx="1.5"/>`).join('')).join('') + '</g></svg>');
const BIRD = '<svg class="tj-bird" viewBox="0 0 24 14" xmlns="http://www.w3.org/2000/svg"><path d="M1 11Q7 -1 12 8Q17 -1 23 11" fill="none" stroke="#4A2C2A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export const css = `
.g-traffic-jam { --tj-s1:#FFD9A8; --tj-s2:#FFB26B; --tj-wood:#F2A93B; --tj-floor:#FFE3B3; --tj-alt:#F7CF8E; --tj-road:#7A6460; --tj-day:1; --tj-night:0; --tj-beam:0; --tj-win:#DFF3FF; --tj-cabo:.3;
  position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;
  min-height: 420px; background: ${GRAIN}, linear-gradient(180deg, var(--tj-s1) 0%, var(--tj-s2) 100%); touch-action: none; user-select: none; -webkit-user-select: none; }
@media (prefers-color-scheme: dark) { .g-traffic-jam { --tj-s1:#241743; --tj-s2:#86405E; --tj-wood:#8C5A2B; --tj-floor:#4D3858; --tj-alt:#432F51; --tj-road:#2E2438; --tj-day:0; --tj-night:1; --tj-beam:.5; --tj-win:#FFE08A; --tj-cabo:.55; } }
.g-traffic-jam .tj-l { position: absolute; inset: 0; background-repeat: repeat; pointer-events: none; }
.g-traffic-jam .tj-l1 { background-image: ${CLOUDS}; background-size: 400px 260px; animation: tj-d1 90s linear infinite; }
.g-traffic-jam .tj-l3 { background-image: ${HILLS}; background-size: 400px 110px; background-position: 0 100%; background-repeat: repeat-x; animation: tj-d3 200s linear infinite; }
.g-traffic-jam .tj-l5 { background-image: ${TOWN}; background-size: 400px 120px; background-position: 0 100%; background-repeat: repeat-x; opacity: var(--tj-night); animation: tj-d5 320s linear infinite; }
@keyframes tj-d5 { to { background-position: 400px 100%; } }
.g-traffic-jam .tj-l4 { background-image: ${STARS}; background-size: 260px 260px; opacity: var(--tj-night); animation: tj-tw 4s ease-in-out infinite; }
@keyframes tj-tw { 50% { opacity: calc(var(--tj-night) * .5); } }
@keyframes tj-d3 { to { background-position: 400px 100%; } }
.g-traffic-jam .tj-l2 { background-image: ${DOTS}; background-size: 300px 300px; animation: tj-d2 140s linear infinite reverse, tj-fl 3.4s ease-in-out infinite; }
@keyframes tj-fl { 50% { opacity: .45; } }
@keyframes tj-d1 { to { background-position: 400px 0; } }
@keyframes tj-d2 { to { background-position: 300px 0; } }
@media (prefers-color-scheme: dark) { .g-traffic-jam .tj-l1 { opacity: .2; } .g-traffic-jam .tj-l3 { filter: brightness(.32) saturate(.7) hue-rotate(-25deg); } }
.g-traffic-jam .tj-birds { position: absolute; inset: 0; pointer-events: none; opacity: var(--tj-day); }
.g-traffic-jam .tj-bird { position: absolute; left: -30px; width: 24px; animation: tj-fly 26s linear infinite; }
.g-traffic-jam .tj-bird path { transform-origin: 12px 12px; animation: tj-flap .8s ease-in-out infinite; }
@keyframes tj-fly { from { left: -30px; } to { left: calc(100% + 30px); } }
@keyframes tj-flap { 50% { transform: scaleY(.3); } }
.g-traffic-jam svg.tj-main { position: relative; width: 100%; max-width: 520px; height: auto; aspect-ratio: 1; display: block; touch-action: none; }
.g-traffic-jam .tj-car { cursor: grab; }
.g-traffic-jam .tj-car.tj-anim { transition: transform .42s cubic-bezier(.34,1.56,.64,1); }
.g-traffic-jam .tj-k-small.tj-anim { transition-duration: .34s; transition-timing-function: cubic-bezier(.34,1.85,.64,1); }
.g-traffic-jam .tj-k-bus.tj-anim { transition-duration: .55s; transition-timing-function: cubic-bezier(.3,1.25,.5,1); }
.g-traffic-jam .tj-k-truck.tj-anim { transition-duration: .68s; transition-timing-function: cubic-bezier(.3,1.1,.5,1); }
.g-traffic-jam .tj-win { fill: var(--tj-win); } .g-traffic-jam .tj-cab { fill: var(--tj-win); fill-opacity: var(--tj-cabo); }
.g-traffic-jam .tj-halo { animation: tj-glow 3.2s ease-in-out infinite; }
@keyframes tj-glow { 50% { opacity: .55; } }
.g-traffic-jam .tj-sp { transform-box: fill-box; transform-origin: center; animation: tj-spark 2.4s ease-in-out infinite; }
@keyframes tj-spark { 0%,100% { opacity: .15; transform: scale(.4); } 35% { opacity: 1; transform: scale(1.1) rotate(45deg); } }
.g-traffic-jam .tj-car.tj-drag { cursor: grabbing; }
.g-traffic-jam .tj-body { transform-box: fill-box; transform-origin: center; }
.g-traffic-jam .tj-car.tj-drag .tj-body { filter: drop-shadow(0 3px 2px rgba(74,44,42,.35)); }
.g-traffic-jam .tj-dy { opacity: var(--tj-day); } .g-traffic-jam .tj-nt { opacity: var(--tj-night); }
.g-traffic-jam .tj-beam { opacity: var(--tj-beam); pointer-events: none; }
.g-traffic-jam .tj-sun, .g-traffic-jam .tj-moon { animation: tj-pulse 3s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes tj-pulse { 50% { transform: scale(1.12); } }
.g-traffic-jam .tj-rays { animation: tj-spin 24s linear infinite; transform-box: fill-box; transform-origin: center; }
@keyframes tj-spin { to { transform: rotate(360deg); } }
.g-traffic-jam .tj-go { animation: tj-nudge 1.2s ease-in-out infinite; }
@keyframes tj-nudge { 50% { transform: translateX(4px); } }
.g-traffic-jam .tj-arm { transition: transform .55s cubic-bezier(.34,1.56,.64,1); }
.g-traffic-jam .tj-open .tj-arm { transform: rotate(-90deg); }
.g-traffic-jam .tj-lamp { fill: #F4623A; transition: fill .3s; }
.g-traffic-jam .tj-open .tj-lamp { fill: #6BBF59; }
.g-traffic-jam .tj-hop { animation: tj-hop 3.6s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 100%; }
@keyframes tj-hop { 0%,70%,100% { transform: none; } 76% { transform: translateY(-5px); } 82% { transform: none; } 88% { transform: translateY(-3px) rotate(-6deg); } 94% { transform: none; } }
.g-traffic-jam .tj-eye { animation: tj-blink 4.5s infinite; transform-box: fill-box; transform-origin: center; }
@keyframes tj-blink { 0%,94%,100% { transform: scaleY(1); } 97% { transform: scaleY(.1); } }
.g-traffic-jam .tj-car.tj-drag .tj-body { animation: tj-hum .12s linear infinite; }
@keyframes tj-hum { 25% { transform: translate(.6px,-.6px) rotate(-.6deg); } 75% { transform: translate(-.6px,.6px) rotate(.6deg); } }
.g-traffic-jam.tj-still *, .g-traffic-jam.tj-still .tj-eye, .g-traffic-jam.tj-still .tj-car.tj-drag .tj-body, .g-traffic-jam.tj-still .tj-hop, .g-traffic-jam.tj-still .tj-arm { animation: none !important; transition: none !important; }
`;

const C = ['#F4623A', '#FFC857', '#7FC8F8', '#6BBF59', '#FF8FB1', '#FFB26B', '#2EC4B6', '#B79CED'];
const BROWN = '#4A2C2A';
const STAR4 = 'M0 -5.5Q.8 -.8 5.5 0Q.8 .8 0 5.5Q-.8 .8 -5.5 0Q-.8 -.8 0 -5.5Z';
const NS = 'http://www.w3.org/2000/svg';
const V = 400, M = 40, THICK = 0.79;

export function mount(root, ctx) {
  root.classList.add('g-traffic-jam');
  const level = logic.makeLevel(ctx.level);
  const best = logic.bestScore(level);
  const n = level.size, cell = (V - 2 * M) / n, pad = (cell * (1 - THICK)) / 2;
  let h = newHistory(logic.initialState(level));
  let won = false, dragging = null, wasOpen = null, ac = null;
  const pops = [];
  const timers = new Set();
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    parent && parent.appendChild(e);
    return e;
  };
  // Own tiny synth for vehicle voices (ctx.sound only has the class scale). Starts on the first touch.
  const blip = (f0, f1, dur, gain, type = 'sine', at = 0) => {
    if (!ac) return;
    const t = ac.currentTime + at, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + 0.05);
  };
  const unlock = () => { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { ac = null; } } if (ac && ac.state === 'suspended') ac.resume(); };
  const VOICE = { // [kind]: what the car says when it lands
    hero: () => { blip(523, 784, 0.16, 0.06, 'triangle'); blip(784, 1047, 0.14, 0.05, 'triangle', 0.1); },
    small: () => blip(740, 1175, 0.15, 0.06, 'sine'),
    truck: () => { blip(98, 70, 0.4, 0.07, 'sawtooth'); blip(49, 41, 0.45, 0.1, 'sine'); },
    bus: () => { blip(392, 392, 0.13, 0.035, 'square'); blip(330, 330, 0.18, 0.035, 'square', 0.16); },
  };

  root.textContent = '';
  if (ctx.reduceMotion) root.classList.add('tj-still');
  if (!ctx.reduceMotion) {
    for (const c of ['tj-l4', 'tj-l5', 'tj-l3', 'tj-l1', 'tj-l2']) { const d = document.createElement('div'); d.className = 'tj-l ' + c; root.appendChild(d); }
    const b = document.createElement('div'); b.className = 'tj-birds';
    [[3, 0], [9, -11], [15, -19]].forEach(([top, dl], k) => { b.insertAdjacentHTML('beforeend', BIRD); const s = b.lastChild; s.style.top = top + '%'; s.style.animationDelay = dl + 's'; s.style.animationDuration = 24 + k * 5 + 's'; s.style.width = 20 + k * 3 + 'px'; });
    root.appendChild(b);
  }
  const svg = el('svg', { viewBox: `0 0 ${V} ${V}`, class: 'tj-main' });
  root.appendChild(svg);
  const defs = el('defs', {}, svg);
  const stip = el('pattern', { id: 'tj-stip', width: 14, height: 14, patternUnits: 'userSpaceOnUse' }, defs);
  for (const [x, y] of [[2, 3], [9, 7], [5, 12], [12, 1]]) el('circle', { cx: x, cy: y, r: 0.9, fill: BROWN, 'fill-opacity': '.2' }, stip);
  const sheen = el('linearGradient', { id: 'tj-sheen', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  for (const [o, c, a] of [[0, '#fff', 0.42], [0.45, '#fff', 0], [1, '#4A2C2A', 0.28]]) el('stop', { offset: o, 'stop-color': c, 'stop-opacity': a }, sheen);
  const rg = (id, c, a) => { const g = el('radialGradient', { id }, defs); el('stop', { offset: 0, 'stop-color': c, 'stop-opacity': a }, g); el('stop', { offset: 1, 'stop-color': c, 'stop-opacity': 0 }, g); };
  rg('tj-halo', '#FFDD55', 1); rg('tj-pool', '#FFC95C', 0.55); rg('tj-lite', '#FFFBEA', 0.55);
  const lane = el('linearGradient', { id: 'tj-lane', x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
  for (const [o, a] of [[0, 0.08], [1, 0.5]]) el('stop', { offset: o, 'stop-color': '#FFD04A', 'stop-opacity': a }, lane);
  const fx = (id, kids) => { const f = el('filter', { id, x: '-30%', y: '-60%', width: '160%', height: '220%' }, defs); kids(f); };
  fx('tj-blur', (f) => el('feGaussianBlur', { stdDeviation: 2.8 }, f)); // soft cast shadow
  fx('tj-dk', (f) => el('feColorMatrix', { values: '.58 0 0 0 0  0 .52 0 0 0  0 0 .55 0 0  0 0 0 1 0' }, f)); // darker copy = car side wall
  const fc = el('clipPath', { id: 'tj-fc' }, defs); el('rect', { x: M, y: M, width: cell * n, height: cell * n, rx: 8 }, fc);
  const beam = el('linearGradient', { id: 'tj-beam', x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
  for (const [o, a] of [[0, 0.9], [1, 0]]) el('stop', { offset: o, 'stop-color': '#FFE9A0', 'stop-opacity': a }, beam);

  // sky bodies: sun by day, moon by night, in the top-right corner
  const sx = V - 24, sy = 24;
  const sun = el('g', { class: 'tj-sun tj-cel tj-dy' }, svg);
  const rays = el('g', { class: 'tj-rays' }, sun);
  for (let k = 0; k < 8; k++) el('path', { d: 'M-2.5 -13L0 -19L2.5 -13Z', transform: `translate(${sx} ${sy}) rotate(${k * 45})`, fill: '#FFC857', stroke: BROWN, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, rays);
  el('circle', { cx: sx, cy: sy, r: 9.5, fill: '#FFC857', stroke: BROWN, 'stroke-width': 2.4 }, sun);
  const moon = el('g', { class: 'tj-moon tj-cel tj-nt' }, svg);
  el('circle', { cx: sx, cy: sy, r: 17, fill: '#FFE9B0', 'fill-opacity': '.22' }, moon);
  el('circle', { cx: sx, cy: sy, r: 10.5, fill: '#FFE9B0', stroke: BROWN, 'stroke-width': 2.4 }, moon);
  for (const [dx, dy, r] of [[-3, -2, 2.4], [3, 3, 1.8], [2, -5, 1.3]]) el('circle', { cx: sx + dx, cy: sy + dy, r, fill: '#E7CE94' }, moon);

  // board: chunky wooden tray with a hard cartoon shadow, plank grain, nails and a stippled checkered floor
  const B = cell * n, redRow = level.cars[0][0];
  el('rect', { x: M - 4, y: M - 2, width: B + 16, height: B + 16, rx: 16, fill: BROWN, 'fill-opacity': '.28' }, svg);
  el('rect', { x: M - 8, y: M - 8, width: B + 16, height: B + 16, rx: 16, style: 'fill:var(--tj-wood)', stroke: BROWN, 'stroke-width': 3 }, svg);
  const wood = el('g', { stroke: BROWN, 'stroke-opacity': '.2', 'stroke-width': 1.6, fill: 'none', 'stroke-linecap': 'round' }, svg);
  for (let k = 0; k < 14; k++) { const gx = M - 5 + (k * 37 % 100) / 100 * (B + 6), gy2 = k % 2 ? M - 6 : M + B + 3; el('path', { d: `M${gx} ${gy2}q${3 + k % 4} 1.5 ${10 + k % 3 * 4} 0` }, wood); }
  for (const [nx, ny] of [[M - 4, M - 4], [M + B + 4, M - 4], [M - 4, M + B + 4], [M + B + 4, M + B + 4]]) { el('circle', { cx: nx, cy: ny, r: 2.3, fill: BROWN, 'fill-opacity': '.55' }, svg); el('circle', { cx: nx - 0.6, cy: ny - 0.6, r: 0.8, fill: '#fff', 'fill-opacity': '.7' }, svg); }
  el('rect', { x: M, y: M, width: B, height: B, rx: 8, style: 'fill:var(--tj-floor)' }, svg);
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if ((r + c) % 2) el('rect', { x: M + c * cell, y: M + r * cell, width: cell, height: cell, style: 'fill:var(--tj-alt)', 'fill-opacity': '.6' }, svg);
  el('rect', { x: M, y: M, width: B, height: B, rx: 8, fill: 'url(#tj-stip)' }, svg);
  const lit = el('g', { 'clip-path': 'url(#tj-fc)', 'pointer-events': 'none' }, svg); // sun wash by day, lamp pools by night, a warm lane to the exit
  el('ellipse', { cx: M + B, cy: M, rx: B * 0.9, ry: B * 0.8, fill: 'url(#tj-lite)', class: 'tj-dy' }, lit);
  for (const [px, py] of [[M, M], [M + B, M + B]]) el('circle', { cx: px, cy: py, r: B * 0.5, fill: 'url(#tj-pool)', class: 'tj-nt' }, lit);
  el('rect', { x: M, y: M + redRow * cell, width: B, height: cell, fill: 'url(#tj-lane)' }, lit);
  el('rect', { x: M, y: M, width: B, height: B, rx: 8, fill: 'none', stroke: BROWN, 'stroke-width': 3 }, svg);
  for (const [px, py] of [[M - 4, M - 4], [M + B + 4, M + B + 4]]) { el('circle', { cx: px, cy: py, r: 9, fill: '#FFC95C', 'fill-opacity': '.4', class: 'tj-nt' }, svg); el('circle', { cx: px, cy: py, r: 4.2, fill: '#FFE9A0', stroke: BROWN, 'stroke-width': 1.5, class: 'tj-nt' }, svg); }

  // exit: a road leaves the gap and runs off the screen; a boom gate swings open when the red car's lane is clear
  const gy = M + redRow * cell, gc = gy + cell / 2, rx0 = M + B;
  el('rect', { x: rx0 - 3, y: gy + 4, width: V - rx0 + 3, height: cell - 8, style: 'fill:var(--tj-road)' }, svg);
  el('path', { d: `M${rx0 - 3} ${gy + 4}H${V}M${rx0 - 3} ${gy + cell - 4}H${V}`, stroke: BROWN, 'stroke-width': 2, fill: 'none' }, svg);
  el('path', { d: `M${rx0 + 14} ${gc}H${V}`, stroke: '#FFF3E0', 'stroke-width': 2.4, 'stroke-dasharray': '9 8', fill: 'none', 'stroke-linecap': 'round' }, svg);
  el('path', { d: `M${V - 20} ${gc - 5}L${V - 13} ${gc}L${V - 20} ${gc + 5}Z`, fill: '#FFF3E0', class: 'tj-go' }, svg);
  [[rx0 + 16, -7], [rx0 + 31, 6], [rx0 + 12, 8]].forEach(([sx2, dy], k) => { const g2 = el('g', { transform: `translate(${sx2} ${gc + dy})` }, svg); el('path', { d: STAR4, fill: '#FFD04A', stroke: BROWN, 'stroke-width': 0.8, class: 'tj-sp', style: `animation-delay:${k * 0.7}s` }, g2); }); // a sparkle trail leading the hero to the exit
  const gate = el('g', { class: 'tj-gate' }, svg);
  const arm = el('g', { class: 'tj-arm', style: `transform-origin:${rx0 + 4}px ${gy + 6}px` }, gate);
  el('rect', { x: rx0 + 1, y: gy + 6, width: 6, height: cell - 12, rx: 3, fill: '#FFF3E0', stroke: BROWN, 'stroke-width': 1.8 }, arm);
  for (let k = 0; k < 3; k++) el('rect', { x: rx0 + 1.9, y: gy + 9 + k * ((cell - 18) / 3), width: 4.2, height: (cell - 18) / 6, fill: '#F4623A' }, arm);
  el('rect', { x: rx0 - 6, y: gy - 1, width: 20, height: 10, rx: 4, fill: '#F4623A', stroke: BROWN, 'stroke-width': 2.4 }, gate);
  el('rect', { x: rx0 - 6, y: gy + cell - 9, width: 20, height: 10, rx: 4, fill: '#F4623A', stroke: BROWN, 'stroke-width': 2.4 }, gate);
  el('circle', { cx: rx0 + 4, cy: gy + 4, r: 2.6, class: 'tj-lamp', stroke: BROWN, 'stroke-width': 1.2 }, gate);

  // a bird perched on the tray: hops now and then, flies off when the puzzle is solved
  const perch = el('g', { transform: `translate(${M + B * 0.2} ${M - 8})`, class: 'tj-dy' }, svg);
  const bird = el('g', { class: 'tj-hop' }, perch);
  el('path', { d: 'M-9 -4L-15 -9L-13 -2Z', fill: '#7FC8F8', stroke: BROWN, 'stroke-width': 1.4, 'stroke-linejoin': 'round' }, bird);
  el('ellipse', { cx: 0, cy: -6, rx: 9, ry: 6.5, fill: '#7FC8F8', stroke: BROWN, 'stroke-width': 1.8 }, bird);
  el('path', { d: 'M-3 -6q4 5 9 0', fill: '#fff', 'fill-opacity': '.55' }, bird);
  el('circle', { cx: 6, cy: -11, r: 4.8, fill: '#7FC8F8', stroke: BROWN, 'stroke-width': 1.8 }, bird);
  el('path', { d: 'M10 -12l5 1.6l-5 1.8Z', fill: '#FFC857', stroke: BROWN, 'stroke-width': 1.2, 'stroke-linejoin': 'round' }, bird);
  el('circle', { cx: 7, cy: -12.2, r: 1.2, fill: BROWN, class: 'tj-eye' }, bird);

  // cars: hero (red), small car, truck, bus
  let big = 0;
  const KIND = level.cars.map(([, , len], i) => (i === 0 ? 'hero' : len === 3 ? (big++ % 2 ? 'truck' : 'bus') : 'small'));
  const cars = level.cars.map(([r, c, len, hz], i) => {
    const g = el('g', { class: 'tj-car tj-anim tj-k-' + KIND[i] }, svg);
    const body = el('g', { class: 'tj-body' }, g);
    const L = len * cell - 2 * pad, T = cell * THICK, kind = KIND[i];
    const col = i ? C[1 + (i - 1) % (C.length - 1)] : C[0];
    const lf = el('g', { transform: hz ? `translate(${pad} ${pad})` : `matrix(0 1 1 0 ${pad} ${pad})` }, body); // local frame: x along the car, front at +x
    const S = (a, p) => el('rect', a, p || top);
    if (kind === 'hero') el('ellipse', { cx: L / 2, cy: T / 2, rx: L * 0.95, ry: T * 1.4, fill: 'url(#tj-halo)', class: 'tj-halo' }, lf); // soft glow: this is THE car
    el('polygon', { class: 'tj-beam', points: `${L - 2},${T * 0.12} ${L + 26},${-T * 0.12} ${L + 26},${T * 1.12} ${L - 2},${T * 0.88}`, fill: 'url(#tj-beam)' }, lf);
    el('rect', { x: hz ? -5 : 6, y: hz ? 6 : -5, width: L, height: T, rx: T * 0.4, fill: BROWN, 'fill-opacity': '.34', filter: 'url(#tj-blur)' }, lf); // cast shadow falls away from the sun (down-left on screen)
    const top = el('g', {}, lf);
    const wheels = kind === 'truck' ? [0.14, 0.33, 0.8] : kind === 'bus' ? [0.2, 0.8] : [0.22, 0.78];
    const ww = kind === 'bus' ? 14 : 12;
    for (const f of wheels) for (const side of [0, 1]) S({ x: L * f - ww / 2, y: side ? T - 3 : -3, width: ww, height: 6, rx: 3, fill: BROWN });
    const outline = { stroke: BROWN, 'stroke-width': 2.4 };
    let shape;
    if (kind === 'truck') {
      S({ x: 0, y: T * 0.05, width: L * 0.64, height: T * 0.9, rx: 6, fill: '#FFF3E0', ...outline });
      S({ x: 3, y: T * 0.4, width: L * 0.64 - 6, height: T * 0.2, fill: col, 'fill-opacity': '.9' });
      S({ x: L * 0.62, y: T * 0.34, width: L * 0.08, height: T * 0.32, fill: BROWN });
      shape = S({ x: L * 0.68, y: 0, width: L * 0.32, height: T, rx: T * 0.3, fill: col, ...outline });
      S({ x: L * 0.72, y: -5, width: 4, height: 7, rx: 1.5, fill: BROWN });
    } else if (kind === 'bus') {
      shape = S({ x: 0, y: 0, width: L, height: T, rx: T * 0.34, fill: col, ...outline });
      [0.07, 0.25, 0.43].forEach((f) => S({ x: L * f, y: T * 0.2, width: L * 0.14, height: T * 0.3, rx: 3, fill: '#DFF3FF', class: 'tj-win', stroke: BROWN, 'stroke-width': 1.4 }));
      S({ x: 4, y: T * 0.62, width: L - 8, height: T * 0.1, rx: 2, fill: '#FFF3E0', 'fill-opacity': '.85' });
    } else if (kind === 'hero') {
      S({ x: -3, y: T * 0.1, width: 7, height: T * 0.8, rx: 2.5, fill: '#B8381A', ...outline, 'stroke-width': 1.8 });
      shape = S({ x: 0, y: 0, width: L, height: T, rx: T * 0.45, fill: col, ...outline });
      S({ x: L * 0.12, y: T * 0.44, width: L * 0.5, height: 3.2, rx: 1.6, fill: '#fff', 'fill-opacity': '.8' });
      S({ x: L * 0.12, y: T * 0.58, width: L * 0.5, height: 3.2, rx: 1.6, fill: '#fff', 'fill-opacity': '.8' });
    } else { // small car: bubble body with a roof cabin
      shape = S({ x: 0, y: 0, width: L, height: T, rx: T * 0.46, fill: col, ...outline });
      S({ x: L * 0.18, y: T * 0.17, width: L * 0.62, height: T * 0.66, rx: T * 0.26, fill: '#fff', 'fill-opacity': '.3', class: 'tj-cab', stroke: BROWN, 'stroke-width': 1.4 });
    }
    S({ x: shape.getAttribute('x'), y: shape.getAttribute('y'), width: shape.getAttribute('width'), height: shape.getAttribute('height'), rx: shape.getAttribute('rx'), fill: 'url(#tj-sheen)' });
    S({ x: shape.getAttribute('x'), y: shape.getAttribute('y'), width: shape.getAttribute('width'), height: shape.getAttribute('height'), rx: shape.getAttribute('rx'), fill: 'url(#tj-stip)' });
    for (const yy of [T * 0.16, T * 0.84]) el('circle', { cx: L - 3.5, cy: yy, r: 2.8, fill: '#FFE9A0', stroke: BROWN, 'stroke-width': 1.1 }, lf);
    for (const yy of [T * 0.2, T * 0.8]) S({ x: 1.5, y: yy - 2, width: 3, height: 4, rx: 1, fill: '#C23B22' });
    { const sx = +shape.getAttribute('x'), sw = +shape.getAttribute('width'); S({ x: sx + sw * 0.14, y: T * 0.07, width: sw * 0.5, height: 3.4, rx: 1.7, fill: '#fff', 'fill-opacity': '.5' }); } // glossy highlight along the roof edge
    const ex = top.cloneNode(true); // a darker copy pushed 4 px down: the car's side wall, so it reads as a solid object
    ex.setAttribute('transform', hz ? 'translate(0 4.5)' : 'translate(4.5 0)'); ex.setAttribute('filter', 'url(#tj-dk)'); lf.insertBefore(ex, top);

    { // face on the windshield, always upright on screen; eyes look toward the front (right or down)
      const big = kind === 'hero', er = big ? 4.6 : 3.6;
      const fc = kind === 'truck' ? L * 0.84 : kind === 'bus' ? L - 22 : L * 0.8 - 16;
      const cx = hz ? pad + fc : pad + T / 2, cy = hz ? pad + T / 2 : pad + fc;
      el('rect', { x: cx - 14, y: cy - 12, width: 28, height: 25, rx: 8, fill: '#DFF3FF', class: 'tj-win', stroke: BROWN, 'stroke-width': 1.6 }, body);
      const look = hz ? [1, 0.3] : [0.3, 1];
      for (const dx of [-5, 5]) {
        const eye = el('g', { class: 'tj-eye' }, body);
        el('circle', { cx: cx + dx, cy: cy - 3.5, r: er, fill: '#fff', stroke: BROWN, 'stroke-width': 1.2 }, eye);
        el('circle', { cx: cx + dx + look[0], cy: cy - 3.5 + look[1], r: er * 0.48, fill: BROWN }, eye);
      }
      const my = cy + 6.5;
      const mouth = { truck: `M${cx - 4} ${my}h8`, bus: `M${cx - 5} ${my - 1}q5 6 10 0z`, hero: `M${cx - 4} ${my - 1}q4 4 8 0`, small: `M${cx - 3.5} ${my - 1}q3.5 3 7 0` }[kind];
      el('path', { d: mouth, fill: kind === 'bus' ? '#fff' : 'none', stroke: BROWN, 'stroke-width': 1.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, body);
      const by = cy - er - 4.5, dir = { hero: -2, truck: 2 }[kind];
      if (dir) el('path', { d: `M${cx - 9} ${by}l5 ${dir}M${cx + 9} ${by}l-5 ${dir}`, stroke: BROWN, 'stroke-width': 1.8, 'stroke-linecap': 'round', fill: 'none' }, body);
    }
    el('rect', { x: 0, y: 0, width: hz ? len * cell : cell, height: hz ? cell : len * cell, fill: 'transparent' }, g);
    g.addEventListener('pointerdown', (e) => down(e, i, g));
    return { g, body, hz };
  });

  const pos = (i, extra = 0) => {
    const [r, c, , hz] = h.present.cars[i];
    return `translate(${M + c * cell + (hz ? extra : 0)}px, ${M + r * cell + (hz ? 0 : extra)}px)`;
  };
  const laneClear = () => { // true when no car stands between the red car and the exit
    const [r, c, len] = h.present.cars[0];
    return h.present.cars.every(([rr, cc, l, hz], i) => !i || (hz ? rr !== r || cc < c + len : cc < c + len || r < rr || r >= rr + l));
  };
  const place = () => {
    cars.forEach((c, i) => { c.g.style.transform = pos(i); });
    const open = laneClear();
    gate.classList.toggle('tj-open', open);
    if (wasOpen === false && open) blip(1319, 1319, 0.35, 0.04, 'sine', 0.3);
    wasOpen = open;
  };
  const hud = () => ctx.hud({ moves: h.present.moves, best, tries: h.tries, maxTries: logic.maxTries(), canUndo: h.past.length > 0 });

  // Weight classes: small cars are quick and bouncy, the bus is slower, the truck lands late, squashes deep and thuds the whole board.
  const FEEL = { hero: { at: 190, sq: [1.1, 0.9], puffs: 3, thud: 0 }, small: { at: 150, sq: [1.12, 0.88], puffs: 2, thud: 0, hop: -4 }, bus: { at: 290, sq: [1.05, 0.88], puffs: 4, thud: 1.2 }, truck: { at: 340, sq: [1.04, 0.82], puffs: 5, thud: 2.4 } };
  const puff = (i, d) => { // dust puffs behind a car that just moved; the hero leaves gold sparkles too
    if (ctx.reduceMotion) return;
    const [r, c, len, hz] = h.present.cars[i], sgn = d > 0 ? -1 : 1, f = FEEL[KIND[i]], heavy = f.thud > 0 ? 1 + f.thud / 3 : 1;
    const bx = hz ? M + (c + (d > 0 ? 0 : len)) * cell : M + (c + 0.5) * cell, by = hz ? M + (r + 0.5) * cell : M + (r + (d > 0 ? 0 : len)) * cell;
    for (let k = 0; k < f.puffs; k++) {
      const o = (k - (f.puffs - 1) / 2) * 9;
      const p = el('circle', { cx: bx + (hz ? 0 : o), cy: by + (hz ? o : 0), r: (3.5 + (k % 3)) * heavy, fill: '#FFF3E0', stroke: BROWN, 'stroke-width': 1.4, 'stroke-opacity': '.5' }, svg);
      const a = p.animate([{ transform: 'none', opacity: 0.9 }, { transform: `translate(${hz ? sgn * 14 : 0}px, ${hz ? 0 : sgn * 14}px) scale(${1.6 + heavy / 2})`, opacity: 0 }], { duration: 520 * heavy, delay: f.at - 70 + k * 40, easing: 'ease-out', fill: 'both' });
      a.onfinish = () => p.remove();
    }
    if (i) return;
    for (let k = 0; k < 4; k++) {
      const p = el('path', { d: STAR4, fill: '#FFD04A', stroke: BROWN, 'stroke-width': 0.8 }, svg);
      const sx = hz ? sgn * (10 + k * 9) : (k % 2 ? 8 : -8), sy = hz ? (k % 2 ? 9 : -9) : sgn * (10 + k * 9);
      const a = p.animate([{ transform: `translate(${bx}px, ${by}px) scale(0)`, opacity: 1 }, { transform: `translate(${bx + sx * 0.5}px, ${by + sy * 0.5}px) scale(1.3) rotate(45deg)`, opacity: 1, offset: 0.4 }, { transform: `translate(${bx + sx}px, ${by + sy}px) scale(0) rotate(90deg)`, opacity: 0 }], { duration: 700, delay: f.at - 120 + k * 60, easing: 'ease-out', fill: 'both' });
      a.onfinish = () => p.remove();
    }
  };
  const squash = (i) => {
    if (ctx.reduceMotion) return;
    const f = FEEL[KIND[i]], hz = cars[i].hz, sc = (x, y) => (hz ? `scale(${x},${y})` : `scale(${y},${x})`), [x, y] = f.sq;
    const hop = f.hop ? `translateY(${f.hop}px) ` : '';
    cars[i].body.animate([{ transform: 'none' }, { transform: sc(x, y), offset: 0.3 }, { transform: hop + sc(1 - (x - 1) * 0.5, 1 + (1 - y) * 0.5), offset: 0.6 }, { transform: 'none' }], { duration: 300 + f.at, delay: f.at, easing: 'ease-out' });
    if (f.thud) svg.animate([{ transform: 'none' }, { transform: `translateY(${f.thud}px)`, offset: 0.25 }, { transform: 'none' }], { duration: 320, delay: f.at, easing: 'ease-out' });
  };

  // free span in cells for car i: [lo, hi]
  const span = (i) => {
    let lo = 0, hi = 0;
    for (const m of logic.legalMoves(h.present)) if (m.car === i) { lo = Math.min(lo, m.d); hi = Math.max(hi, m.d); }
    return [lo, hi];
  };
  const axisPos = (e) => {
    const rect = svg.getBoundingClientRect(), s = V / rect.width;
    return cars[dragging.i].hz ? (e.clientX - rect.left) * s : (e.clientY - rect.top) * s;
  };

  function down(e, i, g) {
    if (won || dragging || (e.pointerType === 'mouse' && e.button !== 0)) return;
    unlock();
    const [lo, hi] = span(i);
    dragging = { i, g, id: e.pointerId, lo: lo * cell, hi: hi * cell, off: 0 };
    dragging.start = axisPos(e);
    g.classList.remove('tj-anim');
    g.classList.add('tj-drag');
    try { g.setPointerCapture(e.pointerId); } catch (_) {}
    g.addEventListener('pointermove', move);
    g.addEventListener('pointerup', up);
    g.addEventListener('pointercancel', up);
    e.preventDefault();
  }
  function move(e) {
    if (!dragging || e.pointerId !== dragging.id) return;
    dragging.off = Math.max(dragging.lo, Math.min(dragging.hi, axisPos(e) - dragging.start));
    const t = Math.round(dragging.off / cell); // a wooden tick each time the car crosses a cell
    if (t !== dragging.tick) { if (dragging.tick !== undefined) ctx.sound.move(dragging.i + Math.abs(t)); dragging.tick = t; }
    dragging.g.style.transform = pos(dragging.i, dragging.off);
  }
  function up(e) {
    if (!dragging || e.pointerId !== dragging.id) return;
    const { i, g, off } = dragging;
    dragging = null;
    g.removeEventListener('pointermove', move);
    g.removeEventListener('pointerup', up);
    g.removeEventListener('pointercancel', up);
    g.classList.remove('tj-drag');
    if (!ctx.reduceMotion) g.classList.add('tj-anim');
    const d = Math.round(off / cell);
    const m = d ? logic.applyMove(h.present, { car: i, d }) : null;
    if (m) {
      h = play(h, logic, { car: i, d });
      squash(i);
      puff(i, d);
      VOICE[KIND[i]]();
      hud();
      place();
      if (logic.isSolved(h.present)) win();
    } else place();
  }

  function win() {
    won = true;
    const g = cars[0].g;
    later(() => {
      if (ctx.reduceMotion) return;
      ctx.sound.win();
      g.style.transition = 'transform .65s cubic-bezier(.55,.05,.9,.5)';
      g.style.transform = pos(0, V - (M + B) + h.present.cars[0][2] * cell + 10);
      cars.forEach((c, i) => i && c.body.animate([{ transform: 'none' }, { transform: 'translateY(-9px) scale(.95,1.08)', offset: 0.4 }, { transform: 'none' }], { duration: 420, delay: 80 + i * 45, easing: 'cubic-bezier(.34,1.56,.64,1)' }));
      pops.push(bird.animate([{ transform: 'none', opacity: 1 }, { transform: 'translate(40px,-60px) scale(.8)', opacity: 0 }], { duration: 1400, easing: 'ease-in', fill: 'forwards' }));
      for (let k = 0; k < 16; k++) { // confetti bursts from the road
        const p = el(k % 3 ? 'circle' : 'rect', k % 3 ? { cx: 0, cy: 0, r: 5 } : { x: -4.5, y: -4.5, width: 9, height: 9, rx: 2.5 }, svg);
        p.setAttribute('fill', C[k % C.length]); p.setAttribute('stroke', BROWN); p.setAttribute('stroke-width', 1.2);
        const ang = Math.PI * (0.55 + 0.9 * (k / 15)), v = 70 + (k * 37 % 60);
        const a = p.animate([{ transform: `translate(${V - 20}px, ${gc}px)`, opacity: 1 }, { transform: `translate(${V - 20 + Math.cos(ang) * v}px, ${gc + Math.sin(ang) * v * 0.6 - 30}px) rotate(120deg)`, opacity: 1, offset: 0.45 }, { transform: `translate(${V - 20 + Math.cos(ang) * v * 1.3}px, ${gc + 90}px) rotate(300deg)`, opacity: 0 }], { duration: 900 + (k % 4) * 80, easing: 'cubic-bezier(.215,.61,.355,1)', fill: 'both' });
        a.onfinish = () => p.remove();
      }
      svg.querySelectorAll('.tj-cel').forEach((c) => pops.push(c.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.7)' }, { transform: 'scale(1.2)' }], { duration: 700, easing: 'cubic-bezier(.34,1.56,.64,1)', fill: 'forwards' })));
    }, 330);
    later(() => ctx.solved({ score: logic.score(h.present) }), 700);
  }

  const settle = () => {
    for (const t of timers) clearTimeout(t);
    timers.clear();
    won = false;
    pops.splice(0).forEach((a) => a.cancel());
    cars[0].g.style.transition = '';
    place();
    hud();
  };

  place();
  hud();
  if (ctx.reduceMotion) cars.forEach((c) => c.g.classList.remove('tj-anim'));

  return {
    undo() { if (dragging) return; h = undo(h, logic.maxTries()); settle(); },
    reset() { if (dragging) return; h = reset(h, logic.maxTries()); settle(); },
    destroy() {
      for (const t of timers) clearTimeout(t);
      timers.clear();
      dragging = null;
      if (ac) { try { ac.close(); } catch (_) {} ac = null; }
      root.classList.remove('tj-still');
      root.textContent = '';
      root.classList.remove('g-traffic-jam');
    },
  };
}
