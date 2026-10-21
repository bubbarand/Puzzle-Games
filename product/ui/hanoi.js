import * as logic from '../logic/hanoi.js';
import { newHistory, play, undo, reset } from '../logic/history.js';

const NS = 'http://www.w3.org/2000/svg';
const SPRING = 'cubic-bezier(.34,1.56,.64,1)';
const EASE = 'cubic-bezier(.215,.61,.355,1)';
const URI = (s) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
const GRID1 = URI('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><path d="M40 0V40M0 40H40" fill="none" stroke="#1D6FA5" stroke-opacity=".4"/></svg>');
const GRID2 = URI('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><path d="M160 0V160M0 160H160" fill="none" stroke="#1D6FA5" stroke-opacity=".75" stroke-width="2"/><path d="M0 8H8M8 0V8" stroke="#EAF6FF" stroke-opacity=".35" stroke-width="1.5"/></svg>');
const GRAIN = URI('<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 1.4 0 0 0 -.45"/></filter><rect width="220" height="220" filter="url(#n)"/></svg>');
const REG = URI('<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" stroke="#EAF6FF" stroke-opacity=".5" stroke-width="1.4"><circle cx="13" cy="13" r="6"/><path d="M13 1V25M1 13H25"/></svg>');
const DH = 24; // disc height in px
const COL = ['#FF8FB1', '#FFE066', '#B6E36B', '#7FD6FF', '#C9A7FF', '#FFB26B', '#8CF0D0'];

