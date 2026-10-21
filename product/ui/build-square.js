import * as logic from '../logic/build-square.js';
import { newHistory, play, undo, reset } from '../logic/history.js';

// Build the Square: sleepy wooden toy blocks. Pick a block from the tray, spin it with the wooden button, drop it
// into the carved outline. It wakes up, bounces, and snugs in. Tap a placed block to send it home. Locked blocks stay.
const URI = (s) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
const GRAIN = URI('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .29  0 0 0 0 .17  0 0 0 0 .16  0 0 0 .15 0"/></filter><rect width="160" height="160" filter="url(#n)"/></svg>');
const CLOUDS = URI('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260"><g fill="#fff" fill-opacity=".6"><path d="M30 60h100a22 22 0 0 0-10-32 28 28 0 0 0-50-6 24 24 0 0 0-40 38z"/><path d="M230 200h120a20 20 0 0 0-6-30 26 26 0 0 0-48-4 22 22 0 0 0-66 34z"/></g></svg>');
const HILLS = URI('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="120"><path d="M0 70C80 24 170 30 210 58S330 90 400 70V120H0Z" fill="#9BD98A" fill-opacity=".7"/><path d="M0 96C90 64 170 106 260 88S350 76 400 96V120H0Z" fill="#6BBF59" fill-opacity=".65"/><g fill="#FF8FB1"><circle cx="60" cy="100" r="4"/><circle cx="210" cy="106" r="4"/><circle cx="330" cy="98" r="4"/></g></svg>');
const TOYS = URI('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><g fill-opacity=".7"><rect x="30" y="40" width="14" height="14" rx="4" fill="#F4623A" transform="rotate(20 37 47)"/><circle cx="200" cy="30" r="7" fill="#FFC857"/><rect x="120" y="160" width="12" height="12" rx="3" fill="#7FC8F8" transform="rotate(-18 126 166)"/><circle cx="250" cy="220" r="9" fill="#B79CED"/><circle cx="55" cy="250" r="6" fill="#6BBF59"/></g></svg>');
const STARS = URI('<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260"><g fill="#FFF3E0"><circle cx="20" cy="30" r="1.6"/><circle cx="90" cy="70" r="1"/><circle cx="150" cy="20" r="1.8"/><circle cx="210" cy="90" r="1.2"/><circle cx="60" cy="150" r="1.2"/><circle cx="130" cy="130" r="1.6"/><circle cx="235" cy="170" r="1"/><circle cx="30" cy="225" r="1.8"/><circle cx="170" cy="215" r="1.2"/></g></svg>');

