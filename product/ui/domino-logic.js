import * as logic from '../logic/domino-logic.js';
import { newHistory, play, undo, reset } from '../logic/history.js';

const SPRING = 'cubic-bezier(.34,1.56,.64,1)';
const OUT = 'cubic-bezier(.215,.61,.355,1)';
const URI = (s) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
const GRID1 = URI('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><path d="M40 0V40M0 40H40" fill="none" stroke="#1D6FA5" stroke-opacity=".4"/></svg>');
const GRID2 = URI('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><path d="M160 0V160M0 160H160" fill="none" stroke="#1D6FA5" stroke-opacity=".75" stroke-width="2"/><path d="M0 8H8M8 0V8" stroke="#EAF6FF" stroke-opacity=".35" stroke-width="1.5"/></svg>');
const GRAIN = URI('<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 1.4 0 0 0 -.45"/></filter><rect width="220" height="220" filter="url(#n)"/></svg>');
const PROT = URI('<svg xmlns="http://www.w3.org/2000/svg" width="190" height="190" fill="none" stroke="#EAF6FF" stroke-opacity=".3" stroke-width="1.2"><path d="M190 190V10A180 180 0 0 0 10 190Z"/><path d="M190 190V50A140 140 0 0 0 50 190"/>' + Array.from({ length: 19 }, (_, i) => { const a = i * Math.PI / 36, c = Math.cos(a), s = Math.sin(a), l = i % 3 ? 7 : 14; return `<path d="M${190 - 180 * c} ${190 - 180 * s}L${190 - (180 - l) * c} ${190 - (180 - l) * s}"/>`; }).join('') + '</svg>');

