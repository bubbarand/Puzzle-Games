import * as logic from '../logic/pentomino-5x5.js';
import { newHistory, play, undo, reset } from '../logic/history.js';

// Pentomino 5x5: chunky glossy candy tiles on a baking tray. Pick a candy, spin it with the round button, drop it into the tray.
// It sparkles and clicks in. Tap a placed candy to take it back. Chocolate candies are locked in and cannot move.
const URI = (s) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
const GRAIN = URI('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .29  0 0 0 0 .17  0 0 0 0 .16  0 0 0 .15 0"/></filter><rect width="160" height="160" filter="url(#n)"/></svg>');
const SPRINK = URI('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><g stroke-linecap="round" stroke-width="6" fill="none" stroke-opacity=".75"><path d="M30 40l10 -6" stroke="#F4623A"/><path d="M200 30l9 7" stroke="#7FC8F8"/><path d="M120 160l10 4" stroke="#6BBF59"/><path d="M250 220l-8 8" stroke="#FFC857"/><path d="M55 250l8 -9" stroke="#B79CED"/><path d="M270 90l5 -10" stroke="#FF8FB1"/></g></svg>');
const BUBBLES = URI('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260"><g fill="#fff" fill-opacity=".5"><circle cx="50" cy="60" r="22"/><circle cx="44" cy="54" r="6" fill-opacity=".8"/><circle cx="300" cy="170" r="30"/><circle cx="291" cy="161" r="8" fill-opacity=".8"/><circle cx="190" cy="220" r="14"/></g></svg>');
const AWNING = URI('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="60"><path d="M0 0H400V30a25 25 0 0 1-50 0a25 25 0 0 1-50 0a25 25 0 0 1-50 0a25 25 0 0 1-50 0a25 25 0 0 1-50 0a25 25 0 0 1-50 0a25 25 0 0 1-50 0a25 25 0 0 1-50 0Z" fill="#FF8FB1" fill-opacity=".8"/><path d="M50 0H100V30a25 25 0 0 1-50 0ZM150 0H200V30a25 25 0 0 1-50 0ZM250 0H300V30a25 25 0 0 1-50 0ZM350 0H400V30a25 25 0 0 1-50 0Z" fill="#FFF3E0" fill-opacity=".8"/></svg>');
const STARS = URI('<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260"><g fill="#FFF3E0"><circle cx="20" cy="30" r="1.6"/><circle cx="90" cy="70" r="1"/><circle cx="150" cy="20" r="1.8"/><circle cx="210" cy="90" r="1.2"/><circle cx="60" cy="150" r="1.2"/><circle cx="130" cy="130" r="1.6"/><circle cx="235" cy="170" r="1"/><circle cx="30" cy="225" r="1.8"/><circle cx="170" cy="215" r="1.2"/></g></svg>');

