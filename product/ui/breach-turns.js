import * as logic from '../logic/breach-turns.js';
import { newHistory, play, undo, reset } from '../logic/history.js';

const NS = 'http://www.w3.org/2000/svg';
const SPRING = 'cubic-bezier(.34,1.56,.64,1)';
const EASE = 'cubic-bezier(.215,.61,.355,1)';
const URI = (s) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
const GRID1 = URI('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><path d="M40 0V40M0 40H40" fill="none" stroke="#1D6FA5" stroke-opacity=".4"/></svg>');
const GRID2 = URI('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><path d="M160 0V160M0 160H160" fill="none" stroke="#1D6FA5" stroke-opacity=".75" stroke-width="2"/><path d="M0 8H8M8 0V8" stroke="#EAF6FF" stroke-opacity=".35" stroke-width="1.5"/></svg>');
const GRAIN = URI('<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 1.4 0 0 0 -.45"/></filter><rect width="220" height="220" filter="url(#n)"/></svg>');
const REG = URI('<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" stroke="#EAF6FF" stroke-opacity=".5" stroke-width="1.4"><circle cx="13" cy="13" r="6"/><path d="M13 1V25M1 13H25"/></svg>');
const CROSS = URI('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none" stroke="#FF5D73" stroke-width="3" stroke-linecap="round"><circle cx="20" cy="20" r="11"/><path d="M20 3V12M20 28V37M3 20H12M28 20H37"/></svg>');
const ARROW = URI('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><path d="M20 4L33 20H25V36H15V20H7Z" fill="#FFE066" stroke="#0B3C5D" stroke-width="2.5" stroke-linejoin="round"/></svg>');
const HOUSE = '<svg viewBox="0 0 24 24" fill="none" stroke="#EAF6FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12L12 4L21 12M6 10V20H18V10"/></svg>';
const GO = '<svg class="br-go" viewBox="0 0 24 24" fill="none" stroke="#0B3C5D" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12A7 7 0 1 1 15.5 6"/><path d="M19 3V8H14"/></svg>';
const RW = '<svg class="br-rw" viewBox="0 0 24 24" fill="none" stroke="#0B3C5D" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12A7 7 0 1 0 8.5 6"/><path d="M5 3V8H10"/></svg>';
const SVG = {
  b: '<svg viewBox="0 0 40 40" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16L20 4L34 16" stroke="#fff" stroke-width="2.6"/><g fill="#0B3C5D" fill-opacity=".5"><rect x="11" y="18" width="7" height="7"/><rect x="22" y="18" width="7" height="7"/><rect x="11" y="28" width="7" height="7"/></g><rect x="22" y="28" width="7" height="7" fill="#fff" fill-opacity=".85"/></svg>',
  u: '<svg viewBox="0 0 40 40" fill="none" stroke-linecap="round"><circle cx="14" cy="17" r="5" fill="#fff"/><circle cx="26" cy="17" r="5" fill="#fff"/><circle cx="15" cy="18" r="2.4" fill="#0B3C5D"/><circle cx="27" cy="18" r="2.4" fill="#0B3C5D"/><path d="M15 27Q20 31 25 27" stroke="#0B3C5D" stroke-width="2"/><path class="ck" d="M27 7L31 11L38 3" stroke="#fff" stroke-width="3"/></svg>',
  e: '<svg viewBox="0 0 40 40" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M9 10L12 0L17 8ZM31 10L28 0L23 8Z" fill="#6B5AD6" stroke="#fff" stroke-width="1.5"/><circle cx="14" cy="21" r="4.5" fill="#fff"/><circle cx="26" cy="21" r="4.5" fill="#fff"/><circle cx="15" cy="22" r="2.2" fill="#0B3C5D"/><circle cx="25" cy="22" r="2.2" fill="#0B3C5D"/><path d="M8 13L18 17M32 13L22 17M12 31L16 28L20 31L24 28L28 31" stroke="#0B3C5D" stroke-width="2.2"/></svg>',
};
const D = [[-1, 0], [0, 1], [1, 0], [0, -1]];
const same = (p, r, c) => p[0] === r && p[1] === c;
const COLS = { b: '#FFE066', u: '#FF8FB1', e: '#9B8CFF' };