export const css = `
.g-hanoi { position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px;
  min-height: 460px; padding: 16px; box-sizing: border-box; background: #0B3C5D; touch-action: manipulation; user-select: none; -webkit-user-select: none; }
.g-hanoi .hn-l { position: absolute; inset: 0; pointer-events: none; }
.g-hanoi .hn-l0 { background-image: ${GRAIN}; background-size: 220px 220px; opacity: .1; }
.g-hanoi .hn-l1 { background-image: ${GRID1}; background-size: 40px 40px; animation: hn-d1 80s linear infinite; }
.g-hanoi .hn-l2 { background-image: ${GRID2}; background-size: 160px 160px; animation: hn-d2 130s linear infinite reverse; }
@keyframes hn-d1 { to { background-position: 40px 80px; } }
@keyframes hn-d2 { to { background-position: 160px 160px; } }
.g-hanoi .hn-reg { position: absolute; width: 26px; height: 26px; background: ${REG}; pointer-events: none; }
.g-hanoi .hn-board { position: relative; z-index: 1; width: min(100%, 340px); height: var(--bh); }
.g-hanoi .hn-peg { all: unset; box-sizing: border-box; position: absolute; top: 0; bottom: 0; left: calc(var(--p) * 100% / var(--P)); width: calc(100% / var(--P)); cursor: pointer; -webkit-tap-highlight-color: transparent; min-width: 44px; transition: background-color .3s ${EASE}; border-radius: 14px; }
.g-hanoi .hn-peg:focus-visible { outline: 2px dashed #EAF6FF; outline-offset: -3px; }
.g-hanoi .hn-peg.on { background: rgba(255,224,102,.1); }
.g-hanoi .hn-rod { position: absolute; left: 50%; bottom: 14px; width: 4px; margin-left: -2px; height: var(--rh); border-radius: 2px 2px 0 0; background: #EAF6FF; opacity: .85; transform-origin: 50% 100%; transition: background-color .3s, box-shadow .3s; }
.g-hanoi .hn-rod::before { content: ''; position: absolute; left: -7px; right: -7px; bottom: 0; top: 0; background: repeating-linear-gradient(0deg, rgba(234,246,255,.6) 0 1px, transparent 1px ${DH}px); }
.g-hanoi .on .hn-rod { background: #FFE066; box-shadow: 0 0 10px rgba(255,224,102,.7); }
.g-hanoi .hn-base { position: absolute; left: 4%; right: 4%; bottom: 12px; height: 2px; background: #EAF6FF; opacity: .85; transform-origin: 0 50%; }
.g-hanoi .hn-base::before, .g-hanoi .hn-base::after { content: ''; position: absolute; top: -5px; height: 12px; width: 2px; background: #EAF6FF; }
.g-hanoi .hn-base::after { right: 0; }
.g-hanoi .hn-nums { position: absolute; left: 0; right: 0; bottom: -10px; display: flex; justify-content: center; }
.g-hanoi .hn-nums svg { width: 8px; height: 13px; overflow: visible; fill: none; stroke: #EAF6FF; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; opacity: .7; }
.g-hanoi .hn-goal { position: absolute; inset: 0 3px 2px; border: 2px dashed rgba(234,246,255,.5); border-radius: 14px; pointer-events: none; }
.g-hanoi .hn-stamp { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; z-index: 3; }
.g-hanoi .hn-d { position: absolute; z-index: 2; height: ${DH - 3}px; pointer-events: none; left: calc((var(--p) + .5) * 100% / var(--P)); bottom: var(--y); width: calc((30% + 62% * var(--x)) / var(--P)); transform: translateX(-50%); }
.g-hanoi .hn-j { position: absolute; inset: 0; border-radius: 999px; --jb: var(--c); --jl: color-mix(in srgb, var(--c), #fff 60%); --jd: color-mix(in srgb, var(--c), #000 28%);
  background: radial-gradient(ellipse 70% 60% at 36% 24%, var(--jl) 0, transparent 70%), radial-gradient(circle at 50% 60%, var(--jb) 0, var(--jd) 100%);
  box-shadow: inset 0 0 0 2px rgba(234,246,255,.9), inset 0 -4px 6px rgba(0,0,0,.2), 0 3px 0 -1px rgba(4,26,46,.45); display: grid; place-items: center; font: 700 10px/1 ui-monospace, Menlo, monospace; color: rgba(11,60,93,.75); }
.g-hanoi .hn-j::after { content: ''; position: absolute; left: 12%; right: 38%; top: 12%; height: 24%; border-radius: 50%; background: #fff; opacity: .5; }
.g-hanoi.hn-m .hn-j { animation: hn-br var(--dur) ease-in-out infinite; animation-delay: var(--dl); }
@keyframes hn-br { 50% { transform: scale(1.025, .96); } }
.g-hanoi .hn-lift .hn-j { box-shadow: inset 0 0 0 2px #fff, inset 0 -4px 6px rgba(0,0,0,.2), 0 0 16px rgba(255,255,255,.55); }
.g-hanoi .hn-blob { position: absolute; left: 50%; top: 40%; width: 20px; height: 20px; margin: -10px; border-radius: 45%; pointer-events: none; z-index: 4; background: radial-gradient(circle at 35% 28%, #fff9 0 18%, transparent 22%), var(--c); }
.g-hanoi .hn-row { position: relative; z-index: 1; display: flex; align-items: flex-start; gap: 10px; width: min(100%, 340px); }
.g-hanoi .hn-title { position: relative; flex: none; width: 84px; height: 40px; margin-top: 3px; box-sizing: border-box; padding: 2px; display: grid; grid-template-columns: 1fr 2px 1fr; align-items: center; text-align: center; font: 600 11px/1 ui-monospace, Menlo, monospace; color: #EAF6FF; }
.g-hanoi .hn-title i { align-self: stretch; background: #EAF6FF; transform-origin: 50% 0; }
.g-hanoi .hn-box { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; fill: none; stroke: #EAF6FF; stroke-width: 2; stroke-linejoin: round; }
.g-hanoi .hn-tape { position: relative; flex: 1; min-width: 0; height: 68px; border-top: 2px solid #EAF6FF; display: flex; overflow-x: auto; overflow-y: hidden; scrollbar-width: none; touch-action: pan-x; box-sizing: border-box; }
.g-hanoi .hn-tape::before, .g-hanoi .hn-tape::after { content: ''; flex: none; width: calc(50% - 22px); }
.g-hanoi .hn-tape::-webkit-scrollbar { display: none; }
.g-hanoi .hn-tick { all: unset; flex: none; box-sizing: border-box; position: relative; width: 44px; min-height: 44px; padding-top: 11px; border-left: 1px solid rgba(234,246,255,.55); display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; -webkit-tap-highlight-color: transparent;
  font: 600 10px/1 ui-monospace, Menlo, monospace; color: #EAF6FF; transition: opacity .3s ${EASE}, background-color .3s; }
.g-hanoi .hn-tick::before { content: ''; position: absolute; left: 0; right: 0; top: 0; height: 6px; background: repeating-linear-gradient(90deg, rgba(234,246,255,.5) 0 1px, transparent 1px 11px); }
.g-hanoi .hn-tick:focus-visible { outline: 2px dashed #EAF6FF; outline-offset: -3px; }
.g-hanoi .hn-fut { opacity: .38; }
.g-hanoi .hn-cur { background: rgba(255,224,102,.14); color: #FFE066; }
.g-hanoi .hn-cur::after { content: ''; position: absolute; left: 0; right: 0; top: -3px; height: 4px; border-radius: 2px; background: #FFE066; }
.g-hanoi .hn-tick svg { width: 36px; height: 18px; display: block; }
`;