export const css = `
.g-build-square { --bs-s1:#BFE6FF; --bs-s2:#FFF0D6; --bs-wood:#EBA45C; --bs-cav:#F6DDB0; --bs-cav2:#EBCB93; --bs-day:1; --bs-night:0;
  position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; min-height: 420px;
  background: ${GRAIN}, linear-gradient(180deg, var(--bs-s1), var(--bs-s2)); touch-action: none; user-select: none; -webkit-user-select: none; }
@media (prefers-color-scheme: dark) { .g-build-square { --bs-s1:#1B2150; --bs-s2:#6A3F78; --bs-wood:#8A5A30; --bs-cav:#4A3550; --bs-cav2:#3E2C46; --bs-day:0; --bs-night:1; } }
.g-build-square .bs-l { position: absolute; inset: 0; pointer-events: none; background-repeat: repeat; }
.g-build-square .bs-l1 { background-image: ${CLOUDS}; background-size: 400px 260px; opacity: var(--bs-day); animation: bs-d1 100s linear infinite; }
.g-build-square .bs-l2 { background-image: ${TOYS}; background-size: 300px 300px; animation: bs-d2 150s linear infinite reverse, bs-fl 3.6s ease-in-out infinite; }
.g-build-square .bs-l3 { background-image: ${HILLS}; background-size: 400px 120px; background-position: 0 100%; background-repeat: repeat-x; animation: bs-d3 220s linear infinite; }
.g-build-square .bs-l4 { background-image: ${STARS}; background-size: 260px 260px; opacity: var(--bs-night); animation: bs-tw 4s ease-in-out infinite; }
@keyframes bs-d1 { to { background-position: 400px 0; } } @keyframes bs-d2 { to { background-position: 300px 0; } } @keyframes bs-d3 { to { background-position: 400px 100%; } }
@keyframes bs-fl { 50% { opacity: .5; } } @keyframes bs-tw { 50% { opacity: calc(var(--bs-night) * .5); } }
@media (prefers-color-scheme: dark) { .g-build-square .bs-l3 { filter: brightness(.3) saturate(.6) hue-rotate(-30deg); } .g-build-square .bs-l2 { opacity: .5; } }
.g-build-square svg.bs-main { position: relative; width: 100%; max-width: 520px; height: auto; display: block; touch-action: none; }
.g-build-square .bs-pc { cursor: grab; }
.g-build-square .bs-pc.bs-anim { transition: transform .42s cubic-bezier(.34,1.56,.64,1); }
.g-build-square .bs-pc.bs-grab { transition: transform .12s ease-out; }
.g-build-square .bs-pc.bs-fix { cursor: not-allowed; filter: brightness(.86) saturate(.8); }
.g-build-square .bs-pc.bs-fix .bs-open { display: none; } .g-build-square .bs-pc.bs-fix .bs-shut { display: inline; }
.g-build-square .bs-body { transform-box: fill-box; transform-origin: center; }
.g-build-square .bs-tray .bs-body { animation: bs-breathe 3.4s ease-in-out infinite; }
@keyframes bs-breathe { 50% { transform: scale(1.04, .97); } }
.g-build-square .bs-open { display: none; } .g-build-square .bs-aw .bs-open { display: inline; } .g-build-square .bs-aw .bs-shut { display: none; }
.g-build-square .bs-eye { transform-box: fill-box; transform-origin: center; animation: bs-blink 4.5s infinite; }
@keyframes bs-blink { 0%,94%,100% { transform: scaleY(1); } 97% { transform: scaleY(.1); } }
.g-build-square .bs-halo { transition: transform .3s cubic-bezier(.34,1.56,.64,1), opacity .2s; animation: bs-pulse 1.6s ease-in-out infinite; }
@keyframes bs-pulse { 50% { opacity: .55; } }
.g-build-square .bs-rot { cursor: pointer; transition: transform .2s cubic-bezier(.34,1.56,.64,1); transform-box: fill-box; transform-origin: center; }
.g-build-square .bs-rot:active { transform: scale(.9); }
.g-build-square .bs-hl { pointer-events: none; }
.g-build-square.bs-still *, .g-build-square.bs-still .bs-pc { animation: none !important; transition: none !important; }
`;

const COLS = ['#F4623A', '#FFB26B', '#FFC857', '#6BBF59', '#7FC8F8', '#B79CED', '#FF8FB1', '#2EC4B6', '#D9A066']; // strawberry, orange, lemon, lime, blueberry, grape, peach, mint, nut
const PAT = [ // 22 x 22 tile marks, one per block, so colour is never the only cue
  '<circle cx="6" cy="6" r="2.6"/><circle cx="17" cy="17" r="2.6"/>', '<path d="M0 6H22M0 17H22" stroke-width="3.2"/>', '<path d="M0 22L22 0M-6 6L6 -6M16 28L28 16" stroke-width="3"/>',
  '<rect x="0" y="0" width="11" height="11"/><rect x="11" y="11" width="11" height="11"/>', '<path d="M0 6q5.5 -5 11 0t11 0M0 17q5.5 -5 11 0t11 0" stroke-width="2.6"/>',
  '<path d="M6 1v10M1 6h10M17 12v10M12 17h10" stroke-width="3"/>', '<path d="M0 5l5.5 6 5.5-6 5.5 6 5.5-6M0 16l5.5 6 5.5-6 5.5 6 5.5-6" stroke-width="2.4"/>',
  '<circle cx="6" cy="6" r="4" stroke-width="2.4"/><circle cx="17" cy="17" r="4" stroke-width="2.4"/>', '<path d="M6 0l3.5 6-3.5 6-3.5-6zM17 10l3.5 6-3.5 6-3.5-6z"/>',
];
const BROWN = '#4A2C2A', NS = 'http://www.w3.org/2000/svg', V = 400, LIFT = 46;
const E = (t, a = {}, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); p && p.appendChild(e); return e; };
const norm = (c) => { const r0 = Math.min(...c.map((p) => p[0])), c0 = Math.min(...c.map((p) => p[1])); return c.map(([r, q]) => [r - r0, q - c0]).sort((a, b) => a[0] - b[0] || a[1] - b[1]); };
const spin = (c, k) => { for (let i = 0; i < k; i++) c = norm(c.map(([r, q]) => [q, -r])); return c; };
const dims = (c) => [Math.max(...c.map((p) => p[1])) + 1, Math.max(...c.map((p) => p[0])) + 1]; // [cols, rows]
// rounded-cell path: a corner is round only when neither touching side has a neighbour, so joined cells fuse into one block
const rp = (x, y, s, [a, b, c, d], r) => `M${x + (a ? r : 0)} ${y}H${x + s - (b ? r : 0)}${b ? `a${r} ${r} 0 0 1 ${r} ${r}` : ''}V${y + s - (c ? r : 0)}${c ? `a${r} ${r} 0 0 1 -${r} ${r}` : ''}H${x + (d ? r : 0)}${d ? `a${r} ${r} 0 0 1 -${r} -${r}` : ''}V${y + (a ? r : 0)}${a ? `a${r} ${r} 0 0 1 ${r} -${r}` : ''}Z`;
const HEART = 'M0 4C-8 -2 -4 -8 0 -3C4 -8 8 -2 0 4Z';

