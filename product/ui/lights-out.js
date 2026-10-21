import * as logic from '../logic/lights-out.js';
import { newHistory, play, undo, reset } from '../logic/history.js';

const N = 5;
const NS = 'http://www.w3.org/2000/svg';
const SPRING = 'cubic-bezier(.34,1.56,.64,1)';
const URI = (s) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
const GRID1 = URI('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><path d="M40 0V40M0 40H40" fill="none" stroke="#1D6FA5" stroke-opacity=".4" stroke-width="1"/></svg>');
const GRID2 = URI('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><path d="M160 0V160M0 160H160" fill="none" stroke="#1D6FA5" stroke-opacity=".75" stroke-width="2"/><path d="M0 8H8M8 0V8" stroke="#EAF6FF" stroke-opacity=".35" stroke-width="1.5"/></svg>');

const GRAIN = URI('<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 1.4 0 0 0 -.45"/></filter><rect width="220" height="220" filter="url(#n)"/></svg>');
// drafting furniture: protractor arc with ticks and a registration mark (white lines, no words)
const PROT = URI('<svg xmlns="http://www.w3.org/2000/svg" width="190" height="190" fill="none" stroke="#EAF6FF" stroke-opacity=".3" stroke-width="1.2"><path d="M190 190V10A180 180 0 0 0 10 190Z"/><path d="M190 190V50A140 140 0 0 0 50 190"/>' + Array.from({ length: 19 }, (_, i) => { const a = i * Math.PI / 36, c = Math.cos(a), s = Math.sin(a), l = i % 3 ? 7 : 14; return `<path d="M${190 - 180 * c} ${190 - 180 * s}L${190 - (180 - l) * c} ${190 - (180 - l) * s}"/>`; }).join('') + '</svg>');
// monoline numerals 1 to 5 (the same pen that inks the grid), drawn in an 8 x 12 box
const NUM = ['M1.5 3.5L5 1V11', 'M1 3.5C1 .5 7 .5 7 3.5C7 6 1 8 1 11H7.5', 'M1 2C3 .5 7 1 6.5 3.5C6 5.5 3.5 5.5 3.5 5.5C7 5.5 7.5 8 6.5 10C5 12 2 11.5 1 10', 'M6.5 11V1L1 8H7.5', 'M7 1H2.5L1.5 5C5 3.5 7.5 5.5 7 8.5C6.5 11.5 3 12 1 10'];
const REG = URI('<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" stroke="#EAF6FF" stroke-opacity=".5" stroke-width="1.4"><circle cx="13" cy="13" r="6"/><path d="M13 1V25M1 13H25"/></svg>');