export const css = `
.g-pentomino-5x5 { --pe-s1:#FFD3DF; --pe-s2:#FFF1D8; --pe-wood:#8FD9CB; --pe-cav:#FFF6E6; --pe-cav2:#F3E2C4; --pe-day:1; --pe-night:0;
  position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; min-height: 420px;
  background: ${GRAIN}, linear-gradient(180deg, var(--pe-s1), var(--pe-s2)); touch-action: none; user-select: none; -webkit-user-select: none; }
@media (prefers-color-scheme: dark) { .g-pentomino-5x5 { --pe-s1:#2A1738; --pe-s2:#7A3D58; --pe-wood:#3F8A82; --pe-cav:#4D3552; --pe-cav2:#412C47; --pe-day:0; --pe-night:1; } }
.g-pentomino-5x5 .pe-l { position: absolute; inset: 0; pointer-events: none; background-repeat: repeat; }
.g-pentomino-5x5 .pe-l1 { background-image: ${BUBBLES}; background-size: 400px 260px; opacity: var(--pe-day); animation: pe-d1 110s linear infinite; }
.g-pentomino-5x5 .pe-l2 { background-image: ${SPRINK}; background-size: 300px 300px; animation: pe-d2 140s linear infinite, pe-fl 3.6s ease-in-out infinite; }
.g-pentomino-5x5 .pe-l3 { background-image: ${AWNING}; background-size: 400px 60px; background-position: 0 0; background-repeat: repeat-x; animation: pe-d3 180s linear infinite; }
.g-pentomino-5x5 .pe-l4 { background-image: ${STARS}; background-size: 260px 260px; opacity: var(--pe-night); animation: pe-tw 4s ease-in-out infinite; }
@keyframes pe-d1 { to { background-position: 400px 0; } } @keyframes pe-d2 { to { background-position: 300px 0; } } @keyframes pe-d3 { to { background-position: 400px 0; } }
@keyframes pe-fl { 50% { opacity: .5; } } @keyframes pe-tw { 50% { opacity: calc(var(--pe-night) * .5); } }
@media (prefers-color-scheme: dark) { .g-pentomino-5x5 .pe-l3 { filter: brightness(.45) saturate(.7); } .g-pentomino-5x5 .pe-l2 { opacity: .6; } }
.g-pentomino-5x5 svg.pe-main { position: relative; width: 100%; max-width: 520px; height: auto; display: block; touch-action: none; }
.g-pentomino-5x5 .pe-pc { cursor: grab; }
.g-pentomino-5x5 .pe-pc.pe-anim { transition: transform .42s cubic-bezier(.34,1.56,.64,1); }
.g-pentomino-5x5 .pe-pc.pe-grab { transition: transform .12s ease-out; }
.g-pentomino-5x5 .pe-pc.pe-fix { cursor: not-allowed; filter: brightness(.86) saturate(.8); }
.g-pentomino-5x5 .pe-body { transform-box: fill-box; transform-origin: center; }
.g-pentomino-5x5 .pe-tray .pe-body { animation: pe-wob 3.2s ease-in-out infinite; }
@keyframes pe-wob { 25% { transform: rotate(-1.6deg) scale(1.02); } 75% { transform: rotate(1.6deg) scale(.99); } }
.g-pentomino-5x5 .pe-spk { transform-box: fill-box; transform-origin: center; animation: pe-tw 2.2s ease-in-out infinite; }
@keyframes pe-tw { 0%,100% { transform: scale(.5) rotate(0); opacity: .5; } 50% { transform: scale(1.1) rotate(45deg); opacity: 1; } }
.g-pentomino-5x5 .pe-pc.pe-fix .pe-spk { display: none; }
.g-pentomino-5x5 .pe-halo { transition: transform .3s cubic-bezier(.34,1.56,.64,1), opacity .2s; animation: pe-pulse 1.6s ease-in-out infinite; }
@keyframes pe-pulse { 50% { opacity: .55; } }
.g-pentomino-5x5 .pe-rot { cursor: pointer; transition: transform .2s cubic-bezier(.34,1.56,.64,1); transform-box: fill-box; transform-origin: center; }
.g-pentomino-5x5 .pe-rot:active { transform: scale(.9); }
.g-pentomino-5x5 .pe-hl { pointer-events: none; }
.g-pentomino-5x5.pe-still *, .g-pentomino-5x5.pe-still .pe-pc { animation: none !important; transition: none !important; }
`;

const COLS = ['#F4623A', '#FFB26B', '#FFC857', '#6BBF59', '#7FC8F8']; // tomato, apricot, honey, leaf, sky
const PAT = [ // 22 x 22 tile marks, one per candy, so colour is never the only cue
  '<path d="M4 6l5 -3M14 10l5 3M3 17l5 2M15 20l4 -4" stroke-width="3.4"/>', '<path d="M-2 14L14 -2M8 24L24 8M-2 26L26 -2" stroke-width="4"/>',
  '<circle cx="6" cy="6" r="3.6"/><circle cx="17" cy="17" r="3.6"/>', '<rect x="0" y="0" width="11" height="11"/><rect x="11" y="11" width="11" height="11"/>',
  '<path d="M0 5l5.5 6 5.5-6 5.5 6 5.5-6M0 16l5.5 6 5.5-6 5.5 6 5.5-6" stroke-width="2.6"/>',
];
const BROWN = '#4A2C2A', NS = 'http://www.w3.org/2000/svg', V = 400, LIFT = 46;
const E = (t, a = {}, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); p && p.appendChild(e); return e; };
const norm = (c) => { const r0 = Math.min(...c.map((p) => p[0])), c0 = Math.min(...c.map((p) => p[1])); return c.map(([r, q]) => [r - r0, q - c0]).sort((a, b) => a[0] - b[0] || a[1] - b[1]); };
const spin = (c, k) => { for (let i = 0; i < k; i++) c = norm(c.map(([r, q]) => [q, -r])); return c; };
const dims = (c) => [Math.max(...c.map((p) => p[1])) + 1, Math.max(...c.map((p) => p[0])) + 1]; // [cols, rows]
// rounded-cell path: a corner is round only when neither touching side has a neighbour, so joined cells fuse into one block
const rp = (x, y, s, [a, b, c, d], r) => `M${x + (a ? r : 0)} ${y}H${x + s - (b ? r : 0)}${b ? `a${r} ${r} 0 0 1 ${r} ${r}` : ''}V${y + s - (c ? r : 0)}${c ? `a${r} ${r} 0 0 1 -${r} ${r}` : ''}H${x + (d ? r : 0)}${d ? `a${r} ${r} 0 0 1 -${r} -${r}` : ''}V${y + (a ? r : 0)}${a ? `a${r} ${r} 0 0 1 ${r} -${r}` : ''}Z`;
const PILL = 'M-6 -2.4h12a2.4 2.4 0 0 1 0 4.8h-12a2.4 2.4 0 0 1 0 -4.8Z';

