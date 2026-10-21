import * as logic from '../logic/mirror-laser.js';
import { newHistory, play, undo, reset } from '../logic/history.js';

const URI = (s) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
const STARS = URI('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><g fill="#fff"><circle cx="30" cy="40" r="1.4" fill-opacity=".7"/><circle cx="110" cy="20" r="1" fill-opacity=".5"/><circle cx="210" cy="70" r="1.8" fill-opacity=".8"/><circle cx="270" cy="150" r="1.1" fill-opacity=".5"/><circle cx="60" cy="140" r="1.2" fill-opacity=".6"/><circle cx="160" cy="190" r="1.6" fill-opacity=".7"/><circle cx="240" cy="260" r="1" fill-opacity=".5"/><circle cx="90" cy="250" r="1.7" fill-opacity=".8"/><circle cx="20" cy="220" r="1" fill-opacity=".5"/></g></svg>');
const HAZE = URI('<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480"><defs><radialGradient id="a"><stop offset="0" stop-color="#3FB8AF" stop-opacity=".26"/><stop offset="1" stop-color="#3FB8AF" stop-opacity="0"/></radialGradient><radialGradient id="b"><stop offset="0" stop-color="#E8A0BF" stop-opacity=".24"/><stop offset="1" stop-color="#E8A0BF" stop-opacity="0"/></radialGradient></defs><circle cx="130" cy="130" r="115" fill="url(#a)"/><circle cx="340" cy="330" r="130" fill="url(#b)"/></svg>');