export const css = `
.g-breach-turns { position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px;
  min-height: 460px; padding: 14px 16px; box-sizing: border-box; background: #0B3C5D; touch-action: manipulation; user-select: none; -webkit-user-select: none; }
.g-breach-turns .br-l { position: absolute; inset: 0; pointer-events: none; }
.g-breach-turns .br-l0 { background-image: ${GRAIN}; background-size: 220px 220px; opacity: .1; }
.g-breach-turns .br-l1 { background-image: ${GRID1}; background-size: 40px 40px; animation: br-d1 80s linear infinite; }
.g-breach-turns .br-l2 { background-image: ${GRID2}; background-size: 160px 160px; animation: br-d2 130s linear infinite reverse; }
@keyframes br-d1 { to { background-position: 40px 80px; } }
@keyframes br-d2 { to { background-position: 160px 160px; } }
.g-breach-turns .br-reg { position: absolute; width: 26px; height: 26px; background: ${REG}; pointer-events: none; }
.g-breach-turns .br-top, .g-breach-turns .br-row { position: relative; z-index: 1; width: min(100%, 340px); display: flex; align-items: center; gap: 10px; }
.g-breach-turns .br-top { justify-content: space-between; color: #EAF6FF; font: 600 13px/1 ui-monospace, Menlo, monospace; }
.g-breach-turns .br-row { align-items: flex-start; }
.g-breach-turns .br-stat { display: flex; align-items: center; gap: 6px; min-height: 44px; }
.g-breach-turns .br-stat svg { width: 22px; height: 22px; }
.g-breach-turns .br-pips { display: flex; gap: 5px; }
.g-breach-turns .br-pips i { width: 12px; height: 12px; border-radius: 50%; border: 2px solid #FFE066; box-sizing: border-box; background: #FFE066; transition: background-color .4s ${EASE}, transform .4s ${SPRING}; }
.g-breach-turns .br-pips i.off { background: transparent; transform: scale(.7); }
.g-breach-turns .br-end { all: unset; box-sizing: border-box; position: relative; width: 72px; height: 48px; border-radius: 24px; cursor: pointer; display: grid; place-items: center; -webkit-tap-highlight-color: transparent;
  background: radial-gradient(ellipse 70% 55% at 36% 24%, #FFE9A8 0, transparent 70%), radial-gradient(circle at 50% 60%, #FFE066 0, #E9A91F 100%); box-shadow: inset 0 0 0 2px #EAF6FF, inset 0 -5px 8px rgba(0,0,0,.2), 0 4px 0 -1px rgba(4,26,46,.45); transition: filter .4s, transform .2s ${SPRING}; }
.g-breach-turns .br-end:active { transform: scale(.94, .9); }
.g-breach-turns .br-end:focus-visible { outline: 2px dashed #EAF6FF; outline-offset: 3px; }
.g-breach-turns .br-end svg { width: 26px; height: 26px; }
.g-breach-turns .br-rw { display: none; }
.g-breach-turns.br-stuck .br-rw { display: block; } .g-breach-turns.br-stuck .br-go { display: none; }
.g-breach-turns.br-stuck .br-end { background: radial-gradient(circle at 50% 60%, #FF8FB1 0, #DB4F7C 100%); animation: br-pulse 1.6s ease-in-out infinite; }
.g-breach-turns .br-end.ready { animation: br-pulse 1.8s ease-in-out infinite; }
@keyframes br-pulse { 50% { transform: scale(1.07, .96); } }
.g-breach-turns .br-board { position: relative; z-index: 1; width: min(100%, 340px); aspect-ratio: 1; }
.g-breach-turns .br-cells { position: absolute; inset: 0; display: grid; grid-template-columns: repeat(var(--N), 1fr); }
.g-breach-turns .br-cell { all: unset; box-sizing: border-box; position: relative; min-width: 44px; min-height: 44px; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.g-breach-turns .br-cell:focus-visible { outline: 2px dashed #EAF6FF; outline-offset: -3px; }
.g-breach-turns .br-cell::before { content: ''; position: absolute; inset: 1px; border: 1px solid rgba(234,246,255,.3); border-radius: 6px; background: rgba(234,246,255,.04); transition: background-color .3s ${EASE}, border-color .3s; }
.g-breach-turns .br-cell.tl::before { border-color: #FF5D73; background: repeating-linear-gradient(45deg, rgba(255,93,115,.5) 0 4px, rgba(255,93,115,.12) 4px 9px); }
.g-breach-turns .br-cell.rc::before { border-color: #EAF6FF; background: rgba(234,246,255,.16); }
.g-breach-turns .br-cell.rc::after { content: ''; position: absolute; inset: 34%; border: 2px dashed #EAF6FF; border-radius: 50%; opacity: .85; }
.g-breach-turns .br-cell.sl::before { border: 2px solid #FFE066; background: rgba(255,224,102,.22); }
.g-breach-turns .br-cell.pn::before { border: 2px solid #FFE066; background: rgba(255,224,102,.3); }
.g-breach-turns .br-ents { position: absolute; inset: 0; pointer-events: none; }
.g-breach-turns .br-e, .g-breach-turns .br-mk, .g-breach-turns .br-ruin { position: absolute; left: calc(var(--c) * 100% / var(--N)); top: calc(var(--r) * 100% / var(--N)); width: calc(100% / var(--N)); height: calc(100% / var(--N)); box-sizing: border-box; }
.g-breach-turns .br-e { transition: left .4s ${SPRING}, top .4s ${SPRING}; z-index: 2; }
.g-breach-turns .br-e.u { z-index: 3; }
.g-breach-turns .br-ruin { scale: .84; border: 2px dashed rgba(234,246,255,.45); border-radius: 22%; }
.g-breach-turns .br-mk { z-index: 4; background: center / 62% no-repeat; }
.g-breach-turns .br-mk.t { background-image: ${CROSS}; opacity: .95; }
.g-breach-turns .br-mk.p { background-image: ${ARROW}; background-size: 60%; transform: rotate(var(--d)); animation: br-nudge 1s ease-in-out infinite; }
@keyframes br-nudge { 50% { translate: 0 -3px; } }
.g-breach-turns .br-j { position: absolute; inset: 8%; border-radius: 28%; --jb: var(--c); --jl: color-mix(in srgb, var(--c), #fff 60%); --jd: color-mix(in srgb, var(--c), #000 28%);
  background: radial-gradient(ellipse 70% 55% at 36% 24%, var(--jl) 0, transparent 70%), radial-gradient(circle at 50% 60%, var(--jb) 0, var(--jd) 100%);
  box-shadow: inset 0 0 0 2px rgba(234,246,255,.9), inset 0 -5px 8px rgba(0,0,0,.22), 0 4px 0 -1px rgba(4,26,46,.45), 0 0 14px color-mix(in srgb, var(--c), transparent 60%); transition: filter .4s, opacity .4s; }
.g-breach-turns .u .br-j { border-radius: 50%; }
.g-breach-turns .br-j::after { content: ''; position: absolute; left: 14%; right: 40%; top: 9%; height: 18%; border-radius: 50%; background: #fff; opacity: .5; }
.g-breach-turns .br-j svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.g-breach-turns .ck { opacity: 0; transition: opacity .3s; }
.g-breach-turns .ad .br-j { filter: saturate(.25) brightness(.8); opacity: .8; animation: none !important; }
.g-breach-turns .ad .ck { opacity: 1; }
.g-breach-turns .u.sel .br-j { box-shadow: inset 0 0 0 3px #fff, inset 0 -5px 8px rgba(0,0,0,.2), 0 0 18px rgba(255,255,255,.75); }
.g-breach-turns.br-m .br-j { animation: br-br var(--dur) ease-in-out infinite; animation-delay: var(--dl); }
@keyframes br-br { 50% { transform: scale(1.03, .96); } }
.g-breach-turns.br-stuck .br-e:not(.ad) .br-j { filter: saturate(.5); }
.g-breach-turns .br-f { position: absolute; inset: 0; transition: transform .5s ${SPRING}; transform: rotate(var(--a)); pointer-events: none; }
.g-breach-turns .br-f i { position: absolute; left: 50%; top: -2%; margin-left: -8px; border: 8px solid transparent; border-top: 0; border-bottom: 13px solid #FF5D73; filter: drop-shadow(0 0 1.5px #fff) drop-shadow(0 0 1.5px #fff); }
.g-breach-turns .br-fx { position: absolute; z-index: 5; pointer-events: none; border-radius: 50%; background: var(--c); }
.g-breach-turns .br-draft { position: absolute; z-index: 6; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
.g-breach-turns .br-title { position: relative; flex: none; width: 84px; height: 40px; margin-top: 3px; box-sizing: border-box; padding: 2px; display: grid; grid-template-columns: 1fr 2px 1fr; align-items: center; text-align: center; font: 600 11px/1 ui-monospace, Menlo, monospace; color: #EAF6FF; }
.g-breach-turns .br-title i { align-self: stretch; background: #EAF6FF; transform-origin: 50% 0; }
.g-breach-turns .br-box { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; fill: none; stroke: #EAF6FF; stroke-width: 2; stroke-linejoin: round; }
.g-breach-turns .br-tape { position: relative; flex: 1; min-width: 0; height: 68px; border-top: 2px solid #EAF6FF; display: flex; overflow-x: auto; overflow-y: hidden; scrollbar-width: none; touch-action: pan-x; box-sizing: border-box; }
.g-breach-turns .br-tape::before, .g-breach-turns .br-tape::after { content: ''; flex: none; width: calc(50% - 22px); }
.g-breach-turns .br-tape::-webkit-scrollbar { display: none; }
.g-breach-turns .br-tick { all: unset; flex: none; box-sizing: border-box; position: relative; width: 44px; min-height: 44px; padding-top: 11px; border-left: 1px solid rgba(234,246,255,.55); display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; -webkit-tap-highlight-color: transparent;
  font: 600 10px/1 ui-monospace, Menlo, monospace; color: #EAF6FF; transition: opacity .3s ${EASE}, background-color .3s; }
.g-breach-turns .br-tick::before { content: ''; position: absolute; left: 0; right: 0; top: 0; height: 6px; background: repeating-linear-gradient(90deg, rgba(234,246,255,.5) 0 1px, transparent 1px 11px); }
.g-breach-turns .br-tick.z { border-left: 3px solid #FFE066; }
.g-breach-turns .br-tick:focus-visible { outline: 2px dashed #EAF6FF; outline-offset: -3px; }
.g-breach-turns .br-fut { opacity: .38; }
.g-breach-turns .br-cur { background: rgba(255,224,102,.14); color: #FFE066; }
.g-breach-turns .br-cur::after { content: ''; position: absolute; left: 0; right: 0; top: -3px; height: 4px; border-radius: 2px; background: #FFE066; }
.g-breach-turns .br-map { display: grid; gap: 1.5px; }
.g-breach-turns .br-map i { width: 5px; height: 5px; border-radius: 50%; background: #EAF6FF; opacity: .2; }
.g-breach-turns .br-map i.b { border-radius: 1px; background: #FFE066; opacity: 1; }
.g-breach-turns .br-map i.u { background: #FF8FB1; opacity: 1; }
.g-breach-turns .br-map i.e { border-radius: 1px; background: #9B8CFF; opacity: 1; rotate: 45deg; }
.g-breach-turns .br-map i.q { outline: 1px solid #fff; outline-offset: 1px; }
`;