export const css = `
& { position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 520px; padding: 14px 0 18px; box-sizing: border-box; background: #0B3C5D; touch-action: manipulation; user-select: none; -webkit-user-select: none; }
& .dl-l { position: absolute; inset: 0; pointer-events: none; }
& .dl-l0 { background-image: ${GRAIN}; background-size: 220px 220px; opacity: .1; }
& .dl-l1 { background-image: ${GRID1}; background-size: 40px 40px; animation: dl-d1 80s linear infinite; }
& .dl-l2 { background-image: ${GRID2}; background-size: 160px 160px; animation: dl-d2 130s linear infinite reverse; }
& .dl-l3 { background: ${PROT} right -14px bottom -14px / 190px 190px no-repeat; }
@keyframes dl-d1 { to { background-position: 40px 80px; } }
@keyframes dl-d2 { to { background-position: 160px 160px; } }
& .dl-s { position: relative; width: min(100%, 340px); display: flex; flex-direction: column; align-items: center; gap: 12px; box-sizing: border-box; }
& svg { overflow: visible; display: block; }
& .dl-bd { width: 100%; height: auto; }
& .dl-ink { fill: none; stroke: #EAF6FF; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 1; animation: dl-draw 1s ${OUT} both; animation-delay: var(--d, 0s); }
@keyframes dl-draw { from { stroke-dashoffset: 1; } }
& .dl-fr { stroke-opacity: .55; stroke-width: 1.4; }
& .dl-j, & .dl-w, & .dl-p, & .dl-hp { transform-box: fill-box; transform-origin: 50% 62%; }
& .dl-j { animation: dl-pop .7s ${SPRING} both; animation-delay: var(--d, 0s); }
@keyframes dl-pop { from { transform: scale(0); opacity: 0; } 30% { opacity: 1; } }
& .dl-w { animation: dl-wob 3.6s ease-in-out infinite; animation-delay: var(--w, 0s); }
@keyframes dl-wob { 40% { transform: scale(1.02, .97); } 75% { transform: scale(.99, 1.025) rotate(.5deg); } }
& .dl-p { animation: dl-pop .55s ${SPRING} both; animation-delay: var(--d, 0s); }
& .dl-hp { animation: dl-pop .45s ${SPRING} both; }
& .dl-hole rect { fill: rgba(11,60,93,.85); stroke: #EAF6FF; stroke-width: 1.8; stroke-dasharray: 4 6; stroke-linecap: round; animation: dl-march 4s linear infinite; transition: fill .3s ${OUT}; }
@keyframes dl-march { to { stroke-dashoffset: -20; } }
& .dl-hole .dl-cr { stroke: #EAF6FF; stroke-width: 1.4; stroke-linecap: round; opacity: .55; transition: opacity .3s ${OUT}; }
& .dl-hole.on rect { stroke: none; animation: none; }
& .dl-hole.on .dl-cr { opacity: 0; }
& .dl-hole.dl-bad { animation: dl-no .55s ease-in-out; transform-box: fill-box; transform-origin: 50% 50%; }
& .dl-k.dl-bad svg { animation: dl-no .55s ease-in-out; }
@keyframes dl-no { 15% { transform: translateX(-6px) rotate(-5deg) scale(1.04, .95); } 35% { transform: translateX(6px) rotate(4deg) scale(.96, 1.04); } 55% { transform: translateX(-4px) rotate(-3deg); } 80% { transform: translateX(2px); } }
& .dl-pick { width: 100%; display: flex; flex-wrap: wrap; justify-content: center; gap: 4px; }
& .dl-k { all: unset; box-sizing: border-box; flex: 1 1 0; min-width: 44px; max-width: 52px; aspect-ratio: 1; cursor: pointer; -webkit-tap-highlight-color: transparent; animation: dl-pop .6s ${SPRING} both; animation-delay: var(--d, 0s); transition: opacity .35s ${OUT}, filter .35s ${OUT}; }
& .dl-k:active { transform: scale(.92, .86); }
& .dl-k:focus-visible { outline: 2px dashed #EAF6FF; outline-offset: 2px; border-radius: 14px; }
& .dl-k svg { width: 100%; height: 100%; }
& .dl-k.dl-tried { opacity: .38; filter: grayscale(.6); cursor: default; }
& .dl-x { fill: none; stroke: #EAF6FF; stroke-width: 3; stroke-linecap: round; opacity: 0; }
& .dl-tried .dl-x { opacity: 1; stroke-dasharray: 1; animation: dl-draw .4s ${OUT} both; }
& .dl-tally { display: flex; gap: 7px; min-height: 18px; align-items: center; }
& .dl-tally i { width: 3px; height: 18px; border-radius: 2px; background: #EAF6FF; opacity: .75; transform: rotate(-8deg); animation: dl-pop .4s ${SPRING} both; }
& .dl-won .dl-w { animation: dl-wave .7s ease-in-out both; animation-delay: var(--v, 0s); }
@keyframes dl-wave { 40% { transform: scale(1.1, .88); } 70% { transform: scale(.95, 1.08) translateY(-3px); } }
& .dl-won .dl-k { opacity: .4; pointer-events: none; }
& .dl-rm *, & .dl-rm { animation: none !important; }
& .dl-rm .dl-hole.dl-bad, & .dl-rm .dl-k.dl-bad svg { opacity: .5; }
`.replaceAll('&', '.g-domino-logic');

const SP = 11, POS = [[], [[0, 0]], [[-1, -1], [1, 1]], [[-1, -1], [0, 0], [1, 1]], [[-1, -1], [1, -1], [-1, 1], [1, 1]], [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], [[-1, -1], [-1, 0], [-1, 1], [1, -1], [1, 0], [1, 1]]];
const DEFS = (p) => `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<radialGradient id="${p}0" cx=".3" cy=".2" r="1.1"><stop offset="0" stop-color="#FFD3E0"/><stop offset=".4" stop-color="#FF8FB1"/><stop offset="1" stop-color="#DB4F7C"/></radialGradient>
<radialGradient id="${p}1" cx=".3" cy=".2" r="1.1"><stop offset="0" stop-color="#E6FBB6"/><stop offset=".4" stop-color="#B6E36B"/><stop offset="1" stop-color="#6FAE34"/></radialGradient>
<radialGradient id="${p}p" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#CFE6F7"/></radialGradient></defs></svg>`;
// jelly dots for value v centred on (cx, cy); zero shows a small dotted ring so "none" is not "empty"
const pips = (P, cx, cy, v, d = 0) => v === 0 ? `<circle cx="${cx}" cy="${cy}" r="5" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.6" stroke-dasharray="2 3"/>`
  : POS[v].map(([a, b], k) => { const x = cx + a * SP, y = cy + b * SP; return `<g class="dl-p" style="--d:${(d + k * 0.05).toFixed(2)}s"><circle cx="${x}" cy="${y + 1.6}" r="5.8" fill="rgba(4,26,46,.3)"/><circle cx="${x}" cy="${y}" r="5.8" fill="url(#${P}p)"/><circle cx="${x - 1.8}" cy="${y - 2}" r="1.5" fill="#fff"/></g>`; }).join('');