export const css = `
.g-lights-out { position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;
  min-height: 460px; padding: 16px; box-sizing: border-box; background: #0B3C5D; touch-action: manipulation; user-select: none; -webkit-user-select: none; }
.g-lights-out .lo-l { position: absolute; inset: 0; pointer-events: none; }
.g-lights-out .lo-l0 { background-image: ${GRAIN}; background-size: 220px 220px; opacity: .1; }
.g-lights-out .lo-l3 { background: ${PROT} right -14px bottom -14px / 190px 190px no-repeat; }
.g-lights-out .lo-reg { position: absolute; width: 26px; height: 26px; background: ${REG}; pointer-events: none; }
.g-lights-out .lo-l1 { background-image: ${GRID1}; background-size: 40px 40px; animation: lo-d1 80s linear infinite; }
.g-lights-out .lo-l2 { background-image: ${GRID2}; background-size: 160px 160px; animation: lo-d2 130s linear infinite reverse; }
@keyframes lo-d1 { to { background-position: 40px 80px; } }
@keyframes lo-d2 { to { background-position: 160px 160px; } }
.g-lights-out .lo-frame { position: relative; width: min(100%, 340px); padding: 22px 0 0 22px; box-sizing: border-box; }
.g-lights-out .lo-nums { position: absolute; display: grid; font: 600 10px/1 ui-monospace, Menlo, monospace; color: #EAF6FF; opacity: .6; text-align: center; align-items: center; }
.g-lights-out .lo-nums svg { width: 8px; height: 13px; display: block; margin: auto; overflow: visible; fill: none; stroke: #EAF6FF; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.g-lights-out .lo-top { left: 22px; right: 0; top: 4px; grid-template-columns: repeat(${N}, 1fr); }
.g-lights-out .lo-side { top: 22px; bottom: 0; left: 4px; grid-template-rows: repeat(${N}, 1fr); }
.g-lights-out .lo-corner { position: absolute; width: 12px; height: 12px; border: 0 solid #EAF6FF; }
.g-lights-out .lo-c1 { left: 16px; top: 16px; border-width: 2px 0 0 2px; } .g-lights-out .lo-c2 { right: -6px; top: 16px; border-width: 2px 2px 0 0; }
.g-lights-out .lo-c3 { left: 16px; bottom: -6px; border-width: 0 0 2px 2px; } .g-lights-out .lo-c4 { right: -6px; bottom: -6px; border-width: 0 2px 2px 0; }
.g-lights-out .lo-board { position: relative; isolation: isolate; display: grid; grid-template-columns: repeat(${N}, 1fr); gap: 6px; aspect-ratio: 1; }
.g-lights-out .lo-draft { position: absolute; z-index: 2; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
.g-lights-out .lo-cell { all: unset; box-sizing: border-box; position: relative; z-index: 1; min-width: 44px; min-height: 44px; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.g-lights-out .lo-cell:focus-visible { outline: 2px dashed #EAF6FF; outline-offset: 2px; border-radius: 16px; }
.g-lights-out.lo-m .lo-on { transform-origin: var(--ox, 50% 62%); animation: lo-br var(--dur, 3.6s) ease-in-out infinite; animation-delay: calc(var(--i) * -.37s); }
@keyframes lo-br { 35% { transform: scale(calc(var(--bx, 1.03) - .012), calc(var(--by, .975) + .02)) rotate(calc(var(--rt, 0deg) * -.6)); } 70% { transform: scale(var(--bx, 1.03), var(--by, .975)) rotate(var(--rt, 0deg)); } }
.g-lights-out.lo-m .lo-corner { animation: lo-fi .9s ease-out .5s backwards; }
@keyframes lo-fi { from { opacity: 0; } }
.g-lights-out .lo-strand { position: absolute; z-index: 0; border-radius: 999px; pointer-events: none; background: linear-gradient(var(--sd, 180deg), var(--jl2), var(--jb) 45%, var(--jd2)); opacity: 0; }
.g-lights-out .lo-b { position: absolute; inset: 0; border-radius: 40%; --j: #0F4D77; --jl: #1B6A9C; --jd: #0A3A5C;
  background: radial-gradient(ellipse 70% 55% at 36% 24%, var(--jl) 0, transparent 70%), radial-gradient(circle at 50% 60%, var(--j) 0, var(--jd) 100%);
  box-shadow: inset 0 0 0 2px #EAF6FF, inset 0 -6px 9px rgba(0,0,0,.28), 0 5px 0 -1px rgba(4,26,46,.45);
  transition: background-color .3s cubic-bezier(.215,.61,.355,1), box-shadow .3s cubic-bezier(.215,.61,.355,1), translate .12s ease-out, rotate .12s ease-out, scale .12s ease-out; }
.g-lights-out .lo-b::after { content: ''; position: absolute; left: 18%; right: 34%; top: 10%; height: 20%; border-radius: 50%; background: #fff; opacity: .16; transition: opacity .3s cubic-bezier(.215,.61,.355,1); }
.g-lights-out .lo-b::before { content: ''; position: absolute; left: 50%; top: 50%; width: 22%; height: 22%; margin: -11%; border-radius: 50%; background: #0B3C5D; opacity: 0; transition: opacity .3s; }
.g-lights-out .lo-c0, .g-lights-out .lo-k0 { --jb: #FFE066; --jl2: #FFF6B8; --jd2: #E9A91F; --gl: 255,224,102; }
.g-lights-out .lo-c1, .g-lights-out .lo-k1 { --jb: #B6E36B; --jl2: #E6FBB6; --jd2: #6FAE34; --gl: 182,227,107; }
.g-lights-out .lo-c2, .g-lights-out .lo-k2 { --jb: #FF8FB1; --jl2: #FFD3E0; --jd2: #DB4F7C; --gl: 255,143,177; }
.g-lights-out .lo-on .lo-b { --j: var(--jb); --jl: var(--jl2); --jd: var(--jd2);
  box-shadow: inset 0 -7px 10px rgba(0,0,0,.2), inset 0 4px 8px rgba(255,255,255,.35), 0 5px 0 -1px rgba(4,26,46,.35), 0 0 20px rgba(var(--gl),.55); }
.g-lights-out .lo-on .lo-b::after { opacity: .85; }
.g-lights-out .lo-on .lo-b::before { opacity: .2; }
.g-lights-out.lo-won .lo-b { box-shadow: inset 0 0 0 3px #fff, inset 0 -6px 9px rgba(0,0,0,.2), 0 0 18px rgba(234,246,255,.6); }
.g-lights-out .lo-blob { position: absolute; left: 50%; top: 50%; width: 22px; height: 22px; margin: -11px; border-radius: 45%; pointer-events: none;
  background: radial-gradient(circle at 35% 28%, #fff9 0 18%, transparent 22%), var(--jb); }
.g-lights-out .lo-row { display: flex; align-items: flex-start; gap: 10px; width: min(100%, 340px); }
.g-lights-out .lo-title { position: relative; flex: none; width: 84px; height: 40px; margin-top: 3px; box-sizing: border-box; padding: 2px; display: grid; grid-template-columns: 1fr 2px 1fr; align-items: center; text-align: center;
  font: 600 11px/1 ui-monospace, Menlo, monospace; color: #EAF6FF; }
.g-lights-out .lo-title i { align-self: stretch; background: #EAF6FF; transform-origin: 50% 0; }
.g-lights-out .lo-box { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; fill: none; stroke: #EAF6FF; stroke-width: 2; stroke-linejoin: round; }
.g-lights-out .lo-tape { position: relative; flex: 1; min-width: 0; height: 68px; border-top: 2px solid #EAF6FF; display: flex; overflow-x: auto; overflow-y: hidden; scrollbar-width: none; touch-action: pan-x; box-sizing: border-box; }
.g-lights-out .lo-tape::before, .g-lights-out .lo-tape::after { content: ''; flex: none; width: calc(50% - 22px); }
.g-lights-out .lo-tape::-webkit-scrollbar { display: none; }
.g-lights-out .lo-tick { all: unset; flex: none; box-sizing: border-box; position: relative; width: 44px; min-height: 44px; padding-top: 13px; border-left: 1px solid rgba(234,246,255,.55); display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; -webkit-tap-highlight-color: transparent;
  font: 600 10px/1 ui-monospace, Menlo, monospace; color: #EAF6FF; transition: opacity .3s cubic-bezier(.215,.61,.355,1), background-color .3s; }
.g-lights-out .lo-tick::before { content: ''; position: absolute; left: 0; right: 0; top: 0; height: 6px; background: repeating-linear-gradient(90deg, rgba(234,246,255,.5) 0 1px, transparent 1px 11px); }
.g-lights-out .lo-tick:focus-visible { outline: 2px dashed #EAF6FF; outline-offset: -3px; }
.g-lights-out .lo-fut { opacity: .38; }
.g-lights-out .lo-cur { background: rgba(255,224,102,.14); color: #FFE066; }
.g-lights-out .lo-cur::after { content: ''; position: absolute; left: 0; right: 0; top: -3px; height: 4px; border-radius: 2px; background: #FFE066; }
.g-lights-out .lo-map { display: grid; grid-template-columns: repeat(${N}, 5px); gap: 2px; }
.g-lights-out .lo-map i { width: 5px; height: 5px; border-radius: 50%; background: #EAF6FF; opacity: .3; }
.g-lights-out .lo-map i.p { background: #FFE066; opacity: 1; }
.g-lights-out .lo-map i.q { outline: 1px solid #FF8FB1; outline-offset: 1px; opacity: 1; }
`;