export function mount(root, ctx) {
  root.classList.add('g-build-square');
  const level = logic.makeLevel(ctx.level), best = logic.bestScore(level);
  let h = newHistory(logic.initialState(level));
  const N = h.initial.shapes.length, rows = level.board.length, cols = level.board[0].length;
  const S = Math.min(Math.floor(344 / cols), 56), bx = (V - cols * S) / 2, by = 30;
  const tray = [...Array(N).keys()].filter((i) => !h.initial.fixed[i]), T = tray.length;
  const trayY = by + rows * S + 30 + 64, stripY = by + rows * S + 30, H = trayY + Math.ceil(T / 5) * 80 + 12;
  const rot = Array.from({ length: N }, (_, i) => (i * 5 + 1) % 4);
  let sel = tray[0] ?? null, won = false, drag = null, ac = null;
  const timers = new Set(), anims = [];
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
  const blip = (f0, f1, dur, gain, type = 'sine', at = 0) => {
    if (!ac) return;
    const t = ac.currentTime + at, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + 0.05);
  };
  const unlock = () => { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { ac = null; } } if (ac && ac.state === 'suspended') ac.resume(); };
  const SND = { pick: () => blip(520, 700, 0.07, 0.05, 'triangle'), spin: () => blip(380, 560, 0.06, 0.04, 'square'), tok: () => { blip(240, 90, 0.14, 0.12, 'triangle'); blip(900, 500, 0.05, 0.03, 'square'); }, back: () => blip(300, 200, 0.12, 0.05), no: () => { blip(180, 140, 0.1, 0.06, 'triangle'); blip(150, 120, 0.1, 0.06, 'triangle', 0.09); } };
  const still = ctx.reduceMotion;

  root.textContent = '';
  if (still) root.classList.add('bs-still');
  else for (const c of ['bs-l4', 'bs-l1', 'bs-l2', 'bs-l3']) { const d = document.createElement('div'); d.className = 'bs-l ' + c; root.appendChild(d); }
  const svg = E('svg', { viewBox: `0 0 ${V} ${H}`, class: 'bs-main' });
  root.appendChild(svg);
  const defs = E('defs', {}, svg);
  defs.innerHTML = `<linearGradient id="bs-sh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#4A2C2A" stop-opacity=".25"/></linearGradient>` +
    PAT.map((p, i) => `<pattern id="bs-p${i}" width="22" height="22" patternUnits="userSpaceOnUse"><g fill="${BROWN}" fill-opacity=".3" stroke="${BROWN}" stroke-opacity=".3" stroke-linecap="round">${p}</g></pattern>`).join('');

  // carved board: wood frame follows the outline (square or pyramid), dark cavity, soft checker
  const cellsOn = []; level.board.forEach((row, r) => row.forEach((v, c) => v && cellsOn.push([r, c])));
  const on = (r, c) => level.board[r]?.[c] === 1;
  const union = (attrs, dx = 0, dy = 0) => cellsOn.map(([r, c]) => `<rect x="${bx + c * S + dx}" y="${by + r * S + dy}" width="${S}" height="${S}" ${attrs}/>`).join('');
  const board = E('g', {}, svg);
  board.innerHTML = `<g transform="translate(5 7)" opacity=".3">${union(`fill="${BROWN}" stroke="${BROWN}" stroke-width="30" stroke-linejoin="round"`)}</g>` +
    union(`fill="${BROWN}" stroke="${BROWN}" stroke-width="30" stroke-linejoin="round"`) + union(`style="fill:var(--bs-wood);stroke:var(--bs-wood)" stroke-width="24" stroke-linejoin="round"`) +
    union(`style="fill:var(--bs-cav)"`) + cellsOn.filter(([r, c]) => (r + c) % 2).map(([r, c]) => `<rect x="${bx + c * S}" y="${by + r * S}" width="${S}" height="${S}" style="fill:var(--bs-cav2)" fill-opacity=".7"/>`).join('') +
    `<g fill="none" stroke="${BROWN}" stroke-opacity=".28" stroke-width="2" stroke-linecap="round">${cellsOn.map(([r, c]) => (on(r - 1, c) ? '' : `<path d="M${bx + c * S} ${by + r * S}h${S}"/>`) + (on(r, c - 1) ? '' : `<path d="M${bx + c * S} ${by + r * S}v${S}"/>`) + (on(r + 1, c) ? '' : `<path d="M${bx + c * S} ${by + (r + 1) * S}h${S}"/>`) + (on(r, c + 1) ? '' : `<path d="M${bx + (c + 1) * S} ${by + r * S}v${S}"/>`)).join('')}</g>`;
  const hit = E('rect', { x: bx - 14, y: by - 14, width: cols * S + 28, height: rows * S + 28, fill: 'transparent' }, svg);
  const hl = E('g', { class: 'bs-hl' }, svg);

  // tray: a wooden shelf with a dent per block
  const shelf = E('g', {}, svg);
  const slot = (t) => { const row = Math.floor(t / 5), n = Math.min(5, T - row * 5); return [(V - n * 76) / 2 + (t % 5) * 76 + 38, trayY + row * 80 + 38]; };
  shelf.innerHTML = `<rect x="10" y="${trayY - 8}" width="380" height="${Math.ceil(T / 5) * 80 + 6}" rx="18" style="fill:var(--bs-wood)" stroke="${BROWN}" stroke-width="3"/>` +
    tray.map((_, t) => { const [x, y] = slot(t); return `<rect x="${x - 33}" y="${y - 33}" width="66" height="66" rx="14" fill="${BROWN}" fill-opacity=".2" stroke="${BROWN}" stroke-opacity=".35" stroke-width="2" stroke-dasharray="5 5"/>`; }).join('');
  const halo = E('rect', { width: 72, height: 72, rx: 16, fill: '#FFC857', 'fill-opacity': '.65', stroke: BROWN, 'stroke-width': 3, class: 'bs-halo' }, shelf);
  const layer = E('g', {}, svg), top = E('g', { 'pointer-events': 'none' }, svg); // top holds the lifted copy while dragging

  // rotate button
  const rb = E('g', { class: 'bs-rot', transform: `translate(${V / 2} ${stripY + 28})` }, svg);
  rb.innerHTML = `<circle r="27" fill="${BROWN}" fill-opacity=".3" cy="4"/><circle r="26" style="fill:var(--bs-wood)" stroke="${BROWN}" stroke-width="3"/><circle r="19" fill="#FFF3E0" fill-opacity=".35"/><path d="M-10 -3A11 11 0 1 1 -4 9" fill="none" stroke="${BROWN}" stroke-width="4" stroke-linecap="round"/><path d="M-17 -3L-9 -11L-3 -2Z" fill="${BROWN}" stroke="${BROWN}" stroke-width="2" stroke-linejoin="round"/>`;

  const pc = [];
  tray.forEach((i, t) => { const [x, y] = slot(t); E('rect', { x: x - 36, y: y - 36, width: 72, height: 72, fill: 'transparent' }, svg).addEventListener('pointerdown', (e) => down(e, i, true)); }); // whole slot is the tap target, however thin the block
  const orient = (i) => spin(h.present.shapes[i], rot[i]);
  const cellsOf = (i) => (h.present.placed[i] ? norm(h.present.placed[i]) : orient(i));
  const build = (i, cells) => {
    const set = new Set(cells.map(([r, c]) => r * 10 + c)), has = (r, c) => set.has(r * 10 + c), fx = h.present.fixed[i], col = COLS[i % COLS.length];
    const ps = cells.map(([r, c]) => rp(c * S, r * S, S, [!has(r - 1, c) && !has(r, c - 1), !has(r - 1, c) && !has(r, c + 1), !has(r + 1, c) && !has(r, c + 1), !has(r + 1, c) && !has(r, c - 1)], S * 0.22));
    const all = (a) => ps.map((d) => `<path d="${d}" ${a}/>`).join('');
    const ol = `fill="${BROWN}" stroke="${BROWN}" stroke-width="6" stroke-linejoin="round"`;
    const cx = cells.reduce((s, p) => s + p[1] + 0.5, 0) / cells.length, cy = cells.reduce((s, p) => s + p[0] + 0.5, 0) / cells.length;
    const byD = [...cells].sort((a, b) => Math.hypot(a[1] + 0.5 - cx, a[0] + 0.5 - cy) - Math.hypot(b[1] + 0.5 - cx, b[0] + 0.5 - cy));
    const [fr, fc] = byD[0], [lr, lc] = byD[byD.length - 1], fX = (fc + 0.5) * S, fY = (fr + 0.5) * S, u = S / 40;
    const hi = cells.filter(([r, c]) => !has(r - 1, c)).map(([r, c]) => `<rect x="${c * S + S * 0.16}" y="${r * S + 5}" width="${S * 0.42}" height="4" rx="2" fill="#fff" fill-opacity=".6"/>`).join('');
    const face = `<g transform="translate(${fX} ${fY}) scale(${u})"><circle cx="-11" cy="5" r="4" fill="#FF8FB1" fill-opacity=".7"/><circle cx="11" cy="5" r="4" fill="#FF8FB1" fill-opacity=".7"/>` +
      `<g class="bs-shut" fill="none" stroke="${BROWN}" stroke-width="2.4" stroke-linecap="round"><path d="M-12 -3q4 4 8 0M4 -3q4 4 8 0"/><ellipse cx="0" cy="8" rx="2.6" ry="2.2" fill="${BROWN}" fill-opacity=".5" stroke="none"/></g>` +
      `<g class="bs-open"><g class="bs-eye"><circle cx="-8" cy="-3" r="4.6" fill="#fff" stroke="${BROWN}" stroke-width="1.5"/><circle cx="-7.5" cy="-2.5" r="2.4" fill="${BROWN}"/><circle cx="8" cy="-3" r="4.6" fill="#fff" stroke="${BROWN}" stroke-width="1.5"/><circle cx="8.5" cy="-2.5" r="2.4" fill="${BROWN}"/></g><path d="M-4 6q4 5 8 0" fill="none" stroke="${BROWN}" stroke-width="2.2" stroke-linecap="round"/></g></g>`;
    const lock = fx ? `<g transform="translate(${(lc + 0.5) * S} ${(lr + 0.5) * S}) scale(${u})"><path d="M-6 -3V-8a6 6 0 0 1 12 0V-3" fill="none" stroke="${BROWN}" stroke-width="3.4"/><rect x="-9" y="-4" width="18" height="14" rx="4" fill="#FFC857" stroke="${BROWN}" stroke-width="2.4"/><circle cy="3" r="2" fill="${BROWN}"/></g>` : '';
    const [w, hh] = dims(cells);
    const rivets = fx ? [[4, 4], [w * S - 4, 4], [4, hh * S - 4], [w * S - 4, hh * S - 4]].map(([x, y]) => (cells.some(([r, c]) => x > c * S && x < (c + 1) * S && y > r * S && y < (r + 1) * S) ? `<circle cx="${x}" cy="${y}" r="2.4" fill="#fff" fill-opacity=".7" stroke="${BROWN}"/>` : '')).join('') : '';
    return `<g class="bs-body"><g transform="translate(0 5)">${all(ol.replace(`fill="${BROWN}"`, 'fill="#8A5A44"'))}</g>${all(ol)}${all(`fill="${col}"`)}${all(`fill="url(#bs-p${i % PAT.length})"`)}${all('fill="url(#bs-sh)"')}${hi}${rivets}${face}${lock}</g>`;
  };
  tray.concat(Object.keys(h.present.fixed).map(Number).filter((i) => h.present.fixed[i])).forEach((i) => {
    const g = E('g', { class: 'bs-pc bs-anim', 'data-i': i }, layer);
    pc[i] = { g, key: '' };
    g.addEventListener('pointerdown', (e) => down(e, i));
  });
  const ensure = (i) => {
    const cells = cellsOf(i), key = JSON.stringify(cells);
    if (pc[i].key === key) return;
    pc[i].key = key; pc[i].g.innerHTML = build(i, cells);
  };
  const put = (i, x, y, k) => { pc[i].g.style.transform = `translate(${x}px, ${y}px) scale(${k})`; };
  const layout = () => {
    const p = h.present;
    pc.forEach((o, i) => {
      if (!o) return;
      if (p.placed[i]) for (let k = 0; k < 4; k++) if (JSON.stringify(spin(p.shapes[i], k)) === JSON.stringify(norm(p.placed[i]))) rot[i] = k;
      ensure(i);
      o.g.classList.toggle('bs-aw', !!p.placed[i]);
      o.g.classList.toggle('bs-fix', !!p.fixed[i]);
      o.g.classList.toggle('bs-tray', !p.placed[i]);
      if (drag && drag.moved && drag.i === i) return;
      if (p.placed[i]) { const r0 = Math.min(...p.placed[i].map((q) => q[0])), c0 = Math.min(...p.placed[i].map((q) => q[1])); put(i, bx + c0 * S, by + r0 * S, 1); return; }
      const [w, hh] = dims(orient(i)), k = Math.min(24, 64 / Math.max(w, hh)) / S, [sx, sy] = slot(tray.indexOf(i)), lift = sel === i ? 1.1 : 1;
      put(i, sx - (w * S * k * lift) / 2, sy - (hh * S * k * lift) / 2, k * lift);
    });
    if (sel !== null && !h.present.placed[sel]) { const [sx, sy] = slot(tray.indexOf(sel)); halo.style.transform = `translate(${sx - 36}px, ${sy - 36}px)`; halo.style.opacity = ''; } else halo.style.opacity = 0;
    rb.style.opacity = sel === null ? 0.45 : 1;
  };
  const hud = () => ctx.hud({ moves: h.present.moves, best, tries: h.tries, maxTries: logic.maxTries(), canUndo: h.past.length > 0 });
  const pt = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const q = p.matrixTransform(svg.getScreenCTM().inverse()); return [q.x, q.y]; };
  const nextSel = (from) => { const left = tray.filter((i) => !h.present.placed[i]); sel = left.length ? (left.find((i) => i > from) ?? left[0]) : null; };
  const anim = (el, kf, o) => { if (still) return; const a = el.animate(kf, o); anims.push(a); return a; };
  const fall = (n, x, y, fill, spread) => { // little hearts and crumbs
    if (still) return;
    for (let k = 0; k < n; k++) {
      const p = E('path', { d: HEART, fill: fill[k % fill.length], stroke: BROWN, 'stroke-width': 1.2, 'stroke-linejoin': 'round' }, svg), a = (k / n) * 6.28, v = spread * (0.6 + (k % 3) * 0.25);
      const an = p.animate([{ transform: `translate(${x}px, ${y}px) scale(0)`, opacity: 1 }, { transform: `translate(${x + Math.cos(a) * v}px, ${y + Math.sin(a) * v - 24}px) scale(1.1) rotate(${k % 2 ? 20 : -20}deg)`, opacity: 1, offset: 0.5 }, { transform: `translate(${x + Math.cos(a) * v * 1.2}px, ${y + Math.sin(a) * v - 60}px) scale(.6)`, opacity: 0 }], { duration: 900 + (k % 4) * 90, delay: k * 20, easing: 'cubic-bezier(.215,.61,.355,1)', fill: 'both' });
      an.onfinish = () => p.remove();
    }
  };
  const hug = (i) => anim(pc[i].g.firstChild, [{ transform: 'none' }, { transform: 'scale(1.1,.9)', offset: 0.3 }, { transform: 'scale(.95,1.06)', offset: 0.6 }, { transform: 'none' }], { duration: 480, easing: 'ease-out' });

  function commit(m, i) {
    h = play(h, logic, m);
    if (m.t === 'place') {
      SND.tok(); ctx.sound.move(i);
      const cs = m.cells, cx = bx + (cs.reduce((s, q) => s + q[1] + 0.5, 0) / cs.length) * S, cy = by + (cs.reduce((s, q) => s + q[0] + 0.5, 0) / cs.length) * S;
      nextSel(i); layout(); hug(i);
      if (!still) for (let k = 0; k < 3; k++) { const d = E('circle', { cx: cx + (k - 1) * S * 0.7, cy: cy + S * 0.6, r: 4, fill: '#FFF3E0', stroke: BROWN, 'stroke-width': 1.2, 'stroke-opacity': '.5' }, svg); const a = d.animate([{ transform: 'none', opacity: 0.9 }, { transform: `translate(${(k - 1) * 10}px, -6px) scale(1.8)`, opacity: 0 }], { duration: 480, delay: 120, easing: 'ease-out', fill: 'both' }); a.onfinish = () => d.remove(); }
    } else { SND.back(); ctx.sound.move(i + 2); sel = i; layout(); }
    hud();
    if (logic.isSolved(h.present)) win();
  }
  const place = (i, r0, c0) => {
    const m = { t: 'place', i, cells: orient(i).map(([r, c]) => [r + r0, c + c0]) };
    if (!logic.applyMove(h.present, m)) return false;
    commit(m, i); return true;
  };
  const shake = (i) => { SND.no(); anim(pc[i].g.firstChild, [{ transform: 'none' }, { transform: 'translateX(-5px) rotate(-4deg)' }, { transform: 'translateX(5px) rotate(4deg)' }, { transform: 'none' }], { duration: 300, easing: 'ease-out' }); };
  const rotate = (i) => {
    if (i === null || won || h.present.placed[i]) return;
    SND.spin(); rot[i] = (rot[i] + 1) % 4; ensure(i); layout();
    anim(pc[i].g.firstChild, [{ transform: 'rotate(-90deg) scale(.9)' }, { transform: 'rotate(8deg) scale(1.06)', offset: 0.7 }, { transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.34,1.56,.64,1)' });
    if (drag && drag.moved && drag.i === i) { drag.gh.innerHTML = pc[i].g.innerHTML; ghost(drag.x, drag.y); }
  };
  const target = (i, x, y) => { const [w, hh] = dims(orient(i)), tx = x - (w * S) / 2, ty = y - (hh * S) / 2 - (drag.touch ? LIFT : 0); return { tx, ty, r0: Math.round((ty - by) / S), c0: Math.round((tx - bx) / S) }; };
  function ghost(x, y) {
    const t = target(drag.i, x, y);
    drag.gh.style.transform = `translate(${t.tx}px, ${t.ty}px) scale(1)`;
    const m = { t: 'place', i: drag.i, cells: orient(drag.i).map(([r, c]) => [r + t.r0, c + t.c0]) };
    drag.ok = !!logic.applyMove(h.present, m); drag.t = t;
    hl.innerHTML = drag.ok ? m.cells.map(([r, c]) => `<rect x="${bx + c * S + 2}" y="${by + r * S + 2}" width="${S - 4}" height="${S - 4}" rx="8" fill="#FFC857" fill-opacity=".6" stroke="${BROWN}" stroke-width="2.5" stroke-dasharray="6 5"/>`).join('') : '';
  }
  function down(e, i, fromSlot) {
    if (won || drag || (fromSlot && h.present.placed[i]) || (e.pointerType === 'mouse' && e.button !== 0)) return;
    unlock();
    const [x, y] = pt(e), g = pc[i].g;
    if (h.present.fixed[i]) { shake(i); return; }
    drag = { i, id: e.pointerId, x0: x, y0: y, x, y, moved: false, placed: !!h.present.placed[i], was: sel === i, touch: e.pointerType === 'touch' };
    if (!drag.placed && sel !== i) { sel = i; SND.pick(); layout(); }
    try { g.setPointerCapture(e.pointerId); } catch (_) {}
    g.addEventListener('pointermove', move); g.addEventListener('pointerup', up); g.addEventListener('pointercancel', up);
    e.preventDefault();
  }
  function move(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const [x, y] = pt(e); drag.x = x; drag.y = y;
    if (drag.placed || (!drag.moved && Math.hypot(x - drag.x0, y - drag.y0) < 7)) return;
    const g = pc[drag.i].g;
    if (!drag.moved) { // a lifted copy rides on top; the real block waits (moving it in the DOM would drop the touch)
      drag.moved = true; SND.pick();
      const gh = g.cloneNode(true); gh.setAttribute('class', 'bs-pc bs-grab bs-aw'); gh.style.transform = g.style.transform; top.appendChild(gh); gh.getBoundingClientRect(); drag.gh = gh;
      g.style.visibility = 'hidden'; g.classList.remove('bs-anim');
    }
    ghost(x, y);
  }
  function up(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag, g = pc[d.i].g;
    g.removeEventListener('pointermove', move); g.removeEventListener('pointerup', up); g.removeEventListener('pointercancel', up);
    drag = null; hl.innerHTML = '';
    if (d.gh) { g.style.transform = d.gh.style.transform; g.getBoundingClientRect(); g.style.visibility = ''; d.gh.remove(); }
    if (!still) g.classList.add('bs-anim');
    if (d.placed) { if (e.type === 'pointerup' && Math.hypot(d.x - d.x0, d.y - d.y0) < 14) commit({ t: 'remove', i: d.i }, d.i); return; }
    if (!d.moved) { if (d.was && e.type === 'pointerup') rotate(d.i); else layout(); return; }
    if (e.type === 'pointerup' && d.ok && place(d.i, d.t.r0, d.t.c0)) return;
    if (e.type === 'pointerup') SND.back();
    layout();
  }
  hit.addEventListener('pointerdown', (e) => { // tap a spot: the picked block goes there
    if (won || drag || sel === null) return;
    unlock();
    const [x, y] = pt(e), r = Math.floor((y - by) / S), c = Math.floor((x - bx) / S), oc = orient(sel), [w, hh] = dims(oc);
    const mid = [...oc].sort((a, b) => Math.hypot(a[0] + 0.5 - hh / 2, a[1] + 0.5 - w / 2) - Math.hypot(b[0] + 0.5 - hh / 2, b[1] + 0.5 - w / 2))[0];
    if (!place(sel, r - mid[0], c - mid[1])) shake(sel);
  });
  rb.addEventListener('pointerdown', (e) => { unlock(); rotate(sel); e.preventDefault(); });

  function win() {
    won = true;
    later(() => {
      ctx.sound.win();
      pc.forEach((o, i) => o && hug(i));
      const bxm = bx + (cols * S) / 2, bym = by + (rows * S) / 2;
      fall(18, bxm, bym, ['#F4623A', '#FF8FB1', '#FFC857'], Math.max(cols, rows) * S * 0.55);
      anim(board, [{ transform: 'none' }, { transform: 'translateY(-5px)', offset: 0.3 }, { transform: 'none' }], { duration: 420, easing: 'ease-out' });
      blip(523, 523, 0.2, 0.05, 'triangle'); blip(659, 659, 0.2, 0.05, 'triangle', 0.1); blip(784, 784, 0.4, 0.05, 'triangle', 0.2);
    }, 330);
    later(() => ctx.solved({ score: logic.score(h.present) }), 700);
  }
  const settle = () => {
    for (const t of timers) clearTimeout(t);
    timers.clear(); anims.splice(0).forEach((a) => a.cancel());
    won = false; drag = null; hl.innerHTML = ''; top.textContent = '';
    nextSel(-1); if (sel === null || h.present.placed[sel]) sel = tray.find((i) => !h.present.placed[i]) ?? null;
    layout(); hud();
  };

  layout(); hud();
  if (still) pc.forEach((o) => o && o.g.classList.remove('bs-anim'));

  return {
    undo() { if (drag) return; h = undo(h, logic.maxTries()); settle(); },
    reset() { if (drag) return; h = reset(h, logic.maxTries()); settle(); },
    destroy() {
      for (const t of timers) clearTimeout(t);
      timers.clear(); drag = null;
      if (ac) { try { ac.close(); } catch (_) {} ac = null; }
      root.textContent = '';
      root.classList.remove('g-build-square', 'bs-still');
    },
  };
}
