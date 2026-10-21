import * as logic from '../logic/lemmings-tools.js';
import { newHistory, play, undo, reset } from '../logic/history.js';

const URI = (s) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
const STARS = URI('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><g fill="#fff">' + [[30, 40, 1.4, .7], [110, 20, 1, .5], [210, 70, 1.8, .8], [270, 150, 1.1, .5], [60, 160, 1.6, .6], [160, 230, 1.2, .5], [250, 270, 1.6, .7], [20, 270, 1, .4], [130, 120, 1, .4]].map(([x, y, r, o]) => `<circle cx="${x}" cy="${y}" r="${r}" fill-opacity="${o}"/>`).join('') + '</g></svg>');
const HAZE = URI('<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480"><defs>' + [['a', '#3FB8AF'], ['b', '#E8A0BF'], ['c', '#FFB8A0']].map(([i, c]) => `<radialGradient id="${i}"><stop offset="0" stop-color="${c}" stop-opacity=".24"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`).join('') + '</defs><circle cx="110" cy="120" r="170" fill="url(#a)"/><circle cx="360" cy="260" r="190" fill="url(#b)"/><circle cx="200" cy="420" r="140" fill="url(#c)"/></svg>');
const MOTES = URI('<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360">' + [[40, 60, 2], [130, 210, 1.6], [220, 40, 2.2], [300, 150, 1.5], [90, 320, 1.8], [250, 290, 2]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r * 3}" fill="#FFE9A8" fill-opacity=".1"/><circle cx="${x}" cy="${y}" r="${r}" fill="#FFE9A8" fill-opacity=".7"/>`).join('') + '</svg>');
const SPRING = 'cubic-bezier(.34,1.56,.64,1)', OUT = 'cubic-bezier(.215,.61,.355,1)';
const K = 0.95, DX = 38, DY = 23, TH = 12, WH = 24, STEP = 170, STAG = 360;
const CREW = ['#FFB8A0', '#3FB8AF', '#E8A0BF', '#A8E6CF'];
const FLOOR = ['#FFC4AE', '#E8A0BF', '#C07FA6'], WALL = ['#7ADBD3', '#3FB8AF', '#2C8C8A'], EXIT = ['#A8E6CF', '#6FC6A8', '#4FA088'];
const GLYPH = [
  '<path d="M3 11h22v6H3zM9 11v6M14 11v6M19 11v6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>',
  '<path d="M5 11Q14 3 23 11M14 7V25" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
  '<path d="M23 14H6M13 7L6 14l7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
  '<rect x="6" y="6" width="16" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M6 22L22 6" stroke="currentColor" stroke-width="2.6"/>',
];

export const css = `
.g-lemmings-tools { position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; min-height: 520px; padding: 10px 0 16px; box-sizing: border-box; touch-action: none; user-select: none; -webkit-user-select: none;
  background: radial-gradient(120% 60% at 50% 0%, #4A4E98 0%, rgba(74,78,152,0) 65%), linear-gradient(180deg, #34376D 0%, #2B2D5B 55%, #1F2147 100%); }
.g-lemmings-tools .lt-l { position: absolute; inset: -18px; pointer-events: none; }
.g-lemmings-tools .lt-l1 { background-image: ${STARS}; background-size: 300px 300px; animation: lt-d1 170s linear infinite; }
.g-lemmings-tools .lt-l2 { background-image: ${HAZE}; background-size: 480px 480px; animation: lt-d1 260s linear infinite reverse; }
.g-lemmings-tools .lt-l3 { background-image: ${MOTES}; background-size: 360px 360px; animation: lt-d3 70s linear infinite; }
@keyframes lt-d1 { to { background-position: 480px 0; } }
@keyframes lt-d3 { to { background-position: 140px -360px; } }
.g-lemmings-tools .lt-flood { position: absolute; inset: 0; pointer-events: none; opacity: 0; background: radial-gradient(70% 55% at 50% 45%, rgba(255,226,122,.7), rgba(255,184,160,.3) 55%, rgba(255,184,160,0) 80%); transition: opacity .5s cubic-bezier(.215,.61,.355,1); }
.g-lemmings-tools.lt-won .lt-flood { opacity: 1; }
.g-lemmings-tools .lt-pips { position: relative; display: flex; gap: 8px; min-height: 28px; align-items: center; }
.g-lemmings-tools .lt-pip { width: 32px; height: 20px; overflow: visible; }
.g-lemmings-tools .lt-pip path { fill: rgba(255,255,255,.08); stroke: #FFE27A; stroke-width: 2; stroke-linejoin: round; transition: fill .4s cubic-bezier(.215,.61,.355,1); }
.g-lemmings-tools .lt-pip.on path { fill: #FFE27A; }
.g-lemmings-tools .lt-pip.on { filter: drop-shadow(0 0 6px #FFE27A); }
.g-lemmings-tools .lt-stage { position: relative; width: 100%; max-width: 520px; transform: perspective(900px) rotateX(calc(var(--rx, 0) * 1deg)) rotateY(calc(var(--ry, 0) * 1deg)); transition: transform .12s linear; }
.g-lemmings-tools.lt-rel .lt-stage { transition: transform .7s ${SPRING}; }
.g-lemmings-tools svg.lt-s { width: 100%; height: auto; display: block; overflow: visible; }
.g-lemmings-tools .lt-c { transform-box: fill-box; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.g-lemmings-tools .lt-fx, .g-lemmings-tools .lt-hints { pointer-events: none; }
.g-lemmings-tools.lt-m .lt-hint { animation: lt-h 1.5s ease-in-out infinite; }
.g-lemmings-tools .lt-hint { opacity: .8; }
@keyframes lt-h { 50% { opacity: .25; } }
.g-lemmings-tools.lt-m .lt-ring { animation: lt-h 2.2s ease-in-out infinite; }
.g-lemmings-tools.lt-m .lt-bob { animation: lt-b 1.3s ease-in-out infinite; }
.g-lemmings-tools.lt-m .lt-float { animation: lt-b 2.2s ease-in-out infinite; }
@keyframes lt-b { 50% { transform: translateY(-2.5px); } }
.g-lemmings-tools.lt-m svg.lt-s { animation: lt-sway 7s ease-in-out infinite; }
@keyframes lt-sway { 50% { transform: translateY(-4px); } }
.g-lemmings-tools .lt-bar { position: relative; display: flex; align-items: center; justify-content: center; gap: 10px; }
.g-lemmings-tools .lt-tb { all: unset; box-sizing: border-box; width: 52px; height: 52px; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; color: #FFE9DD; cursor: pointer; background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1.5px rgba(255,255,255,.3); transition: transform .3s cubic-bezier(.215,.61,.355,1), background .3s, opacity .4s; -webkit-tap-highlight-color: transparent; }
.g-lemmings-tools .lt-tb:active { transform: scale(.92); }
.g-lemmings-tools .lt-tb svg { width: 26px; height: 26px; }
.g-lemmings-tools .lt-tb.cur { background: rgba(168,230,207,.34); box-shadow: inset 0 0 0 2px #A8E6CF; color: #fff; }
.g-lemmings-tools .lt-tb.out { opacity: .35; }
.g-lemmings-tools .lt-dots { display: flex; gap: 3px; height: 5px; }
.g-lemmings-tools .lt-dots i { width: 5px; height: 5px; border-radius: 50%; background: #FFE27A; }
.g-lemmings-tools .lt-dots i.u { background: none; box-shadow: inset 0 0 0 1px rgba(255,255,255,.5); }
.g-lemmings-tools .lt-go { all: unset; box-sizing: border-box; width: 60px; height: 60px; margin-left: 8px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at 35% 28%, #FFE0D0, #FFB8A0 55%, #E8A0BF); box-shadow: 0 0 22px rgba(255,184,160,.6), inset 0 -4px 8px rgba(120,50,80,.25); transition: transform .3s cubic-bezier(.215,.61,.355,1), opacity .4s; -webkit-tap-highlight-color: transparent; }
.g-lemmings-tools.lt-m .lt-go:not(:disabled) { animation: lt-gp 2.4s ease-in-out infinite; }
@keyframes lt-gp { 50% { box-shadow: 0 0 34px rgba(255,184,160,.95), inset 0 -4px 8px rgba(120,50,80,.25); } }
.g-lemmings-tools .lt-go:active { transform: scale(.92); }
.g-lemmings-tools .lt-go:disabled { opacity: .4; }
.g-lemmings-tools .lt-go svg { width: 26px; height: 26px; margin-left: 3px; fill: #2B2D5B; }
.g-lemmings-tools .lt-tb:focus-visible, .g-lemmings-tools .lt-go:focus-visible { outline: 2px dashed #fff; outline-offset: 2px; }
`;

// the crew's own bell voice and a soft pad; the context is made on the first touch
const SC = [0, 2, 4, 7, 9];
let ac;
function pad() {
  const out = ac.createGain(), lp = ac.createBiquadFilter();
  out.gain.value = 0.0001; out.gain.setTargetAtTime(0.035, ac.currentTime, 2.5); lp.type = 'lowpass'; lp.frequency.value = 500;
  lp.connect(out); out.connect(ac.destination);
  [98, 147, 196.5, 246].forEach((f, k) => { const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = f; o.detune.value = k * 3; o.connect(lp); o.start(); });
}
const audio = () => {
  if (ac === undefined) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); pad(); } catch { ac = null; } }
  if (ac && ac.state === 'suspended') ac.resume();
  return ac;
};
function bell(i, vol, delay, len) { // vibraphone-like: a sine plus a short bright partial
  const f = 330 * 2 ** ((SC[((i % 5) + 5) % 5] + 12 * (Math.floor(i / 5) & 1)) / 12), t = ac.currentTime + delay;
  [[1, 1, len], [4, 0.25, len * 0.3]].forEach(([m, v, l]) => {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.value = f * m;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol * v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + l);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + l + 0.05);
  });
}