// the game's own rubber voice and calm strings; the context is made on the first touch and closed in destroy
const SC = [0, 3, 5, 7, 10], CHORDS = [[0, 7, 12, 15], [-2, 5, 10, 15], [-4, 3, 8, 12], [-2, 5, 10, 14]];
let ac, bedT;
function bed() {
  const out = ac.createGain(), lp = ac.createBiquadFilter(), voices = [];
  out.gain.value = 0.0001; out.gain.setTargetAtTime(0.045, ac.currentTime, 2); lp.type = 'lowpass'; lp.frequency.value = 700;
  lp.connect(out); out.connect(ac.destination);
  for (let v = 0; v < 4; v++) for (const dt of [-7, 7]) { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sawtooth'; o.detune.value = dt; g.gain.value = 0.12; o.connect(g).connect(lp); o.start(); voices.push([o, v]); }
  let n = 0;
  const chord = () => voices.forEach(([o, v]) => o.frequency.setTargetAtTime(123.5 * 2 ** (CHORDS[(n / 9 | 0) % 4][v] / 12), ac.currentTime, 1.2));
  chord();
  bedT = setInterval(() => { // soft clockwork
    if (document.hidden) return;
    const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
    o.type = 'square'; o.frequency.value = n % 2 ? 1100 : 1500; g.gain.setValueAtTime(0.01, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + 0.04);
    if (++n % 9 === 0) chord();
  }, 900);
}
const audio = () => {
  if (ac === undefined) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); bed(); } catch { ac = null; } }
  if (ac && ac.state === 'suspended') ac.resume();
  return ac;
};
function tone(type, f0, f1, vol, len, delay = 0) {
  const t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + len);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.06);
  o.connect(g).connect(ac.destination); o.start(t); o.stop(t + len + 0.08);
}
const boing = (i, delay = 0, vol = 0.07, len = 0.34) => {
  const f = 247 * 2 ** ((SC[((i % 5) + 5) % 5] + 12 * (Math.floor(i / 5) & 1)) / 12), t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
  o.type = 'triangle';
  o.frequency.setValueCurveAtTime(Float32Array.from([0.72, 1.5, 0.88, 1.2, 0.96, 1.06, 1, 1.02], (k) => f * k), t, len);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.08);
  o.connect(g).connect(ac.destination); o.start(t); o.stop(t + len + 0.1);
};

