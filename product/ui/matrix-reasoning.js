import * as logic from '../logic/matrix-reasoning.js';
import { newHistory, play, undo, reset } from '../logic/history.js';

const SPRING = 'cubic-bezier(.34,1.56,.64,1)';
const OUT = 'cubic-bezier(.215,.61,.355,1)';
const URI = (s) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
const GRID1 = URI('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><path d="M40 0V40M0 40H40" fill="none" stroke="#1D6FA5" stroke-opacity=".4"/></svg>');
const GRID2 = URI('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><path d="M160 0V160M0 160H160" fill="none" stroke="#1D6FA5" stroke-opacity=".75" stroke-width="2"/><path d="M0 8H8M8 0V8" stroke="#EAF6FF" stroke-opacity=".35" stroke-width="1.5"/></svg>');
const GRAIN = URI('<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 1.4 0 0 0 -.45"/></filter><rect width="220" height="220" filter="url(#n)"/></svg>');
const PROT = URI('<svg xmlns="http://www.w3.org/2000/svg" width="190" height="190" fill="none" stroke="#EAF6FF" stroke-opacity=".3" stroke-width="1.2"><path d="M190 190V10A180 180 0 0 0 10 190Z"/><path d="M190 190V50A140 140 0 0 0 50 190"/>' + Array.from({ length: 19 }, (_, i) => { const a = i * Math.PI / 36, c = Math.cos(a), s = Math.sin(a), l = i % 3 ? 7 : 14; return `<path d="M${190 - 180 * c} ${190 - 180 * s}L${190 - (180 - l) * c} ${190 - (180 - l) * s}"/>`; }).join('') + '</svg>');

export const css = `
& { position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 560px; padding: 14px 0 18px; box-sizing: border-box; background: #0B3C5D; touch-action: manipulation; user-select: none; -webkit-user-select: none; }
& .mx-l { position: absolute; inset: 0; pointer-events: none; }
& .mx-l0 { background-image: ${GRAIN}; background-size: 220px 220px; opacity: .1; }
& .mx-l1 { background-image: ${GRID1}; background-size: 40px 40px; animation: mx-d1 80s linear infinite; }
& .mx-l2 { background-image: ${GRID2}; background-size: 160px 160px; animation: mx-d2 130s linear infinite reverse; }
& .mx-l3 { background: ${PROT} right -14px bottom -14px / 190px 190px no-repeat; }
@keyframes mx-d1 { to { background-position: 40px 80px; } }
@keyframes mx-d2 { to { background-position: 160px 160px; } }
& .mx-s { position: relative; width: min(100%, 340px); display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 0 10px; box-sizing: border-box; }
& svg { overflow: visible; display: block; }
& .mx-bd { width: 100%; height: auto; }
& .mx-ink { fill: none; stroke: #EAF6FF; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 1; animation: mx-draw 1s ${OUT} both; animation-delay: var(--d, 0s); }
@keyframes mx-draw { from { stroke-dashoffset: 1; } }
& .mx-fr { fill: rgba(234,246,255,.07); stroke: #EAF6FF; stroke-opacity: .6; stroke-width: 1.4; }
& .mx-j, & .mx-w, & .mx-aj { transform-box: fill-box; transform-origin: 50% 62%; }
& .mx-j { animation: mx-pop .7s ${SPRING} both; animation-delay: var(--d, 0s); }
@keyframes mx-pop { from { transform: scale(0); opacity: 0; } 30% { opacity: 1; } }
& .mx-w { animation: mx-wob 3.6s ease-in-out infinite; animation-delay: var(--w, 0s); }
@keyframes mx-wob { 40% { transform: scale(1.03, .965); } 75% { transform: scale(.98, 1.03) rotate(.8deg); } }
& .mx-aj { animation: mx-pop .5s ${SPRING} both; }
& .mx-aj.mx-bad, & .mx-o.mx-bad svg { animation: mx-no .55s ease-in-out; }
@keyframes mx-no { 15% { transform: translateX(-7px) rotate(-6deg) scale(1.05, .94); } 35% { transform: translateX(7px) rotate(5deg) scale(.96, 1.05); } 55% { transform: translateX(-4px) rotate(-3deg); } 80% { transform: translateX(2px); } }
& .mx-slot rect { fill: rgba(234,246,255,.04); stroke: #EAF6FF; stroke-width: 1.6; stroke-dasharray: 4 6; stroke-linecap: round; animation: mx-march 4s linear infinite; }
& .mx-slot path { stroke: #EAF6FF; stroke-width: 1.4; stroke-linecap: round; opacity: .55; }
@keyframes mx-march { to { stroke-dashoffset: -20; } }
& .mx-slot { transition: opacity .3s ${OUT}; animation: mx-fadein .4s ${OUT} 1.5s backwards; }
@keyframes mx-fadein { from { opacity: 0; } }
& .mx-have .mx-slot { opacity: 0; }
& .mx-tray { width: 100%; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
& .mx-o { all: unset; box-sizing: border-box; aspect-ratio: 1; min-width: 44px; min-height: 44px; cursor: pointer; -webkit-tap-highlight-color: transparent; animation: mx-pop .6s ${SPRING} both; animation-delay: var(--d, 0s); transition: opacity .35s ${OUT}, filter .35s ${OUT}; }
& .mx-o:active { transform: scale(.94, .88); }
& .mx-o:focus-visible { outline: 2px dashed #EAF6FF; outline-offset: 2px; border-radius: 16px; }
& .mx-o svg { width: 100%; height: 100%; }
& .mx-o.mx-tried { opacity: .38; filter: grayscale(.6); cursor: default; }
& .mx-x { fill: none; stroke: #EAF6FF; stroke-width: 3; stroke-linecap: round; opacity: 0; }
& .mx-tried .mx-x { opacity: 1; stroke-dasharray: 1; animation: mx-draw .4s ${OUT} both; }
& .mx-tally { display: flex; gap: 7px; min-height: 18px; align-items: center; }
& .mx-tally i { width: 3px; height: 18px; border-radius: 2px; background: #EAF6FF; opacity: .75; transform: rotate(-8deg); animation: mx-pop .4s ${SPRING} both; }
& .mx-won .mx-w { animation: mx-wave .7s ease-in-out both; animation-delay: var(--v, 0s); }
@keyframes mx-wave { 40% { transform: scale(1.12, .88); } 70% { transform: scale(.94, 1.1) translateY(-3px); } }
& .mx-won .mx-o { opacity: .4; pointer-events: none; }
& .mx-rm *, & .mx-rm { animation: none !important; }
& .mx-rm .mx-o.mx-bad svg, & .mx-rm .mx-aj.mx-bad { opacity: .5; }
`.replaceAll('&', '.g-matrix-reasoning');