// the game's own rubber voice (ctx.sound is a plain square wave); the context is made on the first tap
const SC = [0, 3, 5, 7, 10];
let ac, bedT;
// calm string bed (detuned saws through a low-pass, a slow minor loop) and a soft clockwork tick-tock; both stop in destroy
const CHORDS = [[0, 7, 12, 15], [-2, 5, 10, 15], [-4, 3, 8, 12], [-2, 5, 10, 14]];
function bed() {
  const out = ac.createGain(), lp = ac.createBiquadFilter(), voices = [];
  out.gain.value = 0.0001; out.gain.setTargetAtTime(0.05, ac.currentTime, 2); lp.type = 'lowpass'; lp.frequency.value = 700;
  lp.connect(out); out.connect(ac.destination);
  for (let v = 0; v < 4; v++) for (const dt of [-7, 7]) { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sawtooth'; o.detune.value = dt; g.gain.value = 0.12; o.connect(g).connect(lp); o.start(); voices.push([o, v]); }
  let n = 0;
  const chord = () => voices.forEach(([o, v]) => o.frequency.setTargetAtTime(123.5 * 2 ** (CHORDS[(n / 9 | 0) % 4][v] / 12), ac.currentTime, 1.2));
  chord();
  bedT = setInterval(() => {
    if (document.hidden) return;
    const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
    o.type = 'square'; o.frequency.value = n % 2 ? 1100 : 1500; g.gain.setValueAtTime(0.011, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + 0.04);
    if (++n % 9 === 0) chord();
  }, 900);
}
const audio = () => {
  if (ac === undefined) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); bed(); } catch { ac = null; } }
  if (ac && ac.state === 'suspended') ac.resume();
  return ac;
};
function boing(i, delay, vol, len) { // pitch dips, springs up past the note, then wobbles in
  const f = 247 * 2 ** ((SC[((i % 5) + 5) % 5] + 12 * (Math.floor(i / 5) & 1)) / 12), t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
  o.type = 'triangle';
  o.frequency.setValueCurveAtTime(Float32Array.from([0.72, 1.5, 0.88, 1.2, 0.96, 1.06, 1, 1.02], (k) => f * k), t, len);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.08);
  o.connect(g).connect(ac.destination); o.start(t); o.stop(t + len + 0.1);
  if (vol > 0.05) { // soft drafting click under the pressed bulb
    const c = ac.createOscillator(), cg = ac.createGain();
    c.type = 'square'; c.frequency.value = 1700; cg.gain.setValueAtTime(0.02, t); cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);
    c.connect(cg).connect(ac.destination); c.start(t); c.stop(t + 0.03);
  }
}