const MOON = URI('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><defs><radialGradient id="h"><stop offset="0" stop-color="#FFD8C0" stop-opacity=".42"/><stop offset=".5" stop-color="#E8A0BF" stop-opacity=".14"/><stop offset="1" stop-color="#E8A0BF" stop-opacity="0"/></radialGradient></defs><circle cx="120" cy="120" r="118" fill="url(#h)"/><circle cx="120" cy="120" r="30" fill="#FFF1D6" fill-opacity=".92"/><circle cx="120" cy="120" r="44" fill="none" stroke="#FFF1D6" stroke-opacity=".3"/></svg>');
const MOTES = URI('<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360">' + [[40,60,2],[130,210,1.6],[220,40,2.2],[300,150,1.5],[90,320,1.8],[250,290,2],[330,330,1.4],[180,120,1.3]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r * 3}" fill="#FFE9A8" fill-opacity=".1"/><circle cx="${x}" cy="${y}" r="${r}" fill="#FFF3C8" fill-opacity=".6"/>`).join('') + '</svg>');
const cubeS = (x, y, s) => `<g fill="#fff"><polygon points="${x - s},${y} ${x},${y + s / 2} ${x},${y + s * 1.5} ${x - s},${y + s}" fill-opacity=".05"/><polygon points="${x},${y + s / 2} ${x + s},${y} ${x + s},${y + s} ${x},${y + s * 1.5}" fill-opacity=".09"/><polygon points="${x},${y - s / 2} ${x + s},${y} ${x},${y + s / 2} ${x - s},${y}" fill-opacity=".14"/></g>`;
const SILH = URI('<svg xmlns="http://www.w3.org/2000/svg" width="520" height="520">' + cubeS(90, 90, 34) + cubeS(380, 200, 54) + cubeS(210, 400, 26) + cubeS(470, 440, 18) + '</svg>');

export const css = `
.g-mirror-laser { position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
  min-height: 500px; padding: 8px 0 16px; touch-action: none; user-select: none; -webkit-user-select: none;
  background: radial-gradient(120% 60% at 50% 0%, #4A4E98 0%, rgba(74,78,152,0) 65%), linear-gradient(180deg, #34376D 0%, #2B2D5B 55%, #1F2147 100%); }
.g-mirror-laser .ml-l { position: absolute; inset: 0; pointer-events: none; background-repeat: repeat; }
.g-mirror-laser .ml-l1 { background-image: ${STARS}; background-size: 300px 300px; animation: ml-d1 170s linear infinite; }
.g-mirror-laser .ml-l0 { background: ${MOON} 100% -50px / 210px 210px no-repeat; }
.g-mirror-laser.ml-m .ml-l0 { animation: ml-moon 16s ease-in-out infinite alternate; }
@keyframes ml-moon { to { transform: translateY(12px); } }
.g-mirror-laser .ml-l4 { background-image: ${SILH}; background-size: 520px 520px; animation: ml-d4 420s linear infinite; }
.g-mirror-laser .ml-l3 { background-image: ${MOTES}; background-size: 360px 360px; animation: ml-d3 70s linear infinite; }
@keyframes ml-d4 { to { background-position: -520px 260px; } }
@keyframes ml-d3 { to { background-position: 140px -360px; } }
.g-mirror-laser .ml-flood { position: absolute; inset: 0; pointer-events: none; opacity: 0; background: radial-gradient(70% 55% at 50% 45%, rgba(255,226,122,.8), rgba(255,184,160,.34) 55%, rgba(255,184,160,0) 80%); }
.g-mirror-laser .ml-sh { animation: ml-sh 7s ease-in-out infinite; }
@keyframes ml-sh { 0%, 70%, 100% { opacity: 0; } 82% { opacity: 1; } }
.g-mirror-laser .ml-l2 { background-image: ${HAZE}; background-size: 480px 480px; animation: ml-d2 260s linear infinite reverse; }
@keyframes ml-d1 { to { background-position: 300px 0; } }
@keyframes ml-d2 { to { background-position: 480px 0; } }
.g-mirror-laser svg.ml-s { position: relative; width: 100%; height: auto; display: block; overflow: visible; }
.g-mirror-laser .ml-tilt { position: relative; width: 100%; max-width: 560px; transform-origin: 50% 60%; transition: transform .12s linear; }
.g-mirror-laser.ml-rel .ml-tilt { transition: transform .7s cubic-bezier(.34,1.56,.64,1); }
.g-mirror-laser .ml-l1, .g-mirror-laser .ml-l2, .g-mirror-laser .ml-l3, .g-mirror-laser .ml-l4 { inset: -18px; transition: translate .12s linear; }
.g-mirror-laser.ml-rel .ml-l { transition: translate .7s cubic-bezier(.34,1.56,.64,1); }
.g-mirror-laser .ml-l1 { translate: calc(var(--ry, 0) * -.5px) calc(var(--rx, 0) * .5px); }
.g-mirror-laser .ml-l2 { translate: calc(var(--ry, 0) * -1.2px) calc(var(--rx, 0) * 1px); }
.g-mirror-laser .ml-l4 { translate: calc(var(--ry, 0) * -2px) calc(var(--rx, 0) * 1.4px); }
.g-mirror-laser .ml-l3 { translate: calc(var(--ry, 0) * 2.6px) calc(var(--rx, 0) * -1.6px); }
.g-mirror-laser .ml-sel { fill: rgba(255,255,255,.16); stroke: #fff; stroke-width: 2.2; stroke-linejoin: round; opacity: 0; transition: opacity .3s cubic-bezier(.215,.61,.355,1); }
.g-mirror-laser .ml-sel.on { opacity: 1; }
.g-mirror-laser.ml-m .ml-sel.on { animation: ml-selp 1.6s ease-in-out infinite; }
@keyframes ml-selp { 50% { fill: rgba(255,255,255,.3); } }
.g-mirror-laser .ml-row { display: flex; align-items: center; gap: 16px; }
.g-mirror-laser .ml-pick { display: flex; gap: 10px; }
.g-mirror-laser .ml-pk { width: 52px; height: 52px; padding: 0; border: 0; border-radius: 16px; cursor: pointer; touch-action: manipulation; background: rgba(255,255,255,.14); box-shadow: inset 0 0 0 1.5px rgba(255,255,255,.35);
  transition: transform .3s cubic-bezier(.215,.61,.355,1), opacity .4s cubic-bezier(.215,.61,.355,1), background .3s; }
.g-mirror-laser .ml-pk:active { transform: scale(.92); }
.g-mirror-laser .ml-pk:disabled { opacity: .3; cursor: default; }
.g-mirror-laser .ml-pk.cur { background: rgba(168,230,207,.38); box-shadow: inset 0 0 0 2px #A8E6CF; }
.g-mirror-laser .ml-pk svg { width: 36px; height: 36px; display: block; margin: auto; }
.g-mirror-laser .ml-c { cursor: pointer; }
.g-mirror-laser .ml-t { transition: fill .3s cubic-bezier(.215,.61,.355,1); }
.g-mirror-laser .ml-hot { fill: #9DA1E8; }
.g-mirror-laser .ml-bl { transition: opacity .4s cubic-bezier(.215,.61,.355,1); pointer-events: none; }
.g-mirror-laser .ml-bm path { fill: none; stroke-linecap: round; stroke-linejoin: round; }
.g-mirror-laser.ml-m .ml-bm path { stroke-dasharray: 1 2; stroke-dashoffset: 1; animation: ml-draw var(--d) linear var(--t) forwards; }
@keyframes ml-draw { to { stroke-dashoffset: 0; } }
.g-mirror-laser.ml-m svg.ml-s { animation: ml-bob 7s ease-in-out infinite; }
.g-mirror-laser.ml-m .ml-float { animation: ml-bob2 3.4s ease-in-out infinite; }
@keyframes ml-bob { 50% { transform: translateY(-4px); } }
@keyframes ml-bob2 { 50% { transform: translateY(-3px); } }
.g-mirror-laser .ml-ring, .g-mirror-laser .ml-gl, .g-mirror-laser .ml-gr { transition: fill .3s cubic-bezier(.215,.61,.355,1); }
.g-mirror-laser .ml-pil { opacity: .32; transition: opacity .4s cubic-bezier(.215,.61,.355,1); }
.g-mirror-laser.ml-m .ml-pil { animation: ml-pp 3.6s ease-in-out infinite; }
@keyframes ml-pp { 50% { opacity: .12; } }
.g-mirror-laser .ml-lit .ml-pil { opacity: 1; animation: none; }
.g-mirror-laser .ml-lit .ml-ring { fill: #FFE27A; }
.g-mirror-laser .ml-lit .ml-gl { fill: #FFF0A8; }
.g-mirror-laser .ml-lit .ml-gr { fill: #FFE27A; }
.g-mirror-laser .ml-fl { opacity: 0; transition: opacity .3s cubic-bezier(.215,.61,.355,1); }
.g-mirror-laser .ml-fl.on { opacity: .6; }
.g-mirror-laser .ml-mkf { fill: #A8E6CF; transition: fill .3s; }
.g-mirror-laser .ml-lit .ml-mkf { fill: #FFE27A; }
.g-mirror-laser .ml-spark { opacity: 0; transition: opacity .3s; }
.g-mirror-laser .ml-lit .ml-spark { opacity: 1; }
.g-mirror-laser .ml-inv { position: relative; display: flex; gap: 8px; min-height: 30px; }
.g-mirror-laser .ml-inv svg { width: 30px; height: 30px; }
.g-mirror-laser .ml-inv .ml-f, .g-mirror-laser .ml-inv .ml-e { transition: opacity .3s cubic-bezier(.215,.61,.355,1); }
.g-mirror-laser .ml-inv .ml-e { opacity: 0; }
.g-mirror-laser .ml-inv .ml-used .ml-f { opacity: 0; }
.g-mirror-laser .ml-inv .ml-used .ml-e { opacity: 1; }
.g-mirror-laser .ml-fire { position: relative; width: 76px; height: 76px; padding: 0; border: 0; border-radius: 50%; cursor: pointer; touch-action: manipulation;
  background: radial-gradient(circle at 35% 30%, #FFF3B8 0%, #FFE27A 45%, #FFB8A0 100%); box-shadow: 0 0 0 4px rgba(255,226,122,.25), 0 8px 22px rgba(255,184,160,.35);
  transition: transform .3s cubic-bezier(.215,.61,.355,1), opacity .4s cubic-bezier(.215,.61,.355,1), box-shadow .3s; }
.g-mirror-laser .ml-fire:active { transform: scale(.92); }
.g-mirror-laser .ml-fire:disabled { opacity: .3; cursor: default; box-shadow: none; }
.g-mirror-laser .ml-fire svg { width: 44px; height: 44px; }
`;

const NS = 'http://www.w3.org/2000/svg';
const A = 34, OY = 62, SLAB = 18, HB = 11;
const DIRS = [[-1, 0], [0, 1], [1, 0], [0, -1]];
const GLASS = ['rgba(168,230,207,.72)', 'rgba(168,230,207,.4)', 'rgba(63,184,175,.45)'];
const EASE = 'cubic-bezier(.215,.61,.355,1)';

// the game's own vibraphone / music-box voice (ctx.sound is a plain sine); the context is made on the first tap
const SC = [0, 4, 7, 11, 14];
let ac, bus, amb;
// ambient bed: quiet wind (band-passed noise, slow sweep) over an open-fifth pad; it swells while the beam runs
function ambient() {
  amb = ac.createGain();
  amb.gain.value = 0.0001;
  amb.gain.setTargetAtTime(0.06, ac.currentTime, 1.5);
  amb.connect(ac.destination);
  const buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource(), bp = ac.createBiquadFilter(), sw = ac.createOscillator(), swd = ac.createGain(), wg = ac.createGain();
  src.buffer = buf; src.loop = true; bp.type = 'bandpass'; bp.frequency.value = 520; bp.Q.value = 0.7; wg.gain.value = 0.5;
  sw.frequency.value = 0.07; swd.gain.value = 260; sw.connect(swd).connect(bp.frequency);
  src.connect(bp).connect(wg).connect(amb); src.start(); sw.start();
  const pg = ac.createGain(), tr = ac.createOscillator(), trd = ac.createGain();
  pg.gain.value = 0.3; tr.frequency.value = 0.09; trd.gain.value = 0.12; tr.connect(trd).connect(pg.gain); tr.start(); pg.connect(amb);
  [[82.4, 3], [123.5, -3], [164.8, 3], [207.7, -3]].forEach(([f, c]) => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = f; o.detune.value = c; g.gain.value = 0.1; o.connect(g).connect(pg); o.start(); });
}
const swell = (up) => { if (ac && amb) amb.gain.setTargetAtTime(up ? 0.11 : 0.06, ac.currentTime, 0.5); };
const audio = () => {
  if (ac !== undefined) return ac;
  try {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    bus = ac.createGain();
    const dl = ac.createDelay(1), fb = ac.createGain(), lp = ac.createBiquadFilter();
    dl.delayTime.value = 0.27; fb.gain.value = 0.3; lp.type = 'lowpass'; lp.frequency.value = 2400;
    bus.connect(ac.destination); bus.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(ac.destination);
    ambient();
  } catch { ac = null; }
  if (ac && ac.state === 'suspended') ac.resume();
  return ac;
};
function bell(i, delay = 0, len = 1.5, vol = 0.14) {
  const f = 330 * 2 ** ((SC[((i % 5) + 5) % 5] + 12 * (Math.floor(i / 5) & 1)) / 12), t = ac.currentTime + delay;
  const trem = ac.createGain(), lfo = ac.createOscillator(), depth = ac.createGain();
  trem.gain.value = 0.8; lfo.frequency.value = 5.2; depth.gain.value = 0.2;
  lfo.connect(depth).connect(trem.gain); trem.connect(bus); lfo.start(t); lfo.stop(t + len + 0.1);
  [[1, 1, len], [4, 0.3, len * 0.35], [10, 0.09, 0.05]].forEach(([k, a, d]) => { // fundamental, bar overtone, mallet tick
    const o = ac.createOscillator(), g = ac.createGain();
    o.frequency.value = f * k; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol * a, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g).connect(trem); o.start(t); o.stop(t + d + 0.05);
  });
}

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');