export function mount(root, ctx) {
  root.classList.add('g-pentomino-5x5');
  const level = logic.makeLevel(ctx.level), best = logic.bestScore(level);
  let h = newHistory(logic.initialState(level));
  const N = h.initial.shapes.length, rows = level.board.length, cols = level.board[0].length;
  const S = Math.min(Math.floor(344 / cols), 62), bx = (V - cols * S) / 2, by = 30;
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
  const SND = { pick: () => blip(520, 700, 0.07, 0.05, 'triangle'), spin: () => blip(380, 560, 0.06, 0.04, 'square'), tok: () => { blip(1320, 1760, 0.2, 0.05); blip(330, 200, 0.08, 0.07, 'triangle'); }, back: () => blip(300, 200, 0.12, 0.05), no: () => { blip(180, 140, 0.1, 0.06, 'triangle'); blip(150, 120, 0.1, 0.06, 'triangle', 0.09); } };
  const still = ctx.reduceMotion;

  root.textContent = '';
  if (still) root.classList.add('pe-still');
  else for (const c of ['pe-l4', 'pe-l1', 'pe-l2', 'pe-l3']) { const d = document.createElement('div'); d.className = 'pe-l ' + c; root.appendChild(d); }
  const svg = E('svg', { viewBox: `0 0 ${V} ${H}`, class: 'pe-main' });
  root.appendChild(svg);
  const defs = E('defs', {}, svg);
  defs.innerHTML = `<linearGradient id="pe-sh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#4A2C2A" stop-opacity=".25"/></linearGradient>` +
    PAT.map((p, i) => `<pattern id="pe-p${i}" width="22" height="22" patternUnits="userSpaceOnUse"><g fill="${BROWN}" fill-opacity=".3" stroke="${BROWN}" stroke-opacity=".3" stroke-linecap="round">${p}</g></pattern>`).join('');

  // baking tray: a mint rim, a parchment floor, a soft checker
  const cellsOn = []; level.board.forEach((row, r) => row.forEach((v, c) => v && cellsOn.push([r, c])));
  const on = (r, c) => level.board[r]?.[c] === 1;
  const union = (attrs, dx = 0, dy = 0) => cellsOn.map(([r, c]) => `<rect x="${bx + c * S + dx}" y="${by + r * S + dy}" width="${S}" height="${S}" ${attrs}/>`).join('');
  const board = E('g', {}, svg);
  board.innerHTML = `<g transform="translate(5 7)" opacity=".3">${union(`fill="${BROWN}" stroke="${BROWN}" stroke-width="30" stroke-linejoin="round"`)}</g>` +
    union(`fill="${BROWN}" stroke="${BROWN}" stroke-width="30" stroke-linejoin="round"`) + union(`style="fill:var(--pe-wood);stroke:var(--pe-wood)" stroke-width="24" stroke-linejoin="round"`) +
    union(`style="fill:var(--pe-cav)"`) + cellsOn.filter(([r, c]) => (r + c) % 2).map(([r, c]) => `<rect x="${bx + c * S}" y="${by + r * S}" width="${S}" height="${S}" style="fill:var(--pe-cav2)" fill-opacity=".7"/>`).join('') +
    `<g fill="none" stroke="${BROWN}" stroke-opacity=".28" stroke-width="2" stroke-linecap="round">${cellsOn.map(([r, c]) => (on(r - 1, c) ? '' : `<path d="M${bx + c * S} ${by + r * S}h${S}"/>`) + (on(r, c - 1) ? '' : `<path d="M${bx + c * S} ${by + r * S}v${S}"/>`) + (on(r + 1, c) ? '' : `<path d="M${bx + c * S} ${by + (r + 1) * S}h${S}"/>`) + (on(r, c + 1) ? '' : `<path d="M${bx + (c + 1) * S} ${by + r * S}v${S}"/>`)).join('')}</g>`;
  const hit = E('rect', { x: bx - 14, y: by - 14, width: cols * S + 28, height: rows * S + 28, fill: 'transparent' }, svg);
  const hl = E('g', { class: 'pe-hl' }, svg);

  // cooling rack: a mint shelf with a dent per candy
  const shelf = E('g', {}, svg);
  const slot = (t) => { const row = Math.floor(t / 5), n = Math.min(5, T - row * 5); return [(V - n * 76) / 2 + (t % 5) * 76 + 38, trayY + row * 80 + 38]; };
  shelf.innerHTML = `<rect x="10" y="${trayY - 8}" width="380" height="${Math.ceil(T / 5) * 80 + 6}" rx="18" style="fill:var(--pe-wood)" stroke="${BROWN}" stroke-width="3"/>` +
    tray.map((_, t) => { const [x, y] = slot(t); return `<rect x="${x - 33}" y="${y - 33}" width="66" height="66" rx="14" fill="${BROWN}" fill-opacity=".2" stroke="${BROWN}" stroke-opacity=".35" stroke-width="2" stroke-dasharray="5 5"/>`; }).join('');
  const halo = E('rect', { width: 72, height: 72, rx: 16, fill: '#FFC857', 'fill-opacity': '.65', stroke: BROWN, 'stroke-width': 3, class: 'pe-halo' }, shelf);
  const layer = E('g', {}, svg), top = E('g', { 'pointer-events': 'none' }, svg); // top holds the lifted copy while dragging

  // rotate button
  const rb = E('g', { class: 'pe-rot', transform: `translate(${V / 2} ${stripY + 28})` }, svg);
  rb.innerHTML = `<circle r="27" fill="${BROWN}" fill-opacity=".3" cy="4"/><circle r="26" style="fill:var(--pe-wood)" stroke="${BROWN}" stroke-width="3"/><circle r="19" fill="#FFF3E0" fill-opacity=".35"/><path d="M-10 -3A11 11 0 1 1 -4 9" fill="none" stroke="${BROWN}" stroke-width="4" stroke-linecap="round"/><path d="M-17 -3L-9 -11L-3 -2Z" fill="${BROWN}" stroke="${BROWN}" stroke-width="2" stroke-linejoin="round"/>`;

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
    const star = 'M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z';
    const face = cells.map(([r, c]) => `<rect x="${c * S + 5}" y="${r * S + 5}" width="${S - 10}" height="${S - 10}" rx="${S * 0.16}" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="2"/>`).join('') + // candy tile bevel
      `<g transform="translate(${fX} ${fY}) scale(${u})"><ellipse cx="-8" cy="-9" rx="10" ry="5.5" fill="#fff" fill-opacity=".55" transform="rotate(-28 -8 -9)"/><circle cx="6" cy="-14" r="2.4" fill="#fff" fill-opacity=".8"/><g transform="translate(9 11)"><path class="pe-spk" d="${star}" fill="#fff" stroke="${BROWN}" stroke-width="1.4" stroke-linejoin="round"/></g></g>`;
    const lock = fx ? `<g transform="translate(${(lc + 0.5) * S} ${(lr + 0.5) * S}) scale(${u})"><path d="M-6 -3V-8a6 6 0 0 1 12 0V-3" fill="none" stroke="${BROWN}" stroke-width="3.4"/><rect x="-9" y="-4" width="18" height="14" rx="4" fill="#FFC857" stroke="${BROWN}" stroke-width="2.4"/><circle cy="3" r="2" fill="${BROWN}"/></g>` : '';
    const [w, hh] = dims(cells);
    const rivets = fx ? [[4, 4], [w * S - 4, 4], [4, hh * S - 4], [w * S - 4, hh * S - 4]].map(([x, y]) => (cells.some(([r, c]) => x > c * S && x < (c + 1) * S && y > r * S && y < (r + 1) * S) ? `<circle cx="${x}" cy="${y}" r="2.4" fill="#fff" fill-opacity=".7" stroke="${BROWN}"/>` : '')).join('') : '';
    return `<g class="pe-body"><g transform="translate(0 5)">${all(ol.replace(`fill="${BROWN}"`, 'fill="#8A5A44"'))}</g>${all(ol)}${all(`fill="${col}"`)}${all(`fill="url(#pe-p${i % PAT.length})"`)}${all('fill="url(#pe-sh)"')}${hi}${rivets}${face}${lock}</g>`;
  };
  tray.concat(Object.keys(h.present.fixed).map(Number).filter((i) => h.present.fixed[i])).forEach((i) => {
    const g = E('g', { class: 'pe-pc pe-anim', 'data-i': i }, layer);
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
      o.g.classList.toggle('pe-aw', !!p.placed[i]);
      o.g.classList.toggle('pe-fix', !!p.fixed[i]);
      o.g.classList.toggle('pe-tray', !p.placed[i]);
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
      const p = E('path', { d: PILL, fill: fill[k % fill.length], stroke: BROWN, 'stroke-width': 1.2, 'stroke-linejoin': 'round' }, svg), a = (k / n) * 6.28, v = spread * (0.6 + (k % 3) * 0.25);
      const an = p.animate([{ transform: `translate(${x}px, ${y}px) scale(0)`, opacity: 1 }, { transform: `translate(${x + Math.cos(a) * v}px, ${y + Math.sin(a) * v - 24}px) scale(1.1) rotate(${k % 2 ? 20 : -20}deg)`, opacity: 1, offset: 0.5 }, { transform: `translate(${x + Math.cos(a) * v * 1.2}px, ${y + Math.sin(a) * v - 60}px) scale(.6)`, opacity: 0 }], { duration: 900 + (k % 4) * 90, delay: k * 20, easing: 'cubic-bezier(.215,.61,.355,1)', fill: 'both' });
      an.onfinish = () => p.remove();
    }
  };
  const hug = (i, d = 0) => anim(pc[i].g.firstChild, [{ transform: 'none' }, { transform: 'scale(1.14,.86)', offset: 0.25 }, { transform: 'translateY(-10px) scale(.94,1.08)', offset: 0.55 }, { transform: 'none' }], { duration: 520, delay: d, easing: 'ease-out' });

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
      const gh = g.cloneNode(true); gh.setAttribute('class', 'pe-pc pe-grab pe-aw'); gh.style.transform = g.style.transform; top.appendChild(gh); gh.getBoundingClientRect(); drag.gh = gh;
      g.style.visibility = 'hidden'; g.classList.remove('pe-anim');
    }
    ghost(x, y);
  }
  function up(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag, g = pc[d.i].g;
    g.removeEventListener('pointermove', move); g.removeEventListener('pointerup', up); g.removeEventListener('pointercancel', up);
    drag = null; hl.innerHTML = '';
    if (d.gh) { g.style.transform = d.gh.style.transform; g.getBoundingClientRect(); g.style.visibility = ''; d.gh.remove(); }
    if (!still) g.classList.add('pe-anim');
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
      pc.forEach((o, i) => o && hug(i, i * 70));
      const bxm = bx + (cols * S) / 2, bym = by + (rows * S) / 2;
      fall(26, bxm, bym, ['#F4623A', '#FF8FB1', '#FFC857', '#7FC8F8', '#6BBF59'], Math.max(cols, rows) * S * 0.55);
      anim(board, [{ transform: 'none' }, { transform: 'translateY(-5px)', offset: 0.3 }, { transform: 'none' }], { duration: 420, easing: 'ease-out' });
      [784, 988, 1175, 1568].forEach((f, k) => blip(f, f, 0.3, 0.04, 'sine', k * 0.08));
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
  if (still) pc.forEach((o) => o && o.g.classList.remove('pe-anim'));

  return {
    undo() { if (drag) return; h = undo(h, logic.maxTries()); settle(); },
    reset() { if (drag) return; h = reset(h, logic.maxTries()); settle(); },
    destroy() {
      for (const t of timers) clearTimeout(t);
      timers.clear(); drag = null;
      if (ac) { try { ac.close(); } catch (_) {} ac = null; }
      root.textContent = '';
      root.classList.remove('g-pentomino-5x5', 'pe-still');
    },
  };
}