export function mount(root, ctx) {
  root.classList.add('g-lights-out');
  const level = logic.makeLevel(ctx.level);
  const best = logic.bestScore(level);
  const rm = ctx.reduceMotion;
  let h = newHistory(logic.initialState(level));
  let won = false, taps = [], snaps = [h]; // snaps[k] is the history after k presses: the tape scrubs between them
  const timers = new Set();
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
  const mk = (cls, tag = 'div', parent = root) => { const e = document.createElement(tag); e.className = cls; parent.appendChild(e); return e; };
  const snd = (i, delay = 0, vol = 0.07, len = 0.34) => { if (audio()) boing(i, delay, vol, len); else later(() => ctx.sound.move(i), delay * 1000); };

  root.textContent = '';
  if (!rm) root.classList.add('lo-m');
  mk('lo-l lo-l0');
  if (!rm) { mk('lo-l lo-l1'); mk('lo-l lo-l2'); }
  mk('lo-l lo-l3');
  for (const pos of ['left:10px;top:10px', 'right:10px;top:10px']) mk('lo-reg').style.cssText = pos;
  const frame = mk('lo-frame');
  for (const cls of ['lo-top', 'lo-side']) {
    const d = mk('lo-nums ' + cls, 'div', frame);
    for (let i = 1; i <= N; i++) {
      const sp = mk('', 'span', d);
      sp.setAttribute('aria-label', i);
      sp.innerHTML = `<svg viewBox="0 0 8 12"><path d="${NUM[i - 1]}" pathLength="1" stroke-dasharray="1"/></svg>`;
      if (!rm) sp.firstChild.firstChild.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 520, delay: 250 + (i + (cls === 'lo-side' ? 0.5 : 0)) * 110, easing: 'ease-out', fill: 'backwards' });
    }
  }
  for (let i = 1; i <= 4; i++) mk('lo-corner lo-c' + i, 'div', frame);
  const board = mk('lo-board', 'div', frame);
  const T0 = rm ? 0 : 950; // the blueprint is inked first, then the jelly pops into it
  // a held bulb stretches toward the finger and squashes; its neighbours lean in. Letting go springs them back; sliding well off the bulb cancels the press
  let held = -1, skipUntil = 0;
  const lean = (el, tx, ty, ang, sx, sy) => { el.style.translate = `${tx}px ${ty}px`; el.style.rotate = ang + 'deg'; el.style.scale = `${sx} ${sy}`; };
  const relax = (el) => {
    if (!el.style.scale) return;
    if (!rm) el.animate([{ translate: el.style.translate, rotate: el.style.rotate, scale: el.style.scale }, { translate: '0px 0px', rotate: '0deg', scale: '1 1' }], { duration: 480, easing: SPRING });
    el.style.translate = el.style.rotate = el.style.scale = '';
  };
  const push = (i, e) => {
    if (rm) return;
    const rc = cells[i].getBoundingClientRect(), vx = e.clientX - rc.left - rc.width / 2, vy = e.clientY - rc.top - rc.height / 2, d = Math.hypot(vx, vy) || 1, k = Math.min(d / (rc.width * 0.7), 1), m = Math.min(d * 0.3, 9);
    lean(cells[i].firstChild, (vx / d) * m, (vy / d) * m, k > 0.05 ? (Math.atan2(vy, vx) * 180) / Math.PI : 0, 1.06 + 0.16 * k, 0.9 - 0.05 * k);
    if (e.type === 'pointerdown') nbrs(i).forEach(([a, b]) => lean(cells[a * N + b].firstChild, ((i % N) - b) * 3, (Math.floor(i / N) - a) * 3, 0, 1.04, 0.97));
  };
  const nbrs = (i) => [[-1, 0], [1, 0], [0, -1], [0, 1]].map(([a, b]) => [Math.floor(i / N) + a, (i % N) + b]).filter(([a, b]) => a >= 0 && b >= 0 && a < N && b < N);
  const drop = (i, e, up) => {
    if (held !== i) return;
    held = -1;
    const rc = cells[i].getBoundingClientRect();
    if (!up || Math.hypot(e.clientX - rc.left - rc.width / 2, e.clientY - rc.top - rc.height / 2) > rc.width * 0.85) skipUntil = performance.now() + 80;
    relax(cells[i].firstChild);
    nbrs(i).forEach(([a, b]) => relax(cells[a * N + b].firstChild));
  };
  const cells = Array.from({ length: N * N }, (_, i) => {
    const b = mk('lo-cell lo-c' + ((Math.floor(i / N) * 2 + i % N) % 3), 'button', board);
    b.type = 'button';
    b.style.cssText = `--i:${i};--dur:${(3 + (i * 7 % 11) / 8).toFixed(2)}s;--bx:${(1.02 + (i * 5 % 4) * 0.012).toFixed(3)};--by:${(0.985 - (i * 3 % 3) * 0.012).toFixed(3)};--rt:${((i % 3) - 1) * 0.9}deg;--ox:${40 + (i * 13 % 5) * 5}% ${58 + (i * 3 % 4) * 4}%`;
    mk('lo-b', 'div', b);
    b.addEventListener('click', () => { if (performance.now() > skipUntil) tap(i); });
    b.addEventListener('pointerdown', (e) => { if (!won) { held = i; skipUntil = 0; push(i, e); } });
    b.addEventListener('pointermove', (e) => { if (held === i) push(i, e); });
    for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) b.addEventListener(ev, (e) => drop(i, e, ev === 'pointerup'));
    if (!rm) b.firstChild.animate([{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 560, delay: T0 + ((i % N) + Math.floor(i / N)) * 50, easing: SPRING, fill: 'backwards' });
    return b;
  });
  // ink layer over the board: the blueprint drawing on load, dashed construction lines on each press, the approval mark on a win
  const draft = document.createElementNS(NS, 'svg');
  draft.setAttribute('class', 'lo-draft');
  draft.setAttribute('viewBox', '0 0 5 5');
  board.appendChild(draft);
  const ink = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); draft.appendChild(e); return e; };
  if (!rm) { // pen strokes: the frame, the grid lines, then a ring for every bulb; all fade out as the jelly arrives
    const pen = (tag, a, delay, dur) => {
      const e = ink(tag, { ...a, fill: 'none', stroke: '#EAF6FF', 'stroke-width': 0.04, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': 1 });
      e.animate([{ strokeDashoffset: 1, opacity: 0.9 }, { strokeDashoffset: 0, opacity: 0.9, offset: 0.5 }, { strokeDashoffset: 0, opacity: 0.9, offset: 0.78 }, { strokeDashoffset: 0, opacity: 0 }], { duration: dur, delay, easing: 'ease-in-out', fill: 'both' }).onfinish = () => e.remove();
    };
    pen('path', { d: 'M0 0H5V5H0Z' }, 0, 1500);
    for (let k = 1; k < N; k++) { pen('path', { d: `M${k} 0V5` }, 150 + k * 90, 1300); pen('path', { d: `M0 ${k}H5` }, 190 + k * 90, 1300); }
    for (let i = 0; i < N * N; i++) pen('circle', { cx: (i % N) + 0.5, cy: Math.floor(i / N) + 0.5, r: 0.38 }, 450 + i * 20, 1000);
  }
  const row = mk('lo-row');
  const tape = mk('lo-tape', 'div', row);
  const title = mk('lo-title', 'div', row);
  title.innerHTML = `<svg class="lo-box" viewBox="0 0 84 40"><rect x="1" y="1" width="82" height="38" pathLength="1" stroke-dasharray="1"/></svg><b>${String(ctx.level).padStart(2, '0')}</b><i></i><b>${N}×${N}</b>`;
  if (!rm) { // the title box and the tape rule are inked after the grid; the numerals and ticks appear as the pen passes
    title.firstChild.firstChild.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 900, delay: 600, easing: 'ease-in-out', fill: 'backwards' });
    title.querySelector('i').animate([{ transform: 'scaleY(0)' }, { transform: 'none' }], { duration: 300, delay: 1350, easing: 'ease-out', fill: 'backwards' });
    title.querySelectorAll('b').forEach((b) => b.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 1300, fill: 'backwards' }));
    tape.animate([{ clipPath: 'inset(-4px 100% -4px 0)' }, { clipPath: 'inset(-4px 0 -4px 0)' }], { duration: 1100, delay: 700, easing: 'ease-in-out', fill: 'backwards' });
  }

  const hud = () => ctx.hud({ moves: h.present.moves, best, tries: h.tries, maxTries: logic.maxTries(), canUndo: h.past.length > 0 });
  const paint = () => cells.forEach((c, i) => c.classList.toggle('lo-on', !!h.present.grid[i]));
  // the tape: tick 0 is the start, tick k is press k; tap a tick to rewind or fast-forward to it
  const tickCls = (k) => 'lo-tick' + (k === h.past.length ? ' lo-cur' : k > h.past.length ? ' lo-fut' : '');
  const markTape = () => [...tape.children].forEach((t, k) => { t.className = tickCls(k); });
  let autoUntil = 0, settleT;
  const centre = (smooth) => { // tick k centres at scrollLeft = 44 k (the tape has half-width spacers at both ends)
    autoUntil = performance.now() + (smooth && !rm ? 700 : 120);
    tape.scrollTo({ left: h.past.length * 44, behavior: smooth && !rm ? 'smooth' : 'auto' });
  };
  const tick = (k, pop) => {
    const t = mk(tickCls(k), 'button', tape);
    t.type = 'button'; t.dataset.k = k;
    const m = mk('lo-map', 'div', t), grid = snaps[k].present.grid; // the real board after press k; the pressed bulb is ringed
    for (let j = 0; j < N * N; j++) mk((grid[j] ? 'p' : '') + (k && j === taps[k - 1] ? ' q' : ''), 'i', m);
    mk('', 'span', t).textContent = k;
    if (pop && !rm) t.animate([{ transform: 'scale(.3)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 380, easing: SPRING });
    return t;
  };
  const drawTape = (pop) => {
    const was = tape.scrollLeft;
    tape.textContent = '';
    for (let k = 0; k <= taps.length; k++) tick(k, pop && k === taps.length);
    tape.scrollLeft = was;
    centre(true);
  };
  tape.addEventListener('click', (e) => { if (Date.now() < noClick) return; const t = e.target.closest('.lo-tick'); if (t) scrub(+t.dataset.k); });
  // drag-scrub: whatever tick sits under the centre line is the board you see; let go and the tape settles on it
  tape.addEventListener('scroll', () => {
    if (performance.now() < autoUntil) return;
    const k = Math.max(0, Math.min(taps.length, Math.round(tape.scrollLeft / 44)));
    if (k !== h.past.length) scrub(k, true);
    clearTimeout(settleT);
    settleT = setTimeout(() => centre(true), 160);
  });
  let noClick = 0, pan = null;
  tape.addEventListener('wheel', () => { autoUntil = 0; }, { passive: true });
  tape.addEventListener('pointerdown', (e) => { autoUntil = 0; pan = e.pointerType === 'mouse' ? { x: e.clientX, left: tape.scrollLeft } : null; }); // a finger already pans natively
  tape.addEventListener('pointermove', (e) => { if (pan && e.buttons) { if (Math.abs(e.clientX - pan.x) > 4) noClick = Date.now() + 120; tape.scrollLeft = pan.left - (e.clientX - pan.x); } });
  for (const ev of ['pointerup', 'pointerleave']) tape.addEventListener(ev, () => { pan = null; });

  function anim(el, frames, duration) {
    if (!rm) el.animate(frames, { duration, easing: SPRING });
  }
  function guide(r, c) {
    if (rm) return;
    const x = c + 0.5, y = r + 0.5, st = { fill: 'none', stroke: '#EAF6FF', 'stroke-width': 0.035, 'stroke-linecap': 'round' };
    [ink('path', { ...st, d: `M${x - 1.5} ${y}H${x + 1.5}M${x} ${y - 1.5}V${y + 1.5}`, 'stroke-dasharray': '.14 .1' }), ink('circle', { ...st, cx: x, cy: y, r: 0.62, 'stroke-dasharray': '.08 .08' })].forEach((e) => {
      e.style.cssText = 'transform-box:fill-box;transform-origin:center';
      e.animate([{ opacity: 0, transform: 'scale(.6)' }, { opacity: 0.9, transform: 'scale(1)', offset: 0.25 }, { opacity: 0, transform: 'scale(1.04)' }], { duration: 950, easing: 'ease-out' }).onfinish = () => e.remove();
    });
  }
  // a jelly strand reaches from the pressed bulb to a neighbour, and the neighbour leans in along it
  function pull(i, a, b) {
    if (rm) return;
    const p = cells[i], q = cells[a * N + b], horiz = a === Math.floor(i / N), fwd = horiz ? b > i % N : a > Math.floor(i / N);
    const s = mk('lo-strand lo-k' + [...p.classList].find((x) => /^lo-c\d$/.test(x)).slice(4), 'div', board), th = p.offsetHeight * 0.52;
    const [x0, y0] = [p.offsetLeft + p.offsetWidth / 2, p.offsetTop + p.offsetHeight / 2];
    s.style.cssText += horiz ? `left:${Math.min(x0, q.offsetLeft + q.offsetWidth / 2)}px;top:${y0 - th / 2}px;width:${Math.abs(q.offsetLeft - p.offsetLeft)}px;height:${th}px;--sd:180deg;transform-origin:${fwd ? '0' : '100%'} 50%` : `left:${x0 - th / 2}px;top:${Math.min(y0, q.offsetTop + q.offsetHeight / 2)}px;width:${th}px;height:${Math.abs(q.offsetTop - p.offsetTop)}px;--sd:90deg;transform-origin:50% ${fwd ? '0' : '100%'}`;
    const sc = (k) => (horiz ? `scale(${k},1)` : `scale(1,${k})`);
    s.animate([{ transform: sc(0), opacity: 0.95 }, { transform: sc(1), opacity: 0.95, offset: 0.3 }, { transform: sc(0.15), opacity: 0.7, offset: 0.7 }, { transform: sc(0), opacity: 0 }], { duration: 560, easing: 'ease-in-out' }).onfinish = () => s.remove();
    const o = horiz ? (fwd ? '100% 50%' : '0% 50%') : (fwd ? '50% 100%' : '50% 0%'), sq = (x, y) => (horiz ? `scale(${x},${y})` : `scale(${y},${x})`);
    q.firstChild.animate([{ transform: 'scale(1)', transformOrigin: o }, { transform: sq(1.26, 0.84), transformOrigin: o, offset: 0.3 }, { transform: sq(0.9, 1.1), transformOrigin: o, offset: 0.62 }, { transform: 'scale(1)', transformOrigin: o }], { duration: 480, easing: SPRING });
  }
  function tap(i) {
    if (won) return;
    h = play(h, logic, { cell: i });
    taps = taps.slice(0, h.past.length - 1).concat(i);
    snaps = snaps.slice(0, h.past.length).concat(h);
    snd(i, 0, 0.08, 0.4);
    const r = Math.floor(i / N), c = i % N;
    guide(r, c);
    anim(cells[i].firstChild, [{ transform: 'scale(1)' }, { transform: 'scale(1.16,.78)', offset: 0.3 }, { transform: 'scale(.94,1.1)', offset: 0.65 }, { transform: 'scale(1)' }], 380);
    [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].forEach(([a, b], k) => {
      if (a < 0 || b < 0 || a >= N || b >= N) return;
      snd(i + 2 + k, 0.055 * (k + 1), 0.035, 0.28);
      pull(i, a, b);
    });
    cells.forEach((el, j) => { // second ring: a faint ripple travels on through the jelly, with uneven delay
      const d = Math.abs(Math.floor(j / N) - r) + Math.abs(j % N - c);
      if (d === 2 && !rm) el.firstChild.animate([{ transform: 'scale(1)' }, { transform: `scale(${1.045},${.96}) rotate(${(j % 2 ? 2 : -2)}deg)`, offset: 0.4 }, { transform: 'scale(1)' }], { duration: 500, delay: 120 + (j % 3) * 30, easing: SPRING });
    });
    if (!rm) { // a wave rolls through the whole jelly, from the board corner nearest the press to the far one
      const sr = r <= 2 ? 0 : N - 1, sc = c <= 2 ? 0 : N - 1;
      cells.forEach((el, j) => {
        const dist = Math.abs(Math.floor(j / N) - sr) + Math.abs(j % N - sc);
        el.animate([{ transform: 'none' }, { transform: 'translateY(-3px) scale(1.03,.975)', offset: 0.4 }, { transform: 'none' }], { duration: 520, delay: 60 + dist * 45, easing: 'ease-in-out' });
      });
    }
    paint();
    drawTape(true);
    hud();
    if (logic.isSolved(h.present)) win(i);
  }
  function scrub(k, live) {
    if (won || k === h.past.length || !snaps[k]) return;
    for (const t of timers) clearTimeout(t);
    timers.clear();
    const was = h.present.grid;
    h = snaps[k];
    cells.forEach((c, j) => was[j] !== h.present.grid[j] && anim(c.firstChild, [{ transform: 'scale(1)' }, { transform: 'scale(.82,1.14)', offset: 0.35 }, { transform: 'scale(1.06,.95)', offset: 0.7 }, { transform: 'scale(1)' }], 360));
    snd(k, 0, 0.05, 0.22);
    paint();
    markTape();
    if (!live) centre(true);
    hud();
  }

  function win(i) {
    won = true;
    const r0 = Math.floor(i / N), c0 = i % N;
    later(() => {
      [0, 1, 2, 3, 4].forEach((k) => snd(k * 2 + 4, k * 0.1, 0.06, 0.36));
      root.classList.add('lo-won');
      cells.forEach((c, k) => {
        const d = (Math.abs(Math.floor(k / N) - r0) + Math.abs(k % N - c0)) * 60;
        snd(k % N + Math.floor(k / N), d / 1000, 0.03, 0.22);
        if (!rm) c.firstChild.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.22,.86)', offset: 0.25 }, { transform: 'scale(.92,1.14)', offset: 0.55 }, { transform: 'scale(1)' }], { duration: 620, delay: d, easing: SPRING });
        if (!rm) c.firstChild.animate([{ boxShadow: 'inset 0 0 0 2px #EAF6FF, 0 0 0 0 rgba(234,246,255,.9)' }, { boxShadow: 'inset 0 0 0 2px #EAF6FF, 0 0 0 16px rgba(234,246,255,0)' }], { duration: 750, delay: d, easing: 'ease-out' });
      });
      if (rm) return;
      // approval stamp: a circle and a check drawn in white line
      [['circle', { cx: 2.5, cy: 2.5, r: 2.15 }], ['path', { d: 'M1.3 2.6L2.2 3.5L3.8 1.5' }]].forEach(([tag, a], k) => {
        const e = ink(tag, { ...a, fill: 'none', stroke: '#fff', 'stroke-width': 0.11, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': 1 });
        e.animate([{ strokeDashoffset: 1, opacity: 1 }, { strokeDashoffset: 0, opacity: 1, offset: 0.6 }, { strokeDashoffset: 0, opacity: 1, offset: 0.8 }, { strokeDashoffset: 0, opacity: 0 }], { duration: 1900, delay: 150 + k * 450, easing: 'ease-out', fill: 'both' });
      });
      const cols = ['#FFE066', '#B6E36B', '#FF8FB1'];
      for (let k = 0; k < 12; k++) { // jelly blobs bounce up out of the board
        const bl = mk('lo-blob', 'div', frame), dx = (k - 5.5) * 24, up = 110 + (k % 4) * 30;
        bl.style.setProperty('--jb', cols[k % 3]);
        bl.animate([{ transform: 'translate(0,0) scale(.3)', opacity: 0 }, { transform: `translate(${dx * 0.6}px,${-up}px) scale(.95,1.15)`, opacity: 1, offset: 0.4 }, { transform: `translate(${dx}px,${40 + (k % 3) * 18}px) scale(1.25,.7)`, opacity: 0 }], { duration: 1200, delay: 120 + k * 60, easing: 'cubic-bezier(.215,.61,.355,1)', fill: 'backwards' }).onfinish = () => bl.remove();
      }
    }, 250);
    later(() => ctx.solved({ score: logic.score(h.present) }), 700);
  }

  const audioOn = () => audio(); // the strings start with the first touch
  const settle = () => { // after the shell's undo or reset
    for (const t of timers) clearTimeout(t);
    timers.clear();
    won = false;
    root.classList.remove('lo-won');
    draft.textContent = '';
    paint();
    drawTape();
    hud();
  };

  root.addEventListener('pointerdown', audioOn, { passive: true });
  paint();
  drawTape();
  hud();

  return {
    undo() { h = undo(h, logic.maxTries()); settle(); },
    reset() { h = reset(h, logic.maxTries()); taps = []; snaps = [h]; settle(); },
    destroy() {
      for (const t of timers) clearTimeout(t);
      timers.clear();
      clearTimeout(settleT);
      clearInterval(bedT);
      root.removeEventListener('pointerdown', audioOn);
      ac?.close?.();
      ac = undefined;
      root.textContent = '';
      root.classList.remove('g-lights-out');
    },
  };
}