export function mount(root, ctx) {
  root.classList.add('g-mirror-laser');
  root.textContent = '';
  const rm = ctx.reduceMotion;
  if (!rm) root.classList.add('ml-m');
  const level = logic.makeLevel(ctx.level), best = logic.bestScore(level), n = level.size;
  const B = Math.min(34, Math.max(22, Math.ceil(22 * (2 * n * A + 8) / Math.min(root.clientWidth || 358, 560)))); // bigger grids get a steeper view so a tile stays about 44 px tall
  let h = newHistory(logic.initialState(level));
  let busy = false, won = false;
  const timers = new Set(), offs = [];
  const snd = (i, vol) => { if (audio()) bell(i, 0, 1.5, vol); else ctx.sound.move(i); };
  // the shell calls ctx.sound.win itself when the win card opens; silence that for this game so its own chord is the only one (restored in destroy)
  const shellWin = ctx.sound.win;
  ctx.sound.win = () => {};
  const chord = () => { if (audio()) [5, 7, 9, 12].forEach((k, j) => bell(k, j * 0.11, 2.4, 0.1)); else shellWin(); };
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
  const on = (node, type, fn) => { node.addEventListener(type, fn); offs.push(() => node.removeEventListener(type, fn)); };
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    parent && parent.appendChild(e);
    return e;
  };
  const poly = (parent, pts, attrs) => el('polygon', { points: pts.map((p) => p.join(',')).join(' '), ...attrs }, parent);
  // the drawing keeps its tile size; a bigger grid just widens the viewBox, so the whole board scales down to fit
  const VW = 2 * n * A + 8, VH = Math.max(310, OY + 2 * n * B + SLAB + 20), OX = VW / 2;
  const P = (r, c) => [OX + (c - r) * A, OY + (c + r) * B];
  const G = (X, Y, dr, dc, z = 0) => [X + (dc - dr) * A, Y + (dc + dr) * B - z]; // grid offset to screen
  const has = (list, r, c) => list.some((p) => p[0] === r && p[1] === c);

  for (const c of rm ? ['ml-l0'] : ['ml-l0', 'ml-l4', 'ml-l2', 'ml-l1', 'ml-l3']) { const d = document.createElement('div'); d.className = 'ml-l ' + c; root.appendChild(d); }
  const flood = document.createElement('div');
  flood.className = 'ml-flood';
  const svg = el('svg', { class: 'ml-s', viewBox: `0 0 ${VW} ${VH}` });
  const tiltEl = document.createElement('div');
  tiltEl.className = 'ml-tilt';
  tiltEl.append(svg);
  root.append(tiltEl, flood);
  const defs = el('defs', {}, svg);
  const pane = el('linearGradient', { id: 'ml-pane', x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
  el('stop', { offset: 0, 'stop-color': '#FFFFFF', 'stop-opacity': '.95' }, pane);
  el('stop', { offset: 1, 'stop-color': '#E8A0BF', 'stop-opacity': '.85' }, pane);
  const pil = el('linearGradient', { id: 'ml-pil', x1: 0, y1: 1, x2: 0, y2: 0 }, defs);
  el('stop', { offset: 0, 'stop-color': '#FFE27A', 'stop-opacity': '.75' }, pil);
  el('stop', { offset: 1, 'stop-color': '#FFE27A', 'stop-opacity': '0' }, pil);
  const grad = (id, stops, x2 = 0, y2 = 1) => { const g = el('linearGradient', { id, x1: 0, y1: 0, x2, y2 }, defs); stops.forEach((c, i) => el('stop', { offset: i / (stops.length - 1), 'stop-color': c }, g)); return 'url(#' + id + ')'; };
  const WALLG = [grad('ml-wt', ['#FFE6D9', '#FFC9B4'], 1, 1), grad('ml-wl', ['#F8B39D', '#E58570']), grad('ml-wr', ['#D87A8E', '#AC5070'])];
  const LASERG = [grad('ml-lt', ['#B9F3EA', '#7FD9CE'], 1, 1), grad('ml-ll', ['#53C8BE', '#2F9A98']), grad('ml-lr', ['#2F9A98', '#1F6F78'])];
  const SLAB_L = grad('ml-sl', ['#5A5EAA', '#2F3166']), SLAB_R = grad('ml-sr', ['#43478A', '#23254F']);
  const pool = el('radialGradient', { id: 'ml-poolg' }, defs);
  el('stop', { offset: 0, 'stop-color': '#FFE27A', 'stop-opacity': '.55' }, pool);
  el('stop', { offset: 1, 'stop-color': '#FFE27A', 'stop-opacity': '0' }, pool);
  const flg = el('radialGradient', { id: 'ml-flg' }, defs);
  el('stop', { offset: 0, 'stop-color': '#FFF6C8' }, flg);
  el('stop', { offset: 1, 'stop-color': '#FFD45A', 'stop-opacity': 0 }, flg);

  el('ellipse', { cx: OX, cy: OY + 2 * (n - 1) * B + 40, rx: 24 * n, ry: 12, fill: '#12132E', 'fill-opacity': '.45' }, svg);
  const room = el('g', { class: 'ml-room' }, svg);
  const floorL = el('g', {}, room), shadowL = el('g', { 'pointer-events': 'none', filter: 'url(#ml-soft)' }, room), poolL = el('g', { class: 'ml-bl' }, room);
  const glow = el('g', { class: 'ml-bl', 'pointer-events': 'none' }, room); // bloom sits under the blocks, so walls stay solid in front of it
  const faces = new Map(); // wall faces the beam can light: key -> [left face, right face]
  const ghost = (r, c) => [level.target, ...level.checks].some(([a, b]) => r >= a && c >= b && r + c - a - b > 0 && r + c - a - b <= 2); // wall in front of a goal
  const fx = el('g', { 'pointer-events': 'none' }, svg);

  // glass-free flat-shaded cube: top lit, left medium, right dark (light from upper left)
  const cube = (parent, X, Y, s, hh, cols, extra = {}) => {
    const a = A * s, b = B * s;
    poly(parent, [[X - a, Y - hh], [X, Y + b - hh], [X, Y + b], [X - a, Y]], { fill: cols[1], ...extra });
    poly(parent, [[X, Y + b - hh], [X + a, Y - hh], [X + a, Y], [X, Y + b]], { fill: cols[2], ...extra });
    poly(parent, [[X, Y - b - hh], [X + a, Y - hh], [X, Y + b - hh], [X - a, Y - hh]], { fill: cols[0], ...extra });
  };

  // soft cast shadow: light comes from the upper left, so the footprint is dragged toward the lower right
  const shadow = (parent, X, Y, s, hh, op) => {
    const a = A * s, b = B * s, sx = hh * 0.85, sy = hh * 0.32;
    return poly(parent, [[X - a, Y], [X, Y - b], [X + sx, Y - b + sy], [X + a + sx, Y + sy], [X + sx, Y + b + sy], [X, Y + b]], { fill: '#10112B', 'fill-opacity': op });
  };
  el('filter', { id: 'ml-soft', x: '-30%', y: '-30%', width: '160%', height: '160%' }, defs).appendChild(el('feGaussianBlur', { stdDeviation: 2.2 }));
  const cells = [], lit = new Map(), beamLayers = [poolL];
  const order = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) order.push([r, c]);
  order.sort((p, q) => p[0] + p[1] - (q[0] + q[1]));
  for (const [r, c] of order) {
    const [X, Y] = P(r, c);
    const g = el('g', { class: 'ml-c', 'data-r': r, 'data-c': c }, room);
    const tg = el('g', { class: 'ml-c' }, floorL);
    if (r === n - 1) poly(tg, [[X - A, Y], [X, Y + B], [X, Y + B + SLAB], [X - A, Y + SLAB]], { fill: SLAB_L });
    if (c === n - 1) poly(tg, [[X, Y + B], [X + A, Y], [X + A, Y + SLAB], [X, Y + B + SLAB]], { fill: SLAB_R });
    const top = poly(tg, [[X, Y - B], [X + A, Y], [X, Y + B], [X - A, Y]], { class: 'ml-t', fill: mix((r + c) % 2 ? '#7B7FC9' : '#8387D1', '#585CA6', (r + c) / (2 * n - 2)), stroke: '#9296DA', 'stroke-opacity': '.45', 'stroke-width': 1 });
    const sh = el('g', {}, shadowL);
    const bl = el('g', { class: 'ml-bl' }, g);
    beamLayers.push(bl);
    const ob = el('g', {}, g);
    const ml = el('g', {}, g);
    cells[r * n + c] = { top, bl, ml, sh, m: -1 };

    if (has(level.walls, r, c)) {
      const gh = ghost(r, c), wg = el('g', gh ? { opacity: 0.34 } : {}, ob), a = A * 0.86, b = B * 0.86;
      shadow(sh, X, Y, 0.86, 28, gh ? 0.3 : 0.55);
      cube(wg, X, Y, 0.86, 28, WALLG, { stroke: '#FFE3D8', 'stroke-opacity': '.35' });
      faces.set(r + ',' + c, [poly(wg, [[X - a, Y - 28], [X, Y + b - 28], [X, Y + b], [X - a, Y]], { class: 'ml-fl', fill: '#FFE27A' }), poly(wg, [[X, Y + b - 28], [X + a, Y - 28], [X + a, Y], [X, Y + b]], { class: 'ml-fl', fill: '#FFC14A' })]);
    }
    if (r === level.laser[0] && c === level.laser[1]) {
      shadow(sh, X, Y, 0.62, 18, 0.45);
      cube(ob, X, Y, 0.62, 18, LASERG);
      const d = DIRS[level.laser[2]], pp = [-d[1], d[0]];
      const at = (a, b) => G(X, Y, a * d[0] + b * pp[0], a * d[1] + b * pp[1], 18);
      poly(ob, [at(0.36, 0), at(-0.06, 0.15), at(-0.06, -0.15)].map((p) => p), { fill: '#FFE27A', stroke: '#B58F2E', 'stroke-width': 0.8, 'stroke-linejoin': 'round' });
    }
    if (r === level.target[0] && c === level.target[1]) {
      const t = el('g', {}, ob);
      el('rect', { x: X - 9, y: Y - 96, width: 18, height: 96, fill: 'url(#ml-pil)', class: 'ml-pil' }, t);
      [[0.78, '#2A8A8C'], [0.56, '#A8E6CF'], [0.34, '#3FB8AF'], [0.14, '#2B2D5B']].forEach(([k, f], i) => el('ellipse', { cx: X, cy: Y, rx: A * k, ry: B * k, fill: f, class: i === 1 || i === 3 ? 'ml-ring' : '' }, t));
      lit.set(r + ',' + c, [t]);
    }
    if (has(level.checks, r, c)) {
      const t = el('g', {}, ob);
      el('ellipse', { cx: X, cy: Y, rx: 14, ry: 8, fill: '#1B1C40', 'fill-opacity': '.4' }, t);
      const f = el('g', { class: 'ml-float' }, t);
      poly(f, [[X, Y - 34], [X, Y - 6], [X - 11, Y - 20]], { class: 'ml-gl', fill: '#F3B6CD' });
      poly(f, [[X, Y - 34], [X + 11, Y - 20], [X, Y - 6]], { class: 'ml-gr', fill: '#C97AA0' });
      poly(f, [[X, Y - 40], [X + 3, Y - 36], [X, Y - 32], [X - 3, Y - 36]], { class: 'ml-spark', fill: '#fff' });
      lit.set(r + ',' + c, [t]);
    }
    if (!rm) { // the room assembles itself: blocks rise out of the dark, nearest the far corner first
      const dl = (r + c) * 35;
      tg.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: dl, easing: EASE, fill: 'backwards' });
      ob.animate([{ opacity: 0, transform: 'translateY(-26px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: dl + 250, easing: EASE, fill: 'backwards' });
      sh.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: dl + 650, easing: EASE, fill: 'backwards' });
    }
  }
  beamLayers.push(glow);
  { // an always-visible beacon over the target, drawn above every wall
    const [tr, tc] = level.target, [X, Y] = P(tr, tc), topL = el('g', { 'pointer-events': 'none' }, room), mk = el('g', { class: 'ml-float' }, topL);
    poly(mk, [[X, Y - 126], [X + 9, Y - 115], [X, Y - 104], [X - 9, Y - 115]], { class: 'ml-mkf', stroke: '#fff', 'stroke-width': 1.4, 'stroke-linejoin': 'round' });
    poly(mk, [[X - 5, Y - 98], [X + 5, Y - 98], [X, Y - 91]], { class: 'ml-mkf' });
    lit.get(tr + ',' + tc).push(mk);
  }
  // tiles under about 46 px are too small to hit one by one: on those boards a tap selects a tile and a big picker sets the mirror
  const small = n >= 7;
  let sel = null;
  const selEl = poly(fx, [[0, 0]], { class: 'ml-sel' });
  const select = (r, c) => {
    sel = r === undefined ? null : [r, c];
    if (sel) { const [X, Y] = P(r, c); selEl.setAttribute('points', [[X, Y - B], [X + A, Y], [X, Y + B], [X - A, Y]].join(' ')); }
    selEl.classList.toggle('on', !!sel);
    ui();
  };
  // one handler picks the nearest tile, so a tap just outside a diamond still lands
  const pickAt = (cx, cy) => {
    const m = svg.getScreenCTM();
    if (!m) return;
    const q = new DOMPoint(cx, cy).matrixTransform(m.inverse()), x = (q.x - OX) / A, y = (q.y + 8 - OY) / B, rr = (y - x) / 2, cc = (y + x) / 2;
    if (rr < -0.85 || cc < -0.85 || rr > n - 0.15 || cc > n - 0.15) return;
    const r = Math.min(n - 1, Math.max(0, Math.round(rr))), c = Math.min(n - 1, Math.max(0, Math.round(cc)));
    if (!small) return tap(r, c);
    if (busy || won) return;
    if (has(level.walls, r, c) || has(level.checks, r, c) || (r === level.target[0] && c === level.target[1]) || (r === level.laser[0] && c === level.laser[1])) return select();
    select(r, c);
  };
  // drag anywhere to tilt the room a few degrees (the layers behind move too); a tap that does not move picks a tile
  let drag = null;
  const tiltTo = (ry, rx) => {
    tiltEl.style.transform = ry || rx ? `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg)` : '';
    root.style.setProperty('--ry', ry);
    root.style.setProperty('--rx', rx);
  };
  const letGo = () => {
    if (!drag) return;
    const moved = drag.moved;
    drag = null;
    if (!moved || rm) return;
    root.classList.add('ml-rel');
    tiltTo(0, 0);
    later(() => root.classList.remove('ml-rel'), 750);
  };
  on(root, 'pointerdown', (e) => {
    if ((e.pointerType === 'mouse' && e.button !== 0) || e.target.closest('button')) return;
    audio();
    drag = { x: e.clientX, y: e.clientY, moved: false, note: false, onBoard: !!e.target.closest('svg.ml-s') };
    root.classList.remove('ml-rel');
    root.setPointerCapture?.(e.pointerId);
  });
  on(root, 'pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 8) return;
    drag.moved = true;
    if (rm) return;
    const ry = Math.max(-9, Math.min(9, dx * 0.09)), rx = Math.max(-5, Math.min(5, -dy * 0.06));
    tiltTo(+ry.toFixed(2), +rx.toFixed(2));
    if (!drag.note && Math.abs(ry) >= 7) { drag.note = true; snd(ry > 0 ? 4 : 2, 0.06); }
  });
  on(root, 'pointerup', (e) => {
    if (drag && !drag.moved && drag.onBoard) pickAt(e.clientX, e.clientY);
    letGo();
  });
  on(root, 'pointercancel', letGo);

  // controls: mirror stock + fire
  const inv = document.createElement('div');
  inv.className = 'ml-inv';
  const slots = [];
  for (let i = 0; i < level.count; i++) {
    const d = document.createElement('div');
    d.innerHTML = '<svg viewBox="0 0 30 30"><g class="ml-f"><polygon points="4,9 15,15 15,27 4,21" fill="#7FD3C2"/><polygon points="15,15 26,9 26,21 15,27" fill="#3FB8AF"/><polygon points="15,3 26,9 15,15 4,9" fill="#CFF3E4"/><path d="M5 10L25 10" stroke="#E8A0BF" stroke-width="2.4" stroke-linecap="round" transform="translate(0 0)"/></g><g class="ml-e" fill="none" stroke="#CFF3E4" stroke-opacity=".6" stroke-width="1.4" stroke-dasharray="3 3" stroke-linejoin="round"><polygon points="15,3 26,9 26,21 15,27 4,21 4,9"/></g></svg>';
    inv.appendChild(d.firstChild);
    slots.push(inv.lastChild);
  }
  const btn = document.createElement('button');
  btn.className = 'ml-fire';
  btn.setAttribute('aria-label', 'fire');
  btn.innerHTML = '<svg viewBox="0 0 44 44"><polygon points="25,3 9,25 20,25 17,41 35,17 24,17" fill="#2B2D5B" stroke="#2B2D5B" stroke-width="2.5" stroke-linejoin="round"/></svg>';
  const row = document.createElement('div');
  row.className = 'ml-row';
  const pk = [];
  if (small) {
    const box = document.createElement('div');
    box.className = 'ml-pick';
    const cube = (l, r, t) => `<polygon points="4,12 18,20 18,32 4,24" fill="${l}"/><polygon points="18,20 32,12 32,24 18,32" fill="${r}"/><polygon points="18,4 32,12 18,20 4,12" fill="${t}"/>`;
    const icons = [
      `<svg viewBox="0 0 36 36">${cube('#7FD3C2', '#3FB8AF', '#CFF3E4')}<path d="M6 12H30" stroke="#E8A0BF" stroke-width="3" stroke-linecap="round"/></svg>`,
      `<svg viewBox="0 0 36 36">${cube('#7FD3C2', '#3FB8AF', '#CFF3E4')}<path d="M18 6V18" stroke="#E8A0BF" stroke-width="3" stroke-linecap="round"/></svg>`,
      '<svg viewBox="0 0 36 36" fill="none" stroke="#CFF3E4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="18,4 32,12 32,24 18,32 4,24 4,12" stroke-dasharray="3 3" stroke-opacity=".6"/><path d="M12 12L24 24M24 12L12 24"/></svg>',
    ];
    [0, 1, -1].forEach((m, i) => {
      const b = document.createElement('button');
      b.className = 'ml-pk';
      b.setAttribute('aria-label', ['mirror one', 'mirror two', 'clear'][i]);
      b.innerHTML = icons[i];
      on(b, 'click', () => sel && tap(sel[0], sel[1], m));
      box.appendChild(b);
      pk.push([b, m]);
    });
    row.appendChild(box);
  }
  row.appendChild(btn);
  root.append(inv, row);
  on(btn, 'click', () => fire());

  const hud = () => ctx.hud({ moves: h.present.moves, best, tries: h.present.submits, maxTries: logic.maxTries(), canUndo: false });
  const ui = () => {
    btn.disabled = busy || won || !logic.legalMoves(h.present).some((m) => m.t === 's');
    slots.forEach((s, i) => s.classList.toggle('ml-used', i < h.present.mirrors.length));
    const mi = sel && h.present.mirrors.find((p) => p[0] === sel[0] && p[1] === sel[1]);
    pk.forEach(([b, m]) => { b.disabled = !sel || busy || won; b.classList.toggle('cur', !!sel && (mi ? mi[2] === m : m === -1)); });
  };

  // mirror: glass cube with a pane on the diagonal; the top face repeats the diagonal as a bright line
  function mirrorEl(parent, X, Y, m) {
    const g = el('g', {}, parent), s = 0.72, hh = 24, a = A * s, b = B * s;
    if (m === 0) poly(g, [[X - a, Y], [X + a, Y], [X + a, Y - hh], [X - a, Y - hh]], { fill: 'url(#ml-pane)' });
    else poly(g, [[X - 3, Y - b - hh], [X + 3, Y - b - hh], [X + 3, Y + b], [X - 3, Y + b]], { fill: 'url(#ml-pane)' });
    cube(g, X, Y, s, hh, GLASS, { stroke: '#fff', 'stroke-opacity': '.85', 'stroke-width': 1.2, 'stroke-linejoin': 'round' });
    const ln = m === 0 ? `M${X - a + 3} ${Y - hh}L${X + a - 3} ${Y - hh}` : `M${X} ${Y - b - hh + 2}L${X} ${Y + b - hh - 2}`;
    el('path', { d: ln, stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-opacity': '.95' }, g);
    if (!rm) { // a slow glint crosses the glass now and then
      const gl = el('path', { class: 'ml-sh', d: ln, stroke: '#fff', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-opacity': '.3', style: `animation-delay:${-((X * 7 + Y * 3) % 70) / 10}s` }, g);
    }
    return g;
  }
  const ring = (X, Y, col, delay, k0, dur, k1 = 2.2) => {
    if (rm) return;
    const e = el('ellipse', { cx: X, cy: Y, rx: 20, ry: 20 * B / A, fill: 'none', stroke: col, 'stroke-width': 2.4, style: 'transform-box:fill-box;transform-origin:center' }, fx);
    e.animate([{ transform: `scale(${k0})`, opacity: 0.8 }, { transform: `scale(${k1})`, opacity: 0 }], { duration: dur, delay, easing: EASE, fill: 'backwards' }).onfinish = () => e.remove();
  };
  const flare = (X, Y, delay, r = 9) => {
    if (rm) return;
    const e = el('circle', { cx: X, cy: Y, r: r * 1.8, fill: 'url(#ml-flg)', style: 'transform-box:fill-box;transform-origin:center' }, glow);
    e.animate([{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1.5)', opacity: 1, offset: 0.35 }, { transform: 'scale(.9)', opacity: 0.5 }], { duration: 520, delay, easing: EASE, fill: 'both' });
  };
  const sync = (tr, tc) => {
    for (const [r, c] of order) {
      const cell = cells[r * n + c], mi = h.present.mirrors.find((p) => p[0] === r && p[1] === c), m = mi ? mi[2] : -1;
      if (cell.m === m) continue;
      cell.m = m;
      const old = cell.ml.firstChild, oldSh = cell.sh.lastChild?.dataset?.mirror ? cell.sh.lastChild : null;
      if (old) { if (rm) old.remove(); else old.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-10px)' }], { duration: 250, easing: EASE }).onfinish = () => old.remove(); }
      oldSh?.remove();
      if (m >= 0) {
        const [X, Y] = P(r, c), g = mirrorEl(cell.ml, X, Y, m);
        const s = shadow(cell.sh, X, Y, 0.72, 24, 0.3);
        s.dataset.mirror = 1;
        if (!rm && r === tr && c === tc) {
          const turn = !!old; // turning an existing mirror flips it about its own axis; a new one drops in
          g.style.cssText = 'transform-box:fill-box;transform-origin:50% 100%';
          g.animate(turn ? [{ opacity: 0, transform: 'scale(.2,1.08)' }, { opacity: 1, transform: 'none' }] : [{ opacity: 0, transform: 'translateY(-16px)' }, { opacity: 1, transform: 'none' }], { duration: turn ? 380 : 320, easing: EASE });
          s.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, easing: EASE });
          ring(X, Y, '#FFFFFF', 0, 0.5, 600);
        }
      }
    }
    ui();
  };
  const step = (mv) => { const nx = play(h, logic, mv); if (nx === h) return false; h = nx; return true; };

  // want: 0 or 1 sets that mirror, -1 clears; left out, a tap cycles empty -> / -> \ -> empty
  function tap(r, c, want) {
    if (busy || won) return;
    const cell = cells[r * n + c], mi = h.present.mirrors.find((p) => p[0] === r && p[1] === c);
    const next = want ?? (mi ? (mi[2] === 1 ? -1 : 1) : 0);
    if (mi ? mi[2] === next : next < 0) return;
    let ok = true;
    if (mi) ok = step({ t: 'r', cell: [r, c] });
    if (ok && next >= 0) ok = step({ t: 'p', cell: [r, c], m: next });
    if (!ok) {
      if (!rm && !has(level.walls, r, c)) inv.animate([{ transform: 'none' }, { transform: 'scale(1.18)' }, { transform: 'none' }], { duration: 300, easing: EASE });
      return;
    }
    cell.top.classList.add('ml-hot');
    later(() => cell.top.classList.remove('ml-hot'), 220);
    snd(r + c * 2 + (mi ? (next < 0 ? -3 : 4) : 0));
    sync(r, c);
    hud();
  }

  function celebrate() {
    if (rm) return;
    const [X, Y] = P(level.target[0], level.target[1]);
    flood.animate([{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 0.45 }], { duration: 2400, easing: EASE, fill: 'forwards' });
    svg.animate([{ transform: 'none' }, { transform: 'translateY(-12px)' }, { transform: 'none' }], { duration: 1600, easing: 'ease-in-out' }); // the whole room lifts, then settles
    [0, 1, 2].forEach((k) => ring(X, Y, '#FFE27A', k * 200, 0.4, 1000, 2.6 + k * 0.8));
    level.checks.forEach(([r, c], k) => { const [cx, cy] = P(r, c); ring(cx, cy - 20, '#F3B6CD', 150 + k * 90, 0.3, 900, 2.2); });
    const cols = ['#FFE27A', '#FFB8A0', '#A8E6CF', '#E8A0BF'];
    for (let i = 0; i < 16; i++) {
      const ang = (i / 16) * Math.PI * 2, d = 40 + (i % 3) * 22;
      const sp = poly(fx, [[X, Y - 24], [X + 4, Y - 19], [X, Y - 14], [X - 4, Y - 19]], { fill: cols[i % 4] });
      sp.animate([{ transform: 'translate(0,0)', opacity: 1 }, { transform: `translate(${Math.cos(ang) * d}px,${Math.sin(ang) * d * 0.6 - 26}px)`, opacity: 0 }], { duration: 1000, easing: EASE }).onfinish = () => sp.remove();
    }
    for (let i = 0; i < 12; i++) { // a column of light motes climbs out of the target
      const sp = poly(fx, [[X + (i % 5 - 2) * 4, Y - 20], [X + (i % 5 - 2) * 4 + 3, Y - 16], [X + (i % 5 - 2) * 4, Y - 12], [X + (i % 5 - 2) * 4 - 3, Y - 16]], { fill: cols[i % 4] });
      sp.animate([{ transform: 'translate(0,0)', opacity: 0 }, { opacity: 1, offset: 0.2 }, { transform: `translate(${(i % 3 - 1) * 14}px,${-70 - i * 9}px)`, opacity: 0 }], { duration: 1500, delay: 200 + i * 80, easing: EASE, fill: 'backwards' }).onfinish = () => sp.remove();
    }
  }

  function fire() {
    if (busy || won || !logic.legalMoves(h.present).some((m) => m.t === 's')) return;
    h = play(h, logic, { t: 's' });
    const s = h.present, path = logic.beam(s), DT = rm ? 40 : 130;
    busy = true;
    sel = null;
    selEl.classList.remove('on');
    swell(true);
    ui();
    hud();
    if (!rm) flare(...(([X, Y]) => [X, Y - 18])(P(level.laser[0], level.laser[1])), 0, 12);
    const pts = path.map(([r, c]) => { const [X, Y] = P(r, c); return [X, Y - HB]; });
    const mid = (a, b, k = 0.5) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
    path.forEach(([r, c], i) => {
      const p = pts[i], last = i === path.length - 1, mirrored = has(s.mirrors, r, c);
      let d;
      if (i === 0) {
        const nx = pts[1] || G(p[0], p[1], ...DIRS[level.laser[2]]);
        d = [mid(p, nx, 0.28), last ? mid(p, nx, 0.5) : mid(p, nx)];
      } else {
        const out = last ? (mirrored ? p : [p[0] + (p[0] - pts[i - 1][0]) / 2, p[1] + (p[1] - pts[i - 1][1]) / 2]) : mid(p, pts[i + 1]);
        d = [mid(pts[i - 1], p), p, out];
      }
      const dd = 'M' + d.map((q) => q.join(' ')).join('L');
      const g = el('g', { class: 'ml-bm', style: `--t:${i * DT}ms;--d:${DT}ms` }, cells[r * n + c].bl);
      el('path', { d: dd, pathLength: 1, stroke: '#FFE27A', 'stroke-width': 7, 'stroke-opacity': 0.4 }, g);
      el('path', { d: dd, pathLength: 1, stroke: '#FFF6C8', 'stroke-width': 3 }, g);
      // bloom: a blurred wide copy above the room, and a pool of warm light on the floor under the beam
      const gg = el('g', { class: 'ml-bm', style: `--t:${i * DT}ms;--d:${DT}ms` }, glow);
      el('path', { d: dd, pathLength: 1, stroke: '#FFD45A', 'stroke-width': 24, 'stroke-opacity': 0.1 }, gg);
      el('path', { d: dd, pathLength: 1, stroke: '#FFD45A', 'stroke-width': 14, 'stroke-opacity': 0.2 }, gg);
      for (const f of [faces.get(r - 1 + ',' + c)?.[0], faces.get(r + ',' + (c - 1))?.[1]]) f && later(() => f.classList.add('on'), i * DT + DT); // beam light washes the wall faces beside it
      const [fX, fY] = P(r, c);
      el('ellipse', { cx: fX, cy: fY, rx: A * 0.95, ry: B * 0.95, fill: 'url(#ml-poolg)' }, poolL).animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: i * DT, easing: EASE, fill: 'both' });
      if (mirrored) { flare(p[0], p[1], i * DT); later(() => snd(i + 5), i * DT); }
      else if (i % 3 === 0 && !rm) later(() => snd(i / 3 * 2 + 1, 0.09), i * DT);
    });
    const hit = new Set();
    path.forEach(([r, c], i) => {
      const k = r + ',' + c;
      if (lit.has(k) && !hit.has(k)) { hit.add(k); later(() => { lit.get(k).forEach((n) => n.classList.add('ml-lit')); snd(hit.size * 2 + 7); }, i * DT + DT); }
    });
    const E = path.length * DT + DT;
    if (logic.isSolved(s)) {
      won = true;
      later(() => { chord(); celebrate(); ui(); }, E);
      later(() => swell(false), E + 2400);
      later(() => ctx.solved({ score: logic.score(s) }), E + 700);
    } else {
      later(() => swell(false), E);
      later(() => { beamLayers.forEach((l) => { l.style.opacity = 0; }); lit.forEach((a) => a.forEach((n) => n.classList.remove('ml-lit'))); faces.forEach((f) => f.forEach((x) => x.classList.remove('on'))); }, E + 450);
      later(() => { beamLayers.forEach((l) => { l.textContent = ''; l.style.opacity = 1; }); busy = false; ui(); }, E + 900);
    }
  }

  sync();
  hud();

  return {
    undo() { h = undo(h, logic.maxTries()); },
    reset() { h = reset(h, logic.maxTries()); },
    destroy() {
      for (const t of timers) clearTimeout(t);
      timers.clear();
      offs.forEach((f) => f());
      ac?.close?.();
      ac = undefined;
      amb = undefined;
      ctx.sound.win = shellWin;
      root.textContent = '';
      root.style.removeProperty('--ry');
      root.style.removeProperty('--rx');
      root.classList.remove('g-mirror-laser', 'ml-m', 'ml-rel');
    },
  };
}