export function mount(root, ctx) {
  root.classList.add('g-domino-logic');
  const rm = ctx.reduceMotion, P = 'dlg' + Math.random().toString(36).slice(2, 7);
  if (rm) root.classList.add('dl-rm');
  const level = logic.makeLevel(ctx.level), best = logic.bestScore(level);
  let h = newHistory(logic.initialState(level)), busy = false, winT = 0, wrong = 0, ac = null, bed = null;
  const tried = new Set(), timers = new Set();
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };

  // ---- sound: rubber boings and a calm string bed; the context starts on the first touch
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

  // ---- build: tiles in rows of two, read left to right; a dashed drafting arrow leads from each tile to the next
  const ds = h.present.dominoes, n = ds.length, last = n - 1, rows = Math.ceil(n / 2), X = [20, 192], PITCH = 90, Y0 = 8, H = Y0 + (rows - 1) * PITCH + 64 + 8;
  const pos = (i) => [X[i % 2], Y0 + (i >> 1) * PITCH];
  let tiles = '', links = '';
  ds.forEach(([a, b], i) => {
    const [x, y] = pos(i), end = i === last, dl = rm ? 0 : 0.5 + i * 0.1;
    tiles += `<g transform="translate(${x} ${y})"><rect class="dl-ink dl-fr" style="--d:${(i * 0.1).toFixed(2)}s" pathLength="1" x="-5" y="-5" width="138" height="74" rx="20"/>
      <g class="dl-j" style="--d:${dl.toFixed(2)}s"><g class="dl-w" style="--w:${(-i * 0.41).toFixed(2)}s;--v:${(i * 0.09).toFixed(2)}s">
      <rect y="5" width="128" height="64" rx="18" fill="rgba(4,26,46,.4)"/><rect width="128" height="64" rx="18" fill="url(#${P}${end ? 1 : 0})" stroke="rgba(4,26,46,.35)" stroke-width="1.2"/>
      <ellipse cx="34" cy="9" rx="22" ry="4" fill="#fff" opacity=".45"/><path d="M64 9V55" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".85"/>
      ${pips(P, 32, 32, a, dl + 0.3)}${end ? `<g class="dl-hole"><rect x="68" y="6" width="54" height="52" rx="13"/><path class="dl-cr" d="M89 32H103M96 25V39"/><g class="dl-hp" style="display:none"></g></g>` : pips(P, 96, 32, b, dl + 0.3)}</g></g></g>`;
    if (i < last) {
      const [x2, y2] = pos(i + 1), arrow = (px, py, dir) => `<path class="dl-ink" pathLength="1" style="--d:${(0.4 + i * 0.1).toFixed(2)}s" stroke-opacity=".6" stroke-width="1.6" d="${dir === 'r' ? `M${px - 5} ${py - 5}L${px} ${py}L${px - 5} ${py + 5}` : `M${px - 5} ${py - 5}L${px} ${py}L${px + 5} ${py - 5}`}"/>`;
      if (i % 2 === 0) links += `<path class="dl-ink" pathLength="1" style="--d:${(0.3 + i * 0.1).toFixed(2)}s" stroke-opacity=".6" stroke-width="1.6" d="M${x + 136} ${y + 32}H${x2 - 8}"/>${arrow(x2 - 8, y + 32, 'r')}`;
      else links += `<path class="dl-ink" pathLength="1" style="--d:${(0.3 + i * 0.1).toFixed(2)}s" stroke-opacity=".6" stroke-width="1.6" d="M${x + 64} ${y + 72}V${y + 77}H${x2 + 64}V${y2 - 9}"/>${arrow(x2 + 64, y2 - 9, 'd')}`;
    }
  });
  const keys = [0, 1, 2, 3, 4, 5, 6].map((v) => `<button class="dl-k" data-v="${v}" aria-label="${v}" style="--d:${((rm ? 0 : 0.9 + n * 0.1) + v * 0.06).toFixed(2)}s"><svg viewBox="0 0 56 56"><rect y="3" width="56" height="53" rx="15" fill="rgba(4,26,46,.4)"/><rect width="56" height="53" rx="15" fill="url(#${P}0)" stroke="rgba(4,26,46,.35)" stroke-width="1.2"/><ellipse cx="17" cy="6" rx="10" ry="2.6" fill="#fff" opacity=".45"/>${pips(P, 28, 27, v)}<path class="dl-x" pathLength="1" d="M10 10L46 44M46 10L10 44"/></svg></button>`).join('');
  root.innerHTML = DEFS(P) + '<i class="dl-l dl-l0"></i>' + (rm ? '' : '<i class="dl-l dl-l1"></i><i class="dl-l dl-l2"></i>') + '<i class="dl-l dl-l3"></i>'
    + `<div class="dl-s"><svg class="dl-bd" viewBox="0 0 340 ${H}">${links}${tiles}</svg><div class="dl-tally"></div><div class="dl-pick">${keys}</div></div>`;
  const hole = root.querySelector('.dl-hole'), hp = hole.querySelector('.dl-hp'), tally = root.querySelector('.dl-tally'), btns = [...root.querySelectorAll('.dl-k')];
  const [hx, hy] = [96, 32];
  const holeRect = hole.querySelector('rect');
  const isOk = () => h.present.dominoes[last][1] !== null && logic.isSolved(h.present);
  const hud = () => ctx.hud({ moves: h.present.moves + wrong, best, tries: h.tries, maxTries: logic.maxTries(), canUndo: h.past.length > 0 });
  const setHole = (v, bad) => {
    hole.classList.toggle('on', v !== null); hole.classList.toggle('dl-bad', !!bad);
    holeRect.style.fill = v === null ? '' : `url(#${P}0)`;
    hp.style.display = v === null ? 'none' : ''; hp.innerHTML = v === null ? '' : pips(P, hx, hy, v);
    if (v !== null) { hp.style.animation = 'none'; void hp.getBoundingClientRect(); hp.style.animation = ''; }
  };
  function refresh() {
    btns.forEach((b) => { b.classList.toggle('dl-tried', tried.has(+b.dataset.v)); b.classList.remove('dl-bad'); });
    root.classList.remove('dl-won');
    tally.innerHTML = '<i></i>'.repeat(h.present.moves + wrong);
    setHole(null);
    if (isOk()) win(false);
    hud();
  }
  function win(fresh) {
    setHole(h.present.dominoes[last][1]); root.classList.add('dl-won'); busy = true;
    if (fresh) { ds.forEach((_, i) => boing(i + 3, i * 0.09, 0.06, 0.45)); winT = later(() => ctx.solved({ score: logic.score(h.present) + wrong }), 700); }
  }
  function pick(v) {
    if (busy || tried.has(v) || isOk()) return;
    const nxt = logic.applyMove(h.present, { v });
    if (!nxt) return;
    setHole(v); tally.insertAdjacentHTML('beforeend', '<i></i>'); boing(v);
    if (logic.isSolved(nxt)) { h = play(h, logic, { v }); hud(); return win(true); }
    // a wrong guess costs one counted move but is never stored, so the hole is free again after the wobble
    wrong++; tried.add(v); busy = true; hud();
    setHole(v, true); btns[v].classList.add('dl-bad');
    later(() => { busy = false; refresh(); }, rm ? 350 : 750);
  }
  root.addEventListener('pointerdown', au, { passive: true });
  root.querySelector('.dl-pick').addEventListener('click', (e) => { const b = e.target.closest('.dl-k'); if (b) pick(+b.dataset.v); });
  hud();

  const act = (fn) => { clearTimeout(winT); timers.forEach(clearTimeout); timers.clear(); busy = false; h = fn(h, logic.maxTries()); refresh(); };
  return {
    undo() { if (h.past.length) { act(undo); boing(2, 0, 0.05, 0.25); } },
    reset() { wrong = 0; tried.clear(); act(reset); boing(4, 0, 0.05, 0.25); },
    destroy() {
      timers.forEach(clearTimeout); timers.clear(); clearTimeout(winT);
      root.removeEventListener('pointerdown', au);
      bed?.forEach((o) => { try { o.stop(); } catch { /* already stopped */ } });
      if (ac) ac.close?.();
      ac = false; root.textContent = ''; root.classList.remove('g-domino-logic', 'dl-rm', 'dl-won');
    },
  };
}