// ---- jelly shapes: a teardrop whose point shows the rotation; n blobs; fill = solid / striped / hollow
const SH = 'M0-1C.22-.6.8-.25.8.25A.8.8 0 0 1-.8.25C-.8-.25-.22-.6 0-1Z';
const TICK = ['#7A1D3E', '#2F5A0E', '#FFE066'];
const LAY = [[[0, 3, 30]], [[-23, 4, 19], [23, 4, 19]], [[0, -21, 19], [-24, 17, 19], [24, 17, 19]]];
const DEFS = (p) => `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<radialGradient id="${p}0" cx=".36" cy=".28" r=".85"><stop offset="0" stop-color="#FFD3E0"/><stop offset=".45" stop-color="#FF8FB1"/><stop offset="1" stop-color="#DB4F7C"/></radialGradient>
<radialGradient id="${p}1" cx=".36" cy=".28" r=".85"><stop offset="0" stop-color="#E6FBB6"/><stop offset=".45" stop-color="#B6E36B"/><stop offset="1" stop-color="#6FAE34"/></radialGradient>
<pattern id="${p}h" width=".3" height=".3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width=".11" height=".3" fill="#fff" opacity=".8"/></pattern></defs></svg>`;
const blob = (p, x, y, s, rot, fill) => {
  const body = fill === 2 ? `<path d="${SH}" fill="rgba(255,224,102,.16)" stroke="#FFE066" stroke-width=".12" stroke-linejoin="round"/><circle cy=".3" r=".14" fill="#FFE066"/>`
    : `<path d="${SH}" fill="url(#${p}${fill})" stroke="rgba(4,26,46,.4)" stroke-width=".05" stroke-linejoin="round"/>${fill === 1 ? `<path d="${SH}" fill="url(#${p}h)"/>` : ''}`;
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="${SH}" transform="translate(0 .13) rotate(${rot * 90})" fill="rgba(4,26,46,.38)"/><g transform="rotate(${rot * 90})">${body}<path d="M0-.74V-.42" stroke="${TICK[fill]}" stroke-width=".1" stroke-linecap="round"/></g>${fill === 2 ? '' : '<ellipse cx="-.3" cy="-.02" rx=".22" ry=".11" transform="rotate(-35 -.3 -.02)" fill="#fff" opacity=".6"/>'}</g>`;
};
const cellInner = (p, c) => LAY[c[0]].map(([x, y, s]) => blob(p, x, y, s, c[1], c[2])).join('');
const FRAME = '<rect class="mx-fr" x="-46" y="-46" width="92" height="92" rx="14"/>';

export function mount(root, ctx) {
  root.classList.add('g-matrix-reasoning');
  const rm = ctx.reduceMotion, P = 'mxg' + Math.random().toString(36).slice(2, 7);
  if (rm) root.classList.add('mx-rm');
  const level = logic.makeLevel(ctx.level), best = logic.bestScore(level);
  let h = newHistory(logic.initialState(level)), busy = false, winT = 0, ac = null, bed = null;
  const timers = new Set();
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };

  // ---- sound: the game's own rubber voice and a calm string bed; the context starts on the first touch
  const au = () => {
    if (ac === null) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); strings(); } catch { ac = false; } }
    if (ac && ac.state === 'suspended') ac.resume();
    return ac;
  };
  function strings() {
    const out = ac.createGain(), lp = ac.createBiquadFilter();
    out.gain.value = 0.0001; out.gain.setTargetAtTime(0.04, ac.currentTime, 2); lp.type = 'lowpass'; lp.frequency.value = 650; lp.connect(out); out.connect(ac.destination);
    bed = [0, 7, 12, 15].flatMap((st) => [-7, 7].map((dt) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sawtooth'; o.frequency.value = 123.5 * 2 ** (st / 12); o.detune.value = dt; g.gain.value = 0.12; o.connect(g).connect(lp); o.start(); return o; }));
  }
  const SC = [0, 3, 5, 7, 10];
  const boing = (i, delay = 0, vol = 0.08, len = 0.34) => {
    if (!au()) return ctx.sound.move(i);
    const f = 247 * 2 ** ((SC[((i % 5) + 5) % 5] + 12 * (Math.floor(i / 5) & 1)) / 12), t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
    o.type = 'triangle'; o.frequency.setValueCurveAtTime(Float32Array.from([0.72, 1.5, 0.88, 1.2, 0.96, 1.06, 1, 1.02], (k) => f * k), t, len);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.08);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + len + 0.1);
  };

  // ---- build: board of 3 x 3 cells (origin of each cell at its centre), the dotted slot, then the tray
  const st = h.present, cx = (k) => 50 + 100 * k;
  let cells = '', n = 0;
  st.grid.forEach((row, r) => row.forEach((c, k) => {
    const d = (rm ? 0 : 0.9) + n * 0.07;
    cells += c ? `<g transform="translate(${cx(k)} ${cx(r)})"><rect class="mx-fr mx-ink" style="--d:${(n * 0.08).toFixed(2)}s" pathLength="1" x="-46" y="-46" width="92" height="92" rx="14"/><g class="mx-j" style="--d:${d.toFixed(2)}s"><g class="mx-w" style="--w:${(-n * 0.37).toFixed(2)}s;--v:${((r + k) * 0.08).toFixed(2)}s">${cellInner(P, c)}</g></g></g>` : '';
    n++;
  }));
  const ticks = [0, 1, 2].map((k) => `M${cx(k)} -9V-3M-9 ${cx(k)}H-3`).join('') + 'M-9 12V-9H12M288 -9H309V12M-9 288V309H12M309 288V309H288';
  const opts = st.options.map((c, i) => `<button class="mx-o" data-i="${i}" aria-label="option ${i + 1}" style="--d:${((rm ? 0 : 1.6) + i * 0.07).toFixed(2)}s"><svg viewBox="-50 -50 100 100">${FRAME}${cellInner(P, c)}<path class="mx-x" pathLength="1" d="M-32-32L32 32M32-32L-32 32"/></svg></button>`).join('');
  root.innerHTML = DEFS(P) + '<i class="mx-l mx-l0"></i>' + (rm ? '' : '<i class="mx-l mx-l1"></i><i class="mx-l mx-l2"></i>') + '<i class="mx-l mx-l3"></i>'
    + `<div class="mx-s"><svg class="mx-bd" viewBox="-12 -12 324 324"><path class="mx-ink" pathLength="1" style="--d:.2s" stroke-width="1.6" d="${ticks}"/>${cells}
    <g transform="translate(${cx(2)} ${cx(2)})"><g class="mx-slot"><rect x="-46" y="-46" width="92" height="92" rx="14"/><path d="M-9 0H9M0-9V9"/></g><g class="mx-ans"></g></g></svg>
    <div class="mx-tally"></div><div class="mx-tray">${opts}</div></div>`;
  const $ = (s) => root.querySelector(s), btns = [...root.querySelectorAll('.mx-o')], ans = $('.mx-ans'), tally = $('.mx-tally');

  const isOk = (s) => s.picked !== null && logic.isSolved(s);
  const tried = () => new Set([...h.past, h.present].filter((s) => s.picked !== null && !logic.isSolved(s)).map((s) => s.picked));
  const hud = () => ctx.hud({ moves: h.present.moves, best, tries: h.tries, maxTries: logic.maxTries(), canUndo: h.past.length > 0 });
  const showAns = (i, bad) => {
    ans.innerHTML = `<g class="mx-aj${bad ? ' mx-bad' : ''}">${FRAME}${cellInner(P, h.present.options[i])}</g>`;
    root.classList.toggle('mx-have', true);
  };
  function refresh() {
    const t = tried();
    btns.forEach((b, i) => { b.classList.toggle('mx-tried', t.has(i)); b.classList.remove('mx-bad'); });
    ans.textContent = ''; root.classList.remove('mx-have', 'mx-won');
    tally.innerHTML = '<i></i>'.repeat(h.present.moves);
    if (isOk(h.present)) win(false);
    hud();
  }
  function win(fresh) {
    showAns(h.present.picked); root.classList.add('mx-won'); busy = true;
    ans.insertAdjacentHTML('beforeend', `<circle class="mx-ink" pathLength="1" style="--d:.1s" cx="34" cy="-34" r="13" fill="#0B3C5D" stroke-width="2.5"/><path class="mx-ink" pathLength="1" style="--d:.45s" d="M27-34L33-28L42-41" stroke-width="3.5"/>`);
    if (fresh) { [0, 2, 4, 7].forEach((k, j) => boing(k + 5, j * 0.09, 0.07, 0.5)); winT = later(() => ctx.solved({ score: logic.score(h.present) }), 700); }
  }
  function pick(i) {
    if (busy || tried().has(i)) return;
    const nh = play(h, logic, { pick: i });
    if (nh === h) return;
    h = nh; hud(); tally.insertAdjacentHTML('beforeend', '<i></i>');
    if (isOk(h.present)) return win(true);
    busy = true; showAns(i, true); btns[i].classList.add('mx-bad'); boing(0, 0, 0.07, 0.4);
    later(() => { busy = false; refresh(); }, rm ? 350 : 700);
  }
  root.addEventListener('pointerdown', au, { passive: true });
  root.querySelector('.mx-tray').addEventListener('click', (e) => { const b = e.target.closest('.mx-o'); if (b) pick(+b.dataset.i); });
  hud();

  const act = (fn) => { clearTimeout(winT); timers.forEach(clearTimeout); timers.clear(); busy = false; h = fn(h, logic.maxTries()); refresh(); };
  return {
    undo() { if (h.past.length) { act(undo); boing(2, 0, 0.05, 0.25); } },
    reset() { act(reset); boing(4, 0, 0.05, 0.25); },
    destroy() {
      timers.forEach(clearTimeout); timers.clear(); clearTimeout(winT);
      root.removeEventListener('pointerdown', au);
      bed?.forEach((o) => { try { o.stop(); } catch { /* already stopped */ } });
      if (ac) ac.close?.();
      ac = false; root.textContent = ''; root.classList.remove('g-matrix-reasoning', 'mx-rm', 'mx-have', 'mx-won');
    },
  };
}