export function mount(root, ctx) {
  root.classList.add('g-lemmings-tools');
  const level = logic.makeLevel(ctx.level), best = logic.bestScore(level), rm = ctx.reduceMotion;
  const n = level.cells.length, lines = Math.ceil(n / 6), per = Math.ceil(n / lines);
  let h = newHistory(logic.initialState(level));
  let sel = 0, running = false, won = false, raf = 0, saved = 0;
  const risen = new Set(), timers = new Set();
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
  const snd = (i, vol = 0.08, delay = 0, len = 1) => { if (audio()) bell(i, vol, delay, len); else later(() => ctx.sound.move(i), delay * 1000); };
  const mk = (cls, tag = 'div', parent = root) => { const e = document.createElement(tag); e.className = cls; parent.appendChild(e); return e; };
  const sv = (tag, a, parent) => { const e = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in a) e.setAttribute(k, a[k]); parent?.appendChild(e); return e; };
  const toolAt = (s, i) => s.tools.find((t) => t[0] === i)?.[1];

  // the path snakes over a small floating platform: line l runs forward on even l and back on odd l
  const gridOf = (i) => { const l = Math.floor(i / per), p = i % per; return [l % 2 ? per - 1 - p : p, l]; };
  const xy = (i) => { const [c, r] = gridOf(i); return [(c - r) * DX, (c + r) * DY]; };
  const P = (i) => {
    if (i >= 0 && i < n) return xy(i);
    const e = i < 0 ? 0 : n - 1, a = xy(e), b = xy(i < 0 ? Math.min(1, n - 1) : Math.max(n - 2, 0)), k = i < 0 ? -i : i - n + 1;
    return [a[0] + (a[0] - b[0]) * k, a[1] + (a[1] - b[1]) * k];
  };
  const pts = Array.from({ length: n }, (_, i) => xy(i));
  const [x0, x1] = [Math.min(...pts.map((p) => p[0])) - DX - 14, Math.max(...pts.map((p) => p[0])) + DX + 14];
  const [y0, y1] = [Math.min(...pts.map((p) => p[1])) - DY - WH - 40, Math.max(...pts.map((p) => p[1])) + DY + TH + 30];

  const pj = (x, y) => (a, b, z = 0) => `${(x + (a - b) * DX).toFixed(1)},${(y + (a + b) * DY - z).toFixed(1)}`;
  const rh = (x, y, s, z = 0) => { const p = pj(x, y); return `${p(-s, -s, z)} ${p(s, -s, z)} ${p(s, s, z)} ${p(-s, s, z)}`; };
  const poly = (p, fill, extra = '') => `<polygon points="${p}" fill="${fill}" ${extra}/>`;
  function block(x, y, hh, [t, l, r], k = 1, d = TH) {
    const p = pj(x, y), s = 0.5 * k;
    return poly(`${p(-s, s, hh)} ${p(s, s, hh)} ${p(s, s, -d)} ${p(-s, s, -d)}`, l) + poly(`${p(s, -s, hh)} ${p(s, s, hh)} ${p(s, s, -d)} ${p(s, -s, -d)}`, r) + poly(rh(x, y, s, hh), t);
  }
  function cellArt(i) {
    const s = h.present, [x, y] = xy(i), p = pj(x, y), type = risen.has(i) ? 2 : s.cells[i], tool = toolAt(s, i);
    const ln = (a, b, c2, d2, z, st) => `<path d="M${p(a, b, z)}L${p(c2, d2, z)}" ${st} fill="none"/>`;
    if (type === 2) {
      if (tool === 1) { // digger: the wall is a dashed ghost, rubble and a floating pick
        const top = rh(x, y, 0.5, WH).split(' ');
        return block(x, y, 0, FLOOR, K) + [[0.18, -0.1], [-0.1, 0.2], [0.05, 0.02]].map(([a, b]) => block(...p(a, b).split(',').map(Number), 6, WALL, 0.2, 0)).join('') +
          `<g class="lt-tool"><polygon points="${top.join(' ')}" fill="rgba(168,230,207,.1)" stroke="#A8E6CF" stroke-width="1.6" stroke-dasharray="4 3"/>` +
          [[-0.5, 0.5], [0.5, 0.5], [0.5, -0.5]].map(([a, b]) => `<path d="M${p(a, b, WH)}L${p(a, b, 0)}" stroke="#A8E6CF" stroke-width="1.4" stroke-dasharray="4 3" opacity=".6"/>`).join('') +
          `<g transform="translate(${x} ${y - WH - 6})"><g class="lt-float"><path d="M-10 -5Q0 -14 10 -5M0 -9V9" fill="none" stroke="#FFE27A" stroke-width="3" stroke-linecap="round"/></g></g></g>`;
      }
      return block(x, y, WH, WALL, K) + poly(rh(x, y, 0.34, WH), 'none', 'stroke="rgba(255,255,255,.4)" stroke-width="1.5"') + ln(-0.5, 0.5, 0.5, 0.5, WH * 0.5 - 2, 'stroke="rgba(0,0,0,.2)" stroke-width="1.5"') + ln(0.5, -0.5, 0.5, 0.5, WH * 0.5 - 2, 'stroke="rgba(0,0,0,.2)" stroke-width="1.5"');
    }
    if (type === 1) {
      const hole = poly(rh(x, y, 0.36), '#15133A', 'stroke="rgba(0,0,0,.3)" stroke-width="2"') + poly(rh(x, y + 4, 0.22), '#0A0924');
      if (tool === 0) return block(x, y, 0, FLOOR, K) + `<g class="lt-tool">` + block(x, y, 1, ['#E9B38F', '#C98B6B', '#A66F55'], K) + [-0.25, 0, 0.25].map((a) => ln(a, -0.5, a, 0.5, 1, 'stroke="#B5775A" stroke-width="2"')).join('') + '</g>';
      return block(x, y, 0, FLOOR, K) + hole;
    }
    let art = block(x, y, 0, type === 3 ? EXIT : FLOOR, K);
    if (type === 3) art += `<path d="M${x - 11} ${y - 2}L${x - 4} ${y - 70}H${x + 4}L${x + 11} ${y - 2}Z" fill="url(#lt-beam)"/>` + poly(rh(x, y, 0.3), 'rgba(255,226,122,.35)', 'class="lt-ring" stroke="#FFE27A" stroke-width="3" stroke-linejoin="round"');
    else if (i === s.spawn) art += poly(rh(x, y, 0.26), 'none', 'stroke="#2B2D5B" stroke-opacity=".45" stroke-width="2" stroke-dasharray="3 3"');
    if (type === 0 && tool === undefined && i < n - 1) { // faint chevron: the way the crew walks
      const [c, r] = gridOf(i), [nc, nr] = gridOf(i + 1), d = [nc - c, nr - r], v = [-d[1], d[0]];
      art += `<polyline points="${[[-0.12, -0.14], [0.1, 0], [-0.12, 0.14]].map(([u, w]) => p(u * d[0] + w * v[0], u * d[1] + w * v[1], 0.5)).join(' ')}" fill="none" stroke="#2B2D5B" stroke-opacity=".3" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    if (tool === 2) { // arrow: points toward the cell before this one
      const [c, r] = gridOf(i), [pc, pr] = i ? gridOf(i - 1) : [c - 1, r], d = [pc - c, pr - r], v = [-d[1], d[0]];
      const q = [[-0.32, -0.1], [0.02, -0.1], [0.02, -0.26], [0.36, 0], [0.02, 0.26], [0.02, 0.1], [-0.32, 0.1]].map(([u, w]) => p(u * d[0] + w * v[0], u * d[1] + w * v[1], 1.5)).join(' ');
      art += `<g class="lt-tool">` + poly(rh(x, y, 0.4), 'rgba(168,230,207,.25)') + poly(q, '#A8E6CF', 'stroke="#2B2D5B" stroke-width="1.6" stroke-linejoin="round"') + '</g>';
    }
    if (tool === 3) art += `<g class="lt-tool">` + block(x, y, 14, ['#E8A0BF', '#C0709B', '#8F4F76'], 0.55, 0) + ln(-0.27, 0.27, 0.27, 0.27, 7, 'stroke="#fff" stroke-width="2" stroke-opacity=".7"') + ln(0.27, -0.27, 0.27, 0.27, 7, 'stroke="#fff" stroke-width="2" stroke-opacity=".7"') + '</g>';
    return art;
  }

  root.textContent = '';
  if (!rm) root.classList.add('lt-m');
  ['lt-l lt-l1', 'lt-l lt-l2', 'lt-l lt-l3', 'lt-flood'].forEach((c) => mk(c));
  const pipRow = mk('lt-pips'), pips = Array.from({ length: level.need }, () => {
    const e = sv('svg', { class: 'lt-pip', viewBox: '0 0 32 20' }); sv('path', { d: 'M16 2L30 10L16 18L2 10Z' }, e); pipRow.appendChild(e); return e;
  });
  const stage = mk('lt-stage');
  const svg = sv('svg', { class: 'lt-s', viewBox: `${x0} ${y0} ${x1 - x0} ${y1 - y0}` }); stage.appendChild(svg);
  svg.innerHTML = '<defs><linearGradient id="lt-beam" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FFE27A" stop-opacity=".7"/><stop offset="1" stop-color="#FFE27A" stop-opacity="0"/></linearGradient><radialGradient id="lt-gl"><stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset=".4" stop-color="#FFE9A8" stop-opacity=".3"/><stop offset="1" stop-color="#FFE9A8" stop-opacity="0"/></radialGradient><radialGradient id="lt-sh"><stop offset="0" stop-color="#0A0924" stop-opacity=".55"/><stop offset="1" stop-color="#0A0924" stop-opacity="0"/></radialGradient></defs>' +
    `<ellipse cx="${(x0 + x1) / 2}" cy="${y1 - 4}" rx="${(x1 - x0) * 0.42}" ry="18" fill="url(#lt-sh)"/>`;
  const floor = sv('g', {}, svg), hints = sv('g', { class: 'lt-hints' }, svg), crewG = sv('g', {}, svg), fx = sv('g', { class: 'lt-fx' }, svg);
  const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => xy(a)[1] - xy(b)[1] || xy(a)[0] - xy(b)[0]);
  const cellG = [];
  order.forEach((i) => { const g = sv('g', { class: 'lt-c' }, floor); g.dataset.i = i; [g.dataset.x, g.dataset.y] = xy(i); cellG[i] = g; });

  const crew = Array.from({ length: level.k }, (_, i) => {
    const c = CREW[i % 4], g = sv('g', {}, crewG);
    g.innerHTML = `<g class="lt-bob" style="animation-delay:${-i * 0.37}s"><ellipse cx="0" cy="1" rx="8" ry="3" fill="#0A0924" opacity=".35"/><circle cy="-12" r="19" fill="url(#lt-gl)"/><g class="lt-face"><rect x="-7" y="-21" width="14" height="19" rx="7" fill="${c}"/><ellipse cx="-2" cy="-17" rx="2.5" ry="4" fill="#fff" opacity=".35"/><path d="M0 -21V-26" stroke="${c}" stroke-width="1.6"/><circle cy="-27" r="2.4" fill="#FFF4B8"/><circle cx="1.5" cy="-14" r="2.2" fill="#fff"/><circle cx="5.2" cy="-14" r="2.2" fill="#fff"/><circle cx="2.3" cy="-14" r="1" fill="#2B2D5B"/><circle cx="6" cy="-14" r="1" fill="#2B2D5B"/><ellipse cx="-3" cy="-1" rx="3" ry="1.6" fill="${c}"/><ellipse cx="3" cy="-1" rx="3" ry="1.6" fill="${c}"/></g></g>`;
    return g;
  });
  const put = (g, x, y, sc = 1, op = 1, face = 1) => {
    g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${sc.toFixed(3)})`); g.style.opacity = op;
    g.querySelector('.lt-face').setAttribute('transform', `scale(${face} 1)`);
  };
  const idle = (i) => { const [x, y] = P(level.spawn); return [x + (i - (level.k - 1) / 2) * 11, y + (i % 2) * 6 - 2]; };
  const home = (fade) => crew.forEach((g, i) => { put(g, ...idle(i)); if (fade && !rm) g.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: i * 90, easing: OUT }); });

  const bar = mk('lt-bar');
  const tbs = [0, 1, 2, 3].filter((t) => level.avail[t]).map((t) => {
    const b = mk('lt-tb', 'button', bar); b.type = 'button'; b.innerHTML = `<svg viewBox="0 0 28 28">${GLYPH[t]}</svg><span class="lt-dots"></span>`;
    b.addEventListener('pointerdown', () => { sel = t; paint(); snd(t + 2, 0.04, 0, 0.4); });
    return [t, b];
  });
  const go = mk('lt-go', 'button', bar); go.type = 'button'; go.innerHTML = '<svg viewBox="0 0 28 28"><path d="M5 2L25 14L5 26Z" stroke="#2B2D5B" stroke-width="3" stroke-linejoin="round"/></svg>';

  const hud = () => ctx.hud({ moves: h.present.moves, best, tries: h.tries, maxTries: logic.maxTries(), canUndo: h.past.length > 0 });
  const left = (t) => level.avail[t] - h.present.tools.filter((x) => x[1] === t).length;
  function paint() {
    cellG.forEach((g, i) => { g.innerHTML = cellArt(i); });
    if (left(sel) <= 0) sel = [0, 1, 2, 3].find((t) => left(t) > 0) ?? sel;
    tbs.forEach(([t, b]) => {
      b.classList.toggle('cur', t === sel); b.classList.toggle('out', left(t) <= 0);
      b.lastChild.innerHTML = Array.from({ length: level.avail[t] }, (_, k) => `<i class="${k < left(t) ? '' : 'u'}"></i>`).join('');
    });
    const ok = !running && !won ? logic.legalMoves(h.present).filter((m) => m.t === 'place' && m.tool === sel) : [];
    hints.innerHTML = ok.map((m) => { const [x, y] = xy(m.cell); return `<polygon class="lt-hint" points="${rh(x, y, 0.44, h.present.cells[m.cell] === 2 ? WH : 0)}" fill="none" stroke="#fff" stroke-width="2.4" stroke-dasharray="5 4" stroke-linejoin="round"/>`; }).join('');
    go.disabled = running || won;
  }
  function pop(i) { if (!rm) cellG[i].querySelector('.lt-tool')?.animate([{ transform: 'translateY(-16px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 420, easing: SPRING }); }
  function wiggle(i) { if (!rm) cellG[i].animate([{ transform: 'none' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'none' }], { duration: 260 }); snd(0, 0.03, 0, 0.2); }

  function tap(i) {
    if (running || won) return;
    const s = h.present, opts = logic.legalMoves(s).filter((m) => m.t === 'place' && m.cell === i);
    const mv = toolAt(s, i) !== undefined ? { t: 'remove', cell: i } : opts.find((m) => m.tool === sel) || opts[0];
    if (!mv) return wiggle(i);
    h = play(h, logic, mv);
    if (mv.t === 'place') sel = mv.tool;
    snd(mv.t === 'place' ? i + mv.tool : i + 1, 0.08, 0, 0.9);
    paint(); if (mv.t === 'place') pop(i);
    hud();
  }

  // the run: replay the logic's rules to get each walker's path (the logic only returns the count)
  function simulate(s) {
    const eff = s.cells.map((c, i) => (toolAt(s, i) <= 1 ? 0 : c)), blockers = new Set(s.tools.filter((t) => t[1] === 3).map((t) => t[0]));
    return Array.from({ length: s.k }, () => {
      let pos = s.spawn, dir = 1, fate = 'lost', at = null;
      const en = [{ p: pos, d: 1 }];
      for (let step = 0; step < 200 && en.length < 60; step++) {
        const next = pos + dir;
        if (next < 0 || next >= eff.length || eff[next] === 1) { fate = 'fall'; en.push({ p: next }); break; }
        if (eff[next] === 2) { dir = -dir; en.push({ p: pos, d: dir, turn: true }); continue; }
        if (blockers.has(next)) { blockers.delete(next); eff[next] = 2; fate = 'block'; at = next; break; }
        pos = next; en.push({ p: pos, d: dir });
        if (eff[pos] === 3) { fate = 'exit'; break; }
        if (toolAt(s, pos) === 2 && dir === 1) { dir = -1; en.push({ p: pos, d: -1, turn: true }); }
      }
      if (fate === 'lost') en.length = Math.min(en.length, 40);
      const T = rm ? 30 : en.length > 45 ? STEP * 45 / en.length : STEP, tm = [0];
      for (let j = 1; j < en.length; j++) tm[j] = tm[j - 1] + (en[j].turn ? T * 0.55 : T);
      return { en, tm, fate, at, j: 0, done: false };
    });
  }
  function runIt() {
    if (running || won) return;
    h = play(h, logic, { t: 'run' }); hud(); running = true; saved = 0; paint();
    const plans = simulate(h.present), FIN = rm ? 120 : 460, t0 = performance.now();
    const end = Math.max(...plans.map((pl, i) => (rm ? 0 : i * STAG) + pl.tm[pl.tm.length - 1] + FIN)) + 250;
    snd(2, 0.06, 0, 0.6);
    const frame = (now) => {
      const t = now - t0;
      plans.forEach((pl, i) => {
        const tt = t - (rm ? 0 : i * STAG), last = pl.en.length - 1;
        if (tt < 0) return;
        let j = 0; while (j < last && pl.tm[j + 1] <= tt) j++;
        let [x, y] = P(pl.en[j].p), sc = 1, op = 1, face = pl.face || 1, after = 0;
        if (j < last) {
          const u = (tt - pl.tm[j]) / (pl.tm[j + 1] - pl.tm[j]), [nx, ny] = P(pl.en[j + 1].p);
          if (nx !== x) face = nx > x ? 1 : -1;
          const ix = idle(i);
          x += (nx - x) * u; y += (ny - y) * u - (nx !== P(pl.en[j].p)[0] || ny !== P(pl.en[j].p)[1] ? Math.sin(Math.PI * u) * 5 : 0);
          if (j === 0) { x += (ix[0] - P(pl.en[0].p)[0]) * (1 - u); y += (ix[1] - P(pl.en[0].p)[1]) * (1 - u); }
        } else {
          after = Math.min(1, (tt - pl.tm[last]) / FIN);
          if (pl.fate === 'exit') { sc = 1 - after; y -= after * 18; op = 1 - after * 0.5; }
          else if (pl.fate === 'fall') { sc = 1 - after * 0.8; y += after * 26; op = 1 - after; }
          else if (pl.fate === 'block') { sc = 1 - after * 0.12; op = 1 - 0.4 * after; }
          else op = 1 - after;
        }
        pl.face = face;
        if (j !== pl.j) { pl.j = j; if (!i || pl.en[j].turn) snd(j + i * 2, 0.045, 0, 0.5); }
        put(crew[i], x, y, sc, op, face);
        if (after >= 0.5 && !pl.done) { // arrival event
          pl.done = true;
          if (pl.fate === 'exit') { pips[saved]?.classList.add('on'); saved++; sparks(...P(pl.en[last].p), 5, '#FFE27A'); snd(7 + saved * 2, 0.09, 0, 1.4); }
          else if (pl.fate === 'block') { risen.add(pl.at); cellG[pl.at].innerHTML = cellArt(pl.at); if (!rm) cellG[pl.at].animate([{ transform: 'translateY(8px) scaleY(.5)', transformOrigin: '50% 100%' }, { transform: 'none' }], { duration: 450, easing: SPRING }); sparks(...P(pl.at), 5, '#A8E6CF'); snd(-3, 0.08, 0, 0.8); }
          else if (pl.fate === 'fall') snd(-5, 0.05, 0, 0.5);
        }
      });
      if (t < end) raf = requestAnimationFrame(frame); else finish();
    };
    raf = requestAnimationFrame(frame);
  }
  function sparks(x, y, k, col) {
    if (rm) return;
    for (let m = 0; m < k; m++) {
      const c = sv('circle', { cx: x, cy: y - 14, r: 2.4, fill: col }, fx), a = (m / k) * 6.28 + 0.5;
      c.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${Math.cos(a) * 22}px,${Math.sin(a) * 14 - 18}px)`, opacity: 0 }], { duration: 800, easing: 'cubic-bezier(.215,.61,.355,1)' }).onfinish = () => c.remove();
    }
  }
  function finish() {
    running = false;
    if (logic.isSolved(h.present)) return win();
    crew.forEach((g) => { g.style.transition = 'opacity .4s'; g.style.opacity = 0; }); // a failed run only fades; the crew comes back to try again
    later(() => { saved = 0; pips.forEach((p) => p.classList.remove('on')); risen.clear(); crew.forEach((g) => { g.style.transition = ''; }); home(true); paint(); }, rm ? 80 : 650);
  }
  function win() {
    won = true; paint();
    const e = h.present.cells.indexOf(3), [x, y] = P(e);
    root.classList.add('lt-won');
    [0, 2, 4, 7, 9, 12].forEach((k, m) => snd(k, 0.07, m * 0.09, 1.6));
    sparks(x, y, 14, '#FFE27A'); sparks(x, y, 10, '#E8A0BF');
    if (!rm) { const r = sv('polygon', { points: rh(x, y, 0.3), fill: 'none', stroke: '#FFE27A', 'stroke-width': 3 }, fx); r.style.transformOrigin = `${x}px ${y}px`; r.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(3.4)', opacity: 0 }], { duration: 1100, easing: 'ease-out' }).onfinish = () => r.remove(); }
    later(() => ctx.solved({ score: logic.score(h.present) }), 700);
  }

  function settle() {
    cancelAnimationFrame(raf); for (const t of timers) clearTimeout(t); timers.clear();
    running = won = false; saved = 0; risen.clear(); root.classList.remove('lt-won'); fx.textContent = '';
    pips.forEach((p) => p.classList.remove('on')); crew.forEach((g) => { g.style.transition = ''; }); home(false); paint(); hud();
  }

  // dragging the empty sky tilts the diorama and it springs back
  let drag = null;
  const tilt = (e) => { if (drag) { stage.style.setProperty('--ry', Math.max(-14, Math.min(14, (e.clientX - drag[0]) / 8))); stage.style.setProperty('--rx', Math.max(-10, Math.min(10, (drag[1] - e.clientY) / 10))); } };
  const rel = () => { if (!drag) return; drag = null; root.classList.add('lt-rel'); stage.style.setProperty('--ry', 0); stage.style.setProperty('--rx', 0); };
  const down = (e) => {
    audio();
    const g = e.target.closest?.('.lt-c');
    if (g) { tap(+g.dataset.i); return; }
    if (!rm && !e.target.closest('button')) { drag = [e.clientX, e.clientY]; root.classList.remove('lt-rel'); }
  };
  go.addEventListener('pointerdown', runIt);
  root.addEventListener('pointerdown', down); root.addEventListener('pointermove', tilt);
  for (const ev of ['pointerup', 'pointercancel']) root.addEventListener(ev, rel);

  home(false); paint(); hud();
  if (!rm) { floor.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 700, easing: 'cubic-bezier(.215,.61,.355,1)' }); }

  return {
    undo() { h = undo(h, logic.maxTries()); settle(); },
    reset() { h = reset(h, logic.maxTries()); sel = 0; settle(); },
    destroy() {
      cancelAnimationFrame(raf); for (const t of timers) clearTimeout(t); timers.clear();
      root.removeEventListener('pointerdown', down); root.removeEventListener('pointermove', tilt);
      for (const ev of ['pointerup', 'pointercancel']) root.removeEventListener(ev, rel);
      ac?.close?.(); ac = undefined;
      root.textContent = ''; root.classList.remove('g-lemmings-tools', 'lt-m', 'lt-won', 'lt-rel');
    },
  };
}