export function mount(root, ctx) {
  root.classList.add('g-breach-turns');
  const level = logic.makeLevel(ctx.level), N = level.size, best = logic.bestScore(level), rm = ctx.reduceMotion;
  const start = logic.initialState(level);
  let h = newHistory(start), taps = [], snaps = [h], sel = -1, to = null, mode = 'move', won = false, stuck = false, busy = false;
  const timers = new Set();
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
  const clearTimers = () => { for (const t of timers) clearTimeout(t); timers.clear(); busy = false; };
  const mk = (cls, tag = 'div', parent = root) => { const e = document.createElement(tag); e.className = cls; parent.appendChild(e); return e; };
  const snd = (i, delay = 0, vol = 0.07, len = 0.34) => { if (audio()) boing(i, delay, vol, len); else later(() => ctx.sound.move(i), delay * 1000); };
  const fx = (f) => { if (audio()) f(); };
  const anim = (el, frames, duration, delay = 0, easing = SPRING) => { if (!rm) el.animate(frames, { duration, delay, easing }); };
  const S = () => h.present, key = (r, c) => r + ',' + c;

  root.textContent = '';
  if (!rm) root.classList.add('br-m');
  mk('br-l br-l0');
  if (!rm) { mk('br-l br-l1'); mk('br-l br-l2'); }
  for (const pos of ['left:10px;top:10px', 'right:10px;top:10px']) mk('br-reg').style.cssText = pos;
  const top = mk('br-top');
  const pipsBox = mk('br-stat br-pips', 'div', top), houseBox = mk('br-stat', 'div', top), endBtn = mk('br-end', 'button', top);
  endBtn.type = 'button'; endBtn.innerHTML = GO + RW;
  const board = mk('br-board');
  board.style.setProperty('--N', N);
  const cellsEl = mk('br-cells', 'div', board), ents = mk('br-ents', 'div', board);
  const marks = mk('br-ents', 'div', board);
  marks.style.zIndex = 4;
  const T0 = rm ? 0 : 1000;
  const cells = Array.from({ length: N * N }, (_, i) => {
    const b = mk('br-cell', 'button', cellsEl);
    b.type = 'button'; b.setAttribute('aria-label', `${Math.floor(i / N) + 1},${(i % N) + 1}`);
    b.addEventListener('click', () => tapCell(Math.floor(i / N), i % N));
    return b;
  });
  const draft = document.createElementNS(NS, 'svg');
  draft.setAttribute('class', 'br-draft'); draft.setAttribute('viewBox', `0 0 ${N} ${N}`);
  board.appendChild(draft);
  const ink = (tag, a) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); draft.appendChild(e); return e; };
  if (!rm) { // the blueprint is inked first: frame, then the grid lines; both fade as the jelly arrives
    const pen = (d, delay, dur) => {
      const e = ink('path', { d, fill: 'none', stroke: '#EAF6FF', 'stroke-width': 0.04, 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': 1 });
      e.animate([{ strokeDashoffset: 1, opacity: 0.9 }, { strokeDashoffset: 0, opacity: 0.9, offset: 0.5 }, { strokeDashoffset: 0, opacity: 0.9, offset: 0.78 }, { strokeDashoffset: 0, opacity: 0 }], { duration: dur, delay, easing: 'ease-in-out', fill: 'both' }).onfinish = () => e.remove();
    };
    pen(`M0 0H${N}V${N}H0Z`, 0, 1500);
    for (let k = 1; k < N; k++) { pen(`M${k} 0V${N}`, 150 + k * 90, 1300); pen(`M0 ${k}H${N}`, 190 + k * 90, 1300); }
  }
  const row = mk('br-row');
  const tape = mk('br-tape', 'div', row), title = mk('br-title', 'div', row);
  title.innerHTML = `<svg class="br-box" viewBox="0 0 84 40"><rect x="1" y="1" width="82" height="38" pathLength="1" stroke-dasharray="1"/></svg><b>${String(ctx.level).padStart(2, '0')}</b><i></i><b>${N}×${N}</b>`;
  if (!rm) {
    title.firstChild.firstChild.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 900, delay: 600, easing: 'ease-in-out', fill: 'backwards' });
    tape.animate([{ clipPath: 'inset(-4px 100% -4px 0)' }, { clipPath: 'inset(-4px 0 -4px 0)' }], { duration: 1100, delay: 700, easing: 'ease-in-out', fill: 'backwards' });
  }

  // ---- pieces: buildings never move, units move only on their act, enemies only when punched; so each is found by its cell
  const E = { b: new Map(), u: new Map(), e: new Map() };
  const ruins = new Map();
  let seq = 0;
  const place = (el, r, c) => { el.style.setProperty('--r', r); el.style.setProperty('--c', c); };
  function piece(t, r, c, pop) {
    const el = mk('br-e ' + t, 'div', ents), j = mk('br-j', 'div', el), i = seq++;
    el.style.setProperty('--c', c); el.style.setProperty('--r', r);
    j.style.cssText = `--c:${COLS[t]};--dur:${(3 + (i * 7 % 11) / 8).toFixed(2)}s;--dl:${(-i * 0.37).toFixed(2)}s`;
    j.innerHTML = SVG[t];
    place(el, r, c);
    if (t === 'e') { el._a = 0; el.insertAdjacentHTML('beforeend', '<div class="br-f"><i></i></div>'); }
    if (pop && !rm) j.animate([{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 560, delay: pop - 1, easing: SPRING, fill: 'backwards' });
    E[t].set(key(r, c), el);
    return el;
  }
  const face = (el, f) => { // clockwise turns keep adding angle, so the wedge never spins back
    const d = (f - (el._f ?? 0) + 4) % 4;
    el._a = (el._a || 0) + d * 90; el._f = f;
    el.querySelector('.br-f').style.setProperty('--a', el._a + 'deg');
    if (d && !rm) el.querySelector('.br-j').animate([{ transform: 'scale(1)' }, { transform: 'scale(1.1,.9)', offset: 0.3 }, { transform: 'scale(1)' }], { duration: 400, easing: SPRING });
  };
  function ruin(r, c) {
    if (ruins.has(key(r, c))) return;
    const el = mk('br-ruin', 'div', ents); place(el, r, c); ruins.set(key(r, c), el);
  }
  function rebuild(pop) {
    for (const m of [E.b, E.u, E.e, ruins]) { for (const el of m.values()) el.remove(); m.clear(); }
    const s = S();
    start.buildings.forEach(([r, c]) => (s.buildings.some((p) => same(p, r, c)) ? 0 : ruin(r, c)));
    let k = 0;
    s.buildings.forEach(([r, c]) => piece('b', r, c, pop && T0 + 40 * k++ + 1));
    s.units.forEach(([r, c]) => piece('u', r, c, pop && T0 + 40 * k++ + 1));
    s.enemies.forEach(([r, c, f]) => { face(piece('e', r, c, pop && T0 + 40 * k++ + 1), f); });
    s.units.forEach(([r, c], i) => E.u.get(key(r, c)).classList.toggle('ad', s.acted[i]));
  }
  function burst(r, c, col, n = 7) { // jelly shards fly off a pop
    if (rm) return;
    for (let k = 0; k < n; k++) {
      const b = mk('br-fx', 'div', ents), a = (k / n) * 6.28 + r, sz = 100 / N * 0.22;
      b.style.cssText = `--c:${col};left:calc(${c + 0.5} * 100% / ${N} - ${sz / 2}%);top:calc(${r + 0.5} * 100% / ${N} - ${sz / 2}%);width:${sz}%;height:${sz}%`;
      b.animate([{ transform: 'scale(.6)', opacity: 1 }, { transform: `translate(${Math.cos(a) * 34}px,${Math.sin(a) * 34 + 10}px) scale(.2)`, opacity: 0 }], { duration: 650, easing: EASE }).onfinish = () => b.remove();
    }
  }
  function sync() { // after a move: pieces whose cell is gone pop away, enemies turn
    const s = S();
    for (const [t, list] of [['b', s.buildings], ['u', s.units], ['e', s.enemies]]) {
      for (const [k, el] of [...E[t]]) {
        const [r, c] = k.split(',').map(Number), f = list.find((p) => same(p, r, c));
        if (f) { if (t === 'e') face(el, f[2]); continue; }
        E[t].delete(k);
        anim(el.firstChild, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.25,.7)', opacity: 1, offset: 0.3 }, { transform: 'scale(.1)', opacity: 0 }], 480, 0, EASE);
        later(() => el.remove(), rm ? 0 : 500);
        burst(r, c, COLS[t]);
        if (t === 'b') ruin(r, c);
        fx(() => tone('sawtooth', 260, 70, 0.05, 0.28));
      }
    }
    s.units.forEach(([r, c], i) => E.u.get(key(r, c))?.classList.toggle('ad', s.acted[i]));
  }

  // ---- the board: reachable rings, danger hatching, punch arrows
  const reach = (s, u) => {
    const [r, c] = s.units[u], out = new Set([key(r, c)]);
    for (let i = r - 3; i <= r + 3; i++) for (let j = c - 3; j <= c + 3; j++)
      if (i >= 0 && j >= 0 && i < N && j < N && Math.abs(i - r) + Math.abs(j - c) <= 3 && ![...s.buildings, ...s.units, ...s.enemies].some((p) => same(p, i, j))) out.add(key(i, j));
    return out;
  };
  const adj = (s, p) => D.map(([a, b], d) => (s.enemies.some((e) => same(e, p[0] + a, p[1] + b)) ? d : -1)).filter((d) => d >= 0);
  function refresh() {
    const s = S(), rc = sel >= 0 && !won ? reach(s, sel) : new Set();
    cells.forEach((b) => (b.className = 'br-cell'));
    marks.textContent = '';
    const mark = (r, c, cls, d) => { const m = mk('br-mk ' + cls, 'div', marks); place(m, r, c); if (d !== undefined) m.style.setProperty('--d', d * 90 + 'deg'); };
    if (!won) s.enemies.forEach(([r, c, f]) => {
      const tr = r + D[f][0], tc = c + D[f][1];
      if (tr >= 0 && tc >= 0 && tr < N && tc < N) { cells[tr * N + tc].classList.add('tl'); mark(tr, tc, 't'); }
    });
    for (const k of rc) { const [r, c] = k.split(',').map(Number); cells[r * N + c].classList.add('rc'); }
    if (sel >= 0) cells[to[0] * N + to[1]].classList.add('sl');
    if (sel >= 0 && mode === 'punch') adj(s, to).forEach((d) => { const r = to[0] + D[d][0], c = to[1] + D[d][1]; cells[r * N + c].classList.add('pn'); mark(r, c, 'p', d); });
    E.u.forEach((el) => el.classList.remove('sel'));
    if (sel >= 0) E.u.get(key(...s.units[sel]))?.classList.add('sel');
    pipsBox.innerHTML = Array.from({ length: level.turns }, (_, i) => `<i class="${i < s.turn ? 'off' : ''}"></i>`).join('') + `<span style="margin-left:4px">${level.turns - s.turn}</span>`;
    houseBox.innerHTML = HOUSE + `<span>${s.buildings.length}/${level.keep}</span>`;
    endBtn.classList.toggle('ready', !won && !stuck && s.acted.every(Boolean));
    root.classList.toggle('br-stuck', stuck);
  }
  const hud = () => ctx.hud({ moves: S().moves, best, tries: h.tries, maxTries: logic.maxTries(), canUndo: h.past.length > 0 });

  function cancel() {
    if (sel >= 0) { const [r, c] = S().units[sel]; place(E.u.get(key(r, c)), r, c); }
    sel = -1; to = null; mode = 'move'; refresh();
  }
  function select(u) {
    if (sel >= 0) cancel();
    sel = u; to = [...S().units[u]]; mode = 'move'; refresh();
    snd(u + 2, 0, 0.05, 0.25); anim(E.u.get(key(...to)).firstChild, [{ transform: 'scale(1)' }, { transform: 'scale(1.14,.86)', offset: 0.3 }, { transform: 'scale(.96,1.06)', offset: 0.65 }, { transform: 'scale(1)' }], 380);
  }
  function moveTo(r, c) {
    const s = S(), org = s.units[sel];
    to = [r, c]; place(E.u.get(key(...org)), r, c);
    const a = adj(s, to);
    snd(r + c, 0, 0.06, 0.3);
    if (a.length) { mode = 'punch'; refresh(); } else if (same(org, r, c)) cancel(); else commit(-1);
  }
  function commit(punch) {
    const s = S(), u = sel, org = s.units[u], m = { t: 'act', u, to: [...to], punch }, n = play(h, logic, m);
    if (n === h) return cancel();
    const ue = E.u.get(key(...org));
    E.u.delete(key(...org)); E.u.set(key(...to), ue);
    if (punch >= 0) {
      const [er, ec] = [to[0] + D[punch][0], to[1] + D[punch][1]], [nr, nc] = [er + D[punch][0], ec + D[punch][1]], ee = E.e.get(key(er, ec));
      anim(ue.firstChild, [{ transform: 'none' }, { transform: `translate(${D[punch][1] * 16}px,${D[punch][0] * 16}px) scale(1.15,.9)`, offset: 0.35 }, { transform: 'none' }], 360);
      if (n.present.enemies.some((e) => same(e, nr, nc)) && !s.enemies.some((e) => same(e, nr, nc))) { E.e.delete(key(er, ec)); E.e.set(key(nr, nc), ee); place(ee, nr, nc); }
      else anim(ee.firstChild, [{ transform: 'none' }, { transform: `translate(${D[punch][1] * 6}px,${D[punch][0] * 6}px) scale(.9,1.1)`, offset: 0.3 }, { transform: 'none' }], 420);
      fx(() => tone('triangle', 160, 45, 0.16, 0.18));
      snd(7, 0.05, 0.05, 0.3);
    }
    advance(n, m);
    sync();
  }
  function advance(n, m) {
    h = n; taps = taps.slice(0, h.past.length - 1).concat(m); snaps = snaps.slice(0, h.past.length).concat(h);
    sel = -1; to = null; mode = 'move';
    drawTape(true); finish();
  }
  function finish() {
    const s = S();
    stuck = !logic.isSolved(s) && logic.legalMoves(s).length === 0;
    refresh(); hud();
    if (logic.isSolved(s)) win();
  }
  function endTurn() {
    if (won || busy) return;
    if (stuck) return api.undo();
    const s = S(), n = play(h, logic, { t: 'end' });
    if (n === h) return;
    cancel();
    // replay the strikes in order so each hit lands one after another
    const alive = s.enemies.map(() => true), pos = s.enemies.map((e) => [...e]);
    let t = 0;
    busy = true;
    fx(() => [0, 1, 2].forEach((k) => tone('square', k % 2 ? 1100 : 1500, 900, 0.03, 0.03, k * 0.12)));
    pos.forEach((e, i) => {
      if (!alive[i]) return;
      const [tr, tc] = [e[0] + D[e[2]][0], e[1] + D[e[2]][1]];
      later(() => {
        const el = E.e.get(key(e[0], e[1]));
        if (el) anim(el.firstChild, [{ transform: 'none' }, { transform: `translate(${D[e[2]][1] * 14}px,${D[e[2]][0] * 14}px) scale(1.15,.88)`, offset: 0.4 }, { transform: 'none' }], 380);
        if (tr >= 0 && tc >= 0 && tr < N && tc < N) { burst(tr, tc, '#FF5D73', 6); fx(() => tone('sawtooth', 700, 140, 0.06, 0.16)); }
      }, t);
      pos.forEach((p, k) => { if (alive[k] && same(p, tr, tc)) alive[k] = false; });
      alive[i] = true; // an enemy that hits itself is not possible, and a dead one never strikes
      t += rm ? 0 : 300;
    });
    advance(n, { t: 'end' });
    later(() => { busy = false; sync(); }, t + (rm ? 0 : 250));
  }

  function tapCell(r, c) {
    if (won || busy) return;
    const s = S(), here = s.units.findIndex((p) => same(p, r, c));
    if (stuck) return;
    if (sel >= 0) {
      if (mode === 'punch') {
        if (same(to, r, c)) return commit(-1);
        const d = D.findIndex(([a, b]) => to[0] + a === r && to[1] + b === c);
        if (d >= 0 && s.enemies.some((e) => same(e, r, c))) return commit(d);
      }
      if (reach(s, sel).has(key(r, c))) return moveTo(r, c);
      if (here >= 0 && !s.acted[here]) return select(here);
      return cancel();
    }
    if (here < 0) return;
    if (s.acted[here]) { snd(0, 0, 0.04, 0.2); return anim(E.u.get(key(r, c)).firstChild, [{ transform: 'none' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(5deg)' }, { transform: 'none' }], 380); }
    select(here);
  }
  endBtn.addEventListener('click', endTurn);

  // ---- tape: tick k is the board after move k; end-of-turn ticks have a yellow edge
  const tickCls = (k) => 'br-tick' + (k && taps[k - 1].t === 'end' ? ' z' : '') + (k === h.past.length ? ' br-cur' : k > h.past.length ? ' br-fut' : '');
  const mini = (k) => {
    const s = snaps[k].present, m = k ? taps[k - 1] : null;
    const g = Array.from({ length: N * N }, (_, i) => { const r = Math.floor(i / N), c = i % N; return `<i class="${s.buildings.some((p) => same(p, r, c)) ? 'b' : s.units.some((p) => same(p, r, c)) ? 'u' : s.enemies.some((p) => same(p, r, c)) ? 'e' : ''}${m && m.t === 'act' && same(m.to, r, c) ? ' q' : ''}"></i>`; });
    return `<div class="br-map" style="grid-template-columns:repeat(${N},5px)">${g.join('')}</div>`;
  };
  const markTape = () => [...tape.children].forEach((t, k) => { t.className = tickCls(k); });
  let autoUntil = 0, settleT, noClick = 0, pan = null;
  const centre = (smooth) => { autoUntil = performance.now() + (smooth && !rm ? 700 : 120); tape.scrollTo({ left: h.past.length * 44, behavior: smooth && !rm ? 'smooth' : 'auto' }); };
  function drawTape(pop) {
    const was = tape.scrollLeft;
    tape.textContent = '';
    for (let k = 0; k <= taps.length; k++) {
      const t = mk(tickCls(k), 'button', tape);
      t.type = 'button'; t.dataset.k = k; t.innerHTML = `${mini(k)}<span>${k}</span>`;
      if (pop && !rm && k === taps.length) t.animate([{ transform: 'scale(.3)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 380, easing: SPRING });
    }
    tape.scrollLeft = was; centre(true);
  }
  tape.addEventListener('click', (e) => { if (Date.now() < noClick) return; const t = e.target.closest('.br-tick'); if (t) scrub(+t.dataset.k); });
  tape.addEventListener('scroll', () => {
    if (performance.now() < autoUntil) return;
    const k = Math.max(0, Math.min(taps.length, Math.round(tape.scrollLeft / 44)));
    if (k !== h.past.length) scrub(k, true);
    clearTimeout(settleT); settleT = setTimeout(() => centre(true), 160);
  });
  tape.addEventListener('wheel', () => { autoUntil = 0; }, { passive: true });
  tape.addEventListener('pointerdown', (e) => { autoUntil = 0; pan = e.pointerType === 'mouse' ? { x: e.clientX, left: tape.scrollLeft } : null; });
  tape.addEventListener('pointermove', (e) => { if (pan && e.buttons) { if (Math.abs(e.clientX - pan.x) > 4) noClick = Date.now() + 120; tape.scrollLeft = pan.left - (e.clientX - pan.x); } });
  for (const ev of ['pointerup', 'pointerleave']) tape.addEventListener(ev, () => { pan = null; });
  function scrub(k, live) {
    if (won || k === h.past.length || !snaps[k]) return;
    clearTimers(); sel = -1; to = null; mode = 'move'; h = snaps[k];
    rebuild(0); snd(k, 0, 0.04, 0.2); markTape(); if (!live) centre(true); finish();
  }

  function win() {
    won = true; refresh();
    later(() => {
      [0, 1, 2, 3, 4].forEach((k) => snd(k * 2 + 4, k * 0.1, 0.06, 0.36));
      for (const t of ['b', 'u']) E[t].forEach((el, k) => { const [r, c] = k.split(',').map(Number); anim(el.firstChild, [{ transform: 'scale(1)' }, { transform: 'scale(1.2,.84)', offset: 0.25 }, { transform: 'scale(.94,1.12)', offset: 0.55 }, { transform: 'scale(1)' }], 620, (r + c) * 60); });
      if (rm) return;
      [['circle', { cx: N / 2, cy: N / 2, r: N * 0.43 }], ['path', { d: `M${N * 0.26} ${N * 0.52}L${N * 0.44} ${N * 0.7}L${N * 0.76} ${N * 0.3}` }]].forEach(([tag, a], k) => { // approval stamp in white line
        const e = ink(tag, { ...a, fill: 'none', stroke: '#fff', 'stroke-width': 0.11, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': 1 });
        e.animate([{ strokeDashoffset: 1, opacity: 1 }, { strokeDashoffset: 0, opacity: 1, offset: 0.6 }, { strokeDashoffset: 0, opacity: 1, offset: 0.8 }, { strokeDashoffset: 0, opacity: 0 }], { duration: 1900, delay: 150 + k * 450, easing: 'ease-out', fill: 'both' });
      });
    }, busy ? 700 : 250);
    later(() => ctx.solved({ score: logic.score(S()) }), 900 + (busy ? 700 : 0));
  }

  const audioOn = () => audio();
  const settle = () => { clearTimers(); sel = -1; to = null; mode = 'move'; won = false; draft.textContent = ''; rebuild(0); drawTape(); finish(); };
  const api = {
    undo() { h = undo(h, logic.maxTries()); settle(); },
    reset() { h = reset(h, logic.maxTries()); taps = []; snaps = [h]; settle(); },
    destroy() {
      clearTimers(); clearTimeout(settleT); clearInterval(bedT);
      root.removeEventListener('pointerdown', audioOn);
      ac?.close?.(); ac = undefined;
      root.textContent = '';
      root.classList.remove('g-breach-turns', 'br-m', 'br-stuck');
    },
  };
  root.addEventListener('pointerdown', audioOn, { passive: true });
  rebuild(1); drawTape(); finish();
  return api;
}