// monoline numerals 1 to 9 for the peg labels (same pen as the ruler lines)
const NUM = ['M1.5 3.5L5 1V11', 'M1 3.5C1 .5 7 .5 7 3.5C7 6 1 8 1 11H7.5', 'M1 2C3 .5 7 1 6.5 3.5C6 5.5 3.5 5.5 3.5 5.5C7 5.5 7.5 8 6.5 10C5 12 2 11.5 1 10', 'M6.5 11V1L1 8H7.5'];

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
function boing(i, delay, vol, len, low) { // pitch dips, springs past the note, then wobbles in; low = a soft refused thud
  const f = (low ? 123 : 247) * 2 ** ((SC[((i % 5) + 5) % 5] + 12 * (Math.floor(i / 5) & 1)) / 12), t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
  o.type = 'triangle';
  o.frequency.setValueCurveAtTime(Float32Array.from(low ? [1.1, 0.9, 0.8, 0.75] : [0.72, 1.5, 0.88, 1.2, 0.96, 1.06, 1, 1.02], (k) => f * k), t, len);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.08);
  o.connect(g).connect(ac.destination); o.start(t); o.stop(t + len + 0.1);
}

export function mount(root, ctx) {
  root.classList.add('g-hanoi');
  const level = logic.makeLevel(ctx.level), P = level.pegs, D = level.discs;
  const best = logic.bestScore(level), rm = ctx.reduceMotion;
  let h = newHistory(logic.initialState(level)), sel = -1, won = false, taps = [], snaps = [h];
  const timers = new Set();
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
  const clearTimers = () => { for (const t of timers) clearTimeout(t); timers.clear(); };
  const mk = (cls, tag = 'div', parent = root) => { const e = document.createElement(tag); e.className = cls; parent.appendChild(e); return e; };
  const snd = (i, delay = 0, vol = 0.08, len = 0.34, low = false) => { if (audio()) boing(i, delay, vol, len, low); else later(() => ctx.sound.move(i), delay * 1000); };
  const anim = (el, frames, duration, delay = 0) => { if (!rm) el.animate(frames, { duration, delay, easing: SPRING }); };
  const squash = (el, k = 1) => anim(el, [{ transform: 'scale(1)' }, { transform: `scale(${1 + 0.16 * k},${1 - 0.22 * k})`, offset: 0.3 }, { transform: `scale(${1 - 0.05 * k},${1 + 0.1 * k})`, offset: 0.65 }, { transform: 'scale(1)' }], 400);

  root.textContent = '';
  if (!rm) root.classList.add('hn-m');
  mk('hn-l hn-l0');
  if (!rm) { mk('hn-l hn-l1'); mk('hn-l hn-l2'); }
  for (const pos of ['left:10px;top:10px', 'right:10px;top:10px']) mk('hn-reg').style.cssText = pos;
  const bh = (D + 1) * DH + 46, rh = (D + 1) * DH + 18, T0 = rm ? 0 : 900;
  const board = mk('hn-board');
  board.style.cssText = `--bh:${bh}px;--P:${P};--rh:${rh}px`;
  const pegs = Array.from({ length: P }, (_, p) => {
    const b = mk('hn-peg', 'button', board);
    b.type = 'button'; b.style.setProperty('--p', p);
    const rod = mk('hn-rod', 'div', b), base = mk('hn-base', 'div', b), nums = mk('hn-nums', 'div', b);
    nums.innerHTML = `<svg viewBox="0 0 8 12"><path d="${NUM[p]}"/></svg>`;
    if (p === P - 1) { // the goal peg: dashed target frame and an approval ring
      mk('hn-goal', 'div', b);
    }
    if (!rm) { // the rule is inked first: base line draws across, the rod grows up
      base.animate([{ transform: 'scaleX(0)' }, { transform: 'none' }], { duration: 700, delay: 150 + p * 120, easing: 'ease-in-out', fill: 'backwards' });
      rod.animate([{ transform: 'scaleY(0)' }, { transform: 'none' }], { duration: 800, delay: 400 + p * 120, easing: 'ease-in-out', fill: 'backwards' });
    }
    b.addEventListener('click', () => tapPeg(p));
    return b;
  });
  const goalBox = pegs[P - 1].querySelector('.hn-goal');
  const discs = Array.from({ length: D }, (_, i) => { // i = 0 is disc size 1 (smallest)
    const d = mk('hn-d', 'div', board), j = mk('hn-j', 'div', d);
    d.style.cssText = `--c:${COL[i % COL.length]};--x:${(i / (D - 1)).toFixed(3)};--P:${P};--dur:${(3 + (i * 7 % 11) / 8).toFixed(2)}s;--dl:${(-i * 0.37).toFixed(2)}s`;
    j.textContent = i + 1;
    if (!rm) j.animate([{ transform: 'translateY(-60px) scale(.2)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 560, delay: T0 + (D - i) * 60, easing: SPRING, fill: 'backwards' });
    return d;
  });
  const row = mk('hn-row');
  const tape = mk('hn-tape', 'div', row), title = mk('hn-title', 'div', row);
  title.innerHTML = `<svg class="hn-box" viewBox="0 0 84 40"><rect x="1" y="1" width="82" height="38" pathLength="1" stroke-dasharray="1"/></svg><b>${String(ctx.level).padStart(2, '0')}</b><i></i><b>${P}×${D}</b>`;
  if (!rm) {
    title.firstChild.firstChild.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 900, delay: 500, easing: 'ease-in-out', fill: 'backwards' });
    tape.animate([{ clipPath: 'inset(-4px 100% -4px 0)' }, { clipPath: 'inset(-4px 0 -4px 0)' }], { duration: 1100, delay: 600, easing: 'ease-in-out', fill: 'backwards' });
  }

  const hud = () => ctx.hud({ moves: h.present.moves, best, tries: h.tries, maxTries: logic.maxTries(), canUndo: h.past.length > 0 });
  // place every disc from the state; the mover (size index) gets the lift, slide, drop path
  function paint(mover = -1) {
    const s = h.present;
    s.pegs.forEach((stack, p) => stack.forEach((size, j) => {
      const d = discs[size - 1], lifted = p === sel && j === stack.length - 1;
      d.classList.toggle('hn-lift', lifted);
      d.style.transition = rm ? 'none' : size - 1 === mover ? `left .34s cubic-bezier(.45,.05,.3,1), bottom .42s ${SPRING} .2s` : `left .3s ${EASE}, bottom .36s ${SPRING}`;
      d.style.setProperty('--p', p);
      d.style.setProperty('--y', `${14 + (lifted ? D : j) * DH + (lifted ? 10 : 0)}px`);
      d.style.zIndex = lifted ? 5 : 2;
    }));
    pegs.forEach((b, p) => b.classList.toggle('on', p === sel));
  }
  function refuse(p) { // soft wobble: the held disc (or the empty peg) shivers, a low thud plays
    const d = sel >= 0 ? discs[h.present.pegs[sel].at(-1) - 1] : null;
    snd(p, 0, 0.05, 0.22, true);
    anim(d ? d.firstChild : pegs[p].querySelector('.hn-rod'), [{ transform: 'none' }, { transform: 'rotate(-5deg) translateX(-3px)' }, { transform: 'rotate(4deg) translateX(3px)' }, { transform: 'rotate(-2deg)' }, { transform: 'none' }], 460);
    const t = h.present.pegs[p].at(-1);
    if (t) anim(discs[t - 1].firstChild, [{ transform: 'none' }, { transform: 'translateX(-2px)' }, { transform: 'translateX(2px)' }, { transform: 'none' }], 320);
  }
  function tapPeg(p) {
    if (won) return;
    const s = h.present;
    if (sel < 0) {
      if (!s.pegs[p].length) return refuse(p);
      sel = p; paint();
      const d = discs[s.pegs[p].at(-1) - 1];
      snd(s.pegs[p].at(-1), 0, 0.06, 0.28); squash(d.firstChild, 0.6);
      return;
    }
    if (sel === p) { const sz = s.pegs[p].at(-1); sel = -1; paint(); snd(sz - 2, 0, 0.04, 0.22); return; }
    const n = play(h, logic, { from: sel, to: p });
    if (n === h) return refuse(p);
    const size = s.pegs[sel].at(-1);
    h = n; taps = taps.slice(0, h.past.length - 1).concat({ d: size }); snaps = snaps.slice(0, h.past.length).concat(h);
    sel = -1; paint(size - 1);
    snd(size + p, 0.2, 0.09, 0.4);
    later(() => squash(discs[size - 1].firstChild), rm ? 0 : 560);
    drawTape(true); hud();
    if (logic.isSolved(h.present)) win();
  }

  // the tape: tick 0 is the start, tick k is move k with a real mini-map of the pegs; tap or drag to rewind
  const tickCls = (k) => 'hn-tick' + (k === h.past.length ? ' hn-cur' : k > h.past.length ? ' hn-fut' : '');
  const mini = (k) => {
    const w = 36 / P, mv = k ? taps[k - 1].d : 0;
    return `<svg viewBox="0 0 36 18" fill="#EAF6FF">${snaps[k].present.pegs.map((st, p) => `<path d="M${p * w + 1} 17.5H${(p + 1) * w - 1}" stroke="#EAF6FF" stroke-opacity=".5"/>` + st.map((sz, j) => `<rect x="${(p + 0.5) * w - (w * (0.3 + 0.6 * sz / D)) / 2}" y="${15.2 - j * 2.1}" width="${w * (0.3 + 0.6 * sz / D)}" height="1.8" rx=".9" ${sz === mv ? 'fill="#FFE066"' : 'fill-opacity=".75"'}/>`).join('')).join('')}</svg>`;
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
  tape.addEventListener('click', (e) => { if (Date.now() < noClick) return; const t = e.target.closest('.hn-tick'); if (t) scrub(+t.dataset.k); });
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
    clearTimers(); sel = -1; h = snaps[k];
    paint(k ? taps[k - 1].d - 1 : -1); snd(k, 0, 0.04, 0.2);
    markTape(); if (!live) centre(true); hud();
  }

  function win() {
    won = true;
    later(() => {
      [0, 1, 2, 3, 4].forEach((k) => snd(k * 2 + 4, k * 0.1, 0.06, 0.36));
      discs.forEach((d, i) => anim(d.firstChild, [{ transform: 'scale(1)' }, { transform: 'scale(1.18,.8)', offset: 0.25 }, { transform: 'scale(.94,1.12)', offset: 0.55 }, { transform: 'scale(1)' }], 620, (D - i) * 70));
      if (rm) return;
      goalBox.style.borderStyle = 'solid';
      const st = document.createElementNS(NS, 'svg'); st.setAttribute('class', 'hn-stamp'); st.setAttribute('viewBox', '0 0 100 100');
      goalBox.parentNode.appendChild(st);
      [['circle', { cx: 50, cy: 38, r: 30 }], ['path', { d: 'M36 38L46 48L65 26' }]].forEach(([tag, a], k) => { // approval stamp in white line
        const e = document.createElementNS(NS, tag), at = { ...a, fill: 'none', stroke: '#fff', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': 1 };
        for (const q in at) e.setAttribute(q, at[q]);
        st.appendChild(e);
        e.animate([{ strokeDashoffset: 1, opacity: 1 }, { strokeDashoffset: 0, opacity: 1, offset: 0.6 }, { strokeDashoffset: 0, opacity: 1, offset: 0.8 }, { strokeDashoffset: 0, opacity: 0 }], { duration: 1900, delay: 150 + k * 450, easing: 'ease-out', fill: 'both' });
      });
      const x0 = (P - 0.5) * 100 / P;
      for (let k = 0; k < 10; k++) { // jelly blobs bounce up out of the goal peg
        const bl = mk('hn-blob', 'div', board), dx = (k - 4.5) * 14, up = 80 + (k % 4) * 24;
        bl.style.left = `${x0}%`; bl.style.setProperty('--c', COL[k % COL.length]);
        bl.animate([{ transform: 'translate(0,0) scale(.3)', opacity: 0 }, { transform: `translate(${dx * 0.6}px,${-up}px) scale(.95,1.15)`, opacity: 1, offset: 0.4 }, { transform: `translate(${dx}px,${60 + (k % 3) * 18}px) scale(1.25,.7)`, opacity: 0 }], { duration: 1200, delay: 120 + k * 60, easing: EASE, fill: 'backwards' }).onfinish = () => bl.remove();
      }
    }, rm ? 0 : 600);
    later(() => ctx.solved({ score: logic.score(h.present) }), 900);
  }

  const audioOn = () => audio(); // the strings start with the first touch
  const settle = () => {
    clearTimers(); won = false; sel = -1;
    goalBox.style.borderStyle = ''; goalBox.parentNode.querySelector('.hn-stamp')?.remove();
    paint(); drawTape(); hud();
  };
  root.addEventListener('pointerdown', audioOn, { passive: true });
  paint(); drawTape(); hud();

  return {
    undo() { h = undo(h, logic.maxTries()); settle(); },
    reset() { h = reset(h, logic.maxTries()); taps = []; snaps = [h]; settle(); },
    destroy() {
      clearTimers(); clearTimeout(settleT); clearInterval(bedT);
      root.removeEventListener('pointerdown', audioOn);
      ac?.close?.(); ac = undefined;
      root.textContent = '';
      root.classList.remove('g-hanoi', 'hn-m');
    },
  };
}
