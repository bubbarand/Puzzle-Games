import * as logic from '../logic/tower-fall.js';
import { newHistory, play, undo, reset } from '../logic/history.js';

const NS = 'http://www.w3.org/2000/svg';
const SPRING = 'cubic-bezier(.34,1.56,.64,1)';
const OUT = 'cubic-bezier(.215,.61,.355,1)';
const URI = (s) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
const GRID1 = URI('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><path d="M40 0V40M0 40H40" fill="none" stroke="#1D6FA5" stroke-opacity=".4"/></svg>');
const GRID2 = URI('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><path d="M160 0V160M0 160H160" fill="none" stroke="#1D6FA5" stroke-opacity=".75" stroke-width="2"/><path d="M0 8H8M8 0V8" stroke="#EAF6FF" stroke-opacity=".35" stroke-width="1.5"/></svg>');
const GRAIN = URI('<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 1.4 0 0 0 -.45"/></filter><rect width="220" height="220" filter="url(#n)"/></svg>');
const PROT = URI('<svg xmlns="http://www.w3.org/2000/svg" width="190" height="190" fill="none" stroke="#EAF6FF" stroke-opacity=".3" stroke-width="1.2"><path d="M190 190V10A180 180 0 0 0 10 190Z"/><path d="M190 190V50A140 140 0 0 0 50 190"/>' + Array.from({ length: 19 }, (_, i) => { const a = i * Math.PI / 36, c = Math.cos(a), s = Math.sin(a), l = i % 3 ? 7 : 14; return `<path d="M${190 - 180 * c} ${190 - 180 * s}L${190 - (180 - l) * c} ${190 - (180 - l) * s}"/>`; }).join('') + '</svg>');
const TOWER = '<ellipse cy="15" rx="16" ry="4" fill="#041A2E" opacity=".4"/><g class="tf-jel"><path d="M-14 14C-17 0-12-16 0-22C12-16 17 0 14 14Q0 19-14 14Z" fill="url(#tf-pk)" stroke="#EAF6FF" stroke-width="1.6" stroke-linejoin="round"/><ellipse cx="-6" cy="-7" rx="3.2" ry="7" fill="#fff" opacity=".55" transform="rotate(14 -6 -7)"/><circle cx="-4.5" cy="3" r="1.8" fill="#7A1F45"/><circle cx="4.5" cy="3" r="1.8" fill="#7A1F45"/><path d="M-3 8Q0 10.5 3 8" fill="none" stroke="#7A1F45" stroke-width="1.5" stroke-linecap="round"/><circle cy="-25" r="5.5" fill="url(#tf-bt)" stroke="#EAF6FF" stroke-width="1.4"/></g>';
const ENEMY = '<ellipse cy="11" rx="12" ry="3" fill="#041A2E" opacity=".4"/><g class="tf-body"><path d="M-12 9C-15-5-6-13 0-13S15-5 12 9Q0 14-12 9Z" fill="url(#tf-lm)" stroke="#EAF6FF" stroke-width="1.5" stroke-linejoin="round"/><ellipse cx="-5" cy="-6" rx="2.5" ry="4" fill="#fff" opacity=".5" transform="rotate(20 -5 -6)"/><circle cx="-4.5" cy="0" r="2.6" fill="#fff"/><circle cx="4.5" cy="0" r="2.6" fill="#fff"/><circle cx="-4" cy="0.6" r="1.2" fill="#0B3C5D"/><circle cx="5" cy="0.6" r="1.2" fill="#0B3C5D"/><path d="M-8-4L-2-2M8-4L2-2" stroke="#0B3C5D" stroke-width="1.6" stroke-linecap="round"/></g>';
const DEFS = '<defs><radialGradient id="tf-pk" cx=".4" cy=".25" r=".9"><stop offset="0" stop-color="#FFD3E0"/><stop offset=".5" stop-color="#FF8FB1"/><stop offset="1" stop-color="#DB4F7C"/></radialGradient><radialGradient id="tf-lm" cx=".4" cy=".25" r=".9"><stop offset="0" stop-color="#E6FBB6"/><stop offset=".5" stop-color="#B6E36B"/><stop offset="1" stop-color="#6FAE34"/></radialGradient><radialGradient id="tf-bt" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#FFF6B8"/><stop offset="1" stop-color="#E9A91F"/></radialGradient></defs>';

export const css = `
.g-tower-fall { position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; min-height: 520px; padding: 12px 0 16px; box-sizing: border-box; background: #0B3C5D; touch-action: manipulation; user-select: none; -webkit-user-select: none; }
.g-tower-fall .tf-l { position: absolute; inset: 0; pointer-events: none; }
.g-tower-fall .tf-l0 { background-image: ${GRAIN}; background-size: 220px 220px; opacity: .1; }
.g-tower-fall .tf-l1 { background-image: ${GRID1}; background-size: 40px 40px; animation: tf-d1 80s linear infinite; }
.g-tower-fall .tf-l2 { background-image: ${GRID2}; background-size: 160px 160px; animation: tf-d2 130s linear infinite reverse; }
.g-tower-fall .tf-l3 { background: ${PROT} right -14px bottom -14px / 190px 190px no-repeat; }
@keyframes tf-d1 { to { background-position: 40px 80px; } }
@keyframes tf-d2 { to { background-position: 160px 160px; } }
.g-tower-fall svg.tf-s { position: relative; width: 100%; max-width: 520px; height: auto; display: block; overflow: visible; }
.g-tower-fall .tf-hit { cursor: pointer; fill: rgba(0,0,0,0); -webkit-tap-highlight-color: transparent; }
.g-tower-fall .tf-fx, .g-tower-fall .tf-en, .g-tower-fall .tf-rng { pointer-events: none; }
.g-tower-fall .tf-en { transition: transform .26s ${OUT}; }
.g-tower-fall.tf-rm .tf-en { transition: none; }
.g-tower-fall .tf-jel, .g-tower-fall .tf-body, .g-tower-fall .tf-win, .g-tower-fall .tf-tw { transform-box: fill-box; transform-origin: 50% 100%; }
.g-tower-fall.tf-m .tf-jel { animation: tf-w 3.4s ease-in-out infinite; }
.g-tower-fall.tf-m .tf-body { animation: tf-w 1.7s ease-in-out infinite; }
@keyframes tf-w { 40% { transform: scale(1.04, .95); } 75% { transform: scale(.97, 1.04) rotate(.8deg); } }
.g-tower-fall.tf-m .tf-pad { animation: tf-p 2.2s ease-in-out infinite; }
@keyframes tf-p { 50% { opacity: .35; } }
.g-tower-fall.tf-m .tf-flow { animation: tf-f 1.2s linear infinite; }
@keyframes tf-f { to { stroke-dashoffset: -12; } }
.g-tower-fall .tf-te { transition: opacity .4s ${OUT}; }
.g-tower-fall .tf-te.past { opacity: .22; }
.g-tower-fall .tf-head { transition: transform .3s ${OUT}; }
.g-tower-fall .tf-bar { position: relative; display: flex; align-items: center; justify-content: center; gap: 14px; min-height: 60px; }
.g-tower-fall .tf-tray { display: flex; gap: 6px; align-items: flex-end; }
.g-tower-fall .tf-ti { width: 30px; height: 40px; overflow: visible; transition: opacity .4s ${OUT}, transform .4s ${SPRING}; }
.g-tower-fall .tf-ti.used { opacity: .3; transform: scale(.8); filter: grayscale(1); }
.g-tower-fall .tf-go { all: unset; box-sizing: border-box; width: 60px; height: 60px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; background: radial-gradient(ellipse 60% 40% at 36% 24%, #FFF6B8 0, transparent 70%), radial-gradient(circle at 50% 60%, #FFE066, #E9A91F); box-shadow: inset 0 -5px 8px rgba(0,0,0,.2), inset 0 3px 6px rgba(255,255,255,.5), 0 4px 0 -1px rgba(4,26,46,.45), 0 0 20px rgba(255,224,102,.5); transition: transform .3s ${SPRING}; -webkit-tap-highlight-color: transparent; }
.g-tower-fall .tf-go:active { transform: scale(.9, .84); }
.g-tower-fall .tf-go:disabled { opacity: .4; }
.g-tower-fall .tf-go svg { width: 26px; height: 26px; fill: #0B3C5D; margin-left: 3px; }
.g-tower-fall .tf-go.ff svg { margin-left: 0; }
.g-tower-fall .tf-go:focus-visible { outline: 2px dashed #EAF6FF; outline-offset: 3px; }
`;

const SC = [0, 3, 5, 7, 10];
let ac;
function pad() {
  const out = ac.createGain(), lp = ac.createBiquadFilter();
  out.gain.value = 0.0001; out.gain.setTargetAtTime(0.04, ac.currentTime, 2); lp.type = 'lowpass'; lp.frequency.value = 650; lp.connect(out); out.connect(ac.destination);
  [0, 7, 12, 15].forEach((st) => [-7, 7].forEach((dt) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sawtooth'; o.frequency.value = 123.5 * 2 ** (st / 12); o.detune.value = dt; g.gain.value = 0.12; o.connect(g).connect(lp); o.start(); }));
}
const audio = () => {
  if (ac === undefined) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); pad(); } catch { ac = null; } }
  if (ac && ac.state === 'suspended') ac.resume();
  return ac;
};
function tone(f0, f1, vol, len, delay = 0, type = 'triangle') { // a short sweep: plucks, pops and thuds
  const t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + len);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.05);
  o.connect(g).connect(ac.destination); o.start(t); o.stop(t + len + 0.08);
}
function boing(i, delay, vol, len) { // pitch dips, springs past the note, wobbles in
  const f = 247 * 2 ** ((SC[((i % 5) + 5) % 5] + 12 * (Math.floor(i / 5) & 1)) / 12), t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
  o.type = 'triangle';
  o.frequency.setValueCurveAtTime(Float32Array.from([0.72, 1.5, 0.88, 1.2, 0.96, 1.06, 1, 1.02], (k) => f * k), t, len);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.08);
  o.connect(g).connect(ac.destination); o.start(t); o.stop(t + len + 0.1);
}

export function mount(root, ctx) {
  root.classList.add('g-tower-fall');
  const level = logic.makeLevel(ctx.level), best = logic.bestScore(level), rm = ctx.reduceMotion, len = level.len;
  let h = newHistory(logic.initialState(level));
  let running = false, won = false, fast = false, cracked = 0, E = {};
  const timers = new Set();
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
  const mk = (cls, tag = 'div', parent = root) => { const e = document.createElement(tag); e.className = cls; parent.appendChild(e); return e; };
  const sv = (tag, a, parent) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); parent?.appendChild(e); return e; };
  const snd = (fn) => { if (audio()) fn(); };
  const TICK = () => (rm ? 110 : fast ? 170 : 500);

  // geometry: the straight path is drafted as a snake of short rows so every cell stays at least 44 px wide
  const per = len <= 6 ? len : Math.ceil(len / Math.ceil(len / 6)), lines = Math.ceil(len / per), cs = Math.min(58, Math.floor(330 / per)), X0 = (360 - per * cs) / 2 + cs / 2, RG = 100, Y0 = 90;
  const P = (i) => { const l = Math.floor(i / per), p = i % per; return [X0 + (l % 2 ? per - 1 - p : p) * cs, Y0 + l * RG]; };
  const lastP = P(len - 1), gate = [lastP[0], lastP[1] + 54];
  const EP = (p) => (p >= len ? [gate[0], gate[1] - 4] : P(p));
  const TP = (p) => [P(p)[0], P(p)[1] - 36];
  const ats = level.waves.map((w) => w[0]), minAt = Math.min(...ats), maxAt = Math.max(...ats), cols = maxAt - minAt + 1, colW = Math.min(36, 320 / cols), tx0 = (360 - cols * colW) / 2;
  const stacks = Array.from({ length: cols }, () => []);
  level.waves.forEach(([at, hp], id) => stacks[at - minAt].push([id, hp]));
  const tapeY = gate[1] + 40, tapeH = Math.max(...stacks.map((s) => s.length)) * 17 + 14, H = tapeY + tapeH + 22;

  root.textContent = '';
  if (!rm) root.classList.add('tf-m'); else root.classList.add('tf-rm');
  ['tf-l tf-l0', 'tf-l tf-l1', 'tf-l tf-l2', 'tf-l tf-l3'].forEach((c, i) => { if (!rm || i !== 1 && i !== 2) mk(c); });
  const svg = sv('svg', { class: 'tf-s', viewBox: `0 0 360 ${H}` }, root);
  const road = 'M' + [`${X0 - cs / 2 - 4} ${Y0}`, ...Array.from({ length: len }, (_, i) => P(i).join(' ')), `${gate[0]} ${gate[1] - 16}`].join('L');
  const ink = 'fill="none" stroke="#EAF6FF" stroke-linecap="round" stroke-linejoin="round"';
  svg.innerHTML = DEFS + `<g id="tf-draw"><path d="${road}" fill="none" stroke="#1D6FA5" stroke-opacity=".45" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/><path d="${road}" fill="none" stroke="#0B3C5D" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/><path d="${road}" ${ink} stroke-width="1.6" stroke-opacity=".6" stroke-dasharray="6 6" class="tf-flow"/>` +
    Array.from({ length: len + 1 }, (_, i) => { const a = i === 0 ? [X0 - cs / 2, Y0] : P(i - 1), b = i === len ? null : P(i); return b && a[1] === b[1] ? `<path d="M${(a[0] + b[0]) / 2} ${a[1] - 15}V${a[1] + 15}" ${ink} stroke-width="1.4" stroke-opacity=".5"/>` : ''; }).join('') +
    `<path d="M${X0 - cs / 2 - 6} ${Y0 - 9}l8 9l-8 9M${X0 - cs / 2 - 16} ${Y0 - 9}l8 9l-8 9" ${ink} stroke-width="2"/>` +
    `<g transform="translate(${gate[0]} ${gate[1]})"><path d="M-23 24V-6H-23V-15H-14V-8H-5V-15H5V-8H14V-15H23V24Z" fill="rgba(11,60,93,.9)" ${ink} stroke-width="2"/><path d="M-7 24V13A7 7 0 0 1 7 13V24" ${ink} stroke-width="2"/><g id="tf-wins"></g></g>` +
    `<path d="M${tx0 - 6} ${tapeY + tapeH}H${tx0 + cols * colW + 6}" ${ink} stroke-width="2"/>` + Array.from({ length: cols }, (_, c) => `<path d="M${tx0 + c * colW + colW / 2} ${tapeY + tapeH}v5" ${ink} stroke-width="1.5"/><text x="${tx0 + c * colW + colW / 2}" y="${tapeY + tapeH + 17}" text-anchor="middle" font="600 10px monospace" style="font:600 10px ui-monospace,Menlo,monospace" fill="#EAF6FF" opacity=".7">${c + minAt}</text>`).join('') + '</g>' +
    '<g class="tf-rng"></g><g class="tf-slots"></g><g class="tf-tape"></g><g class="tf-enemies"></g><g class="tf-fx"></g>';
  const [rngG, slotG, tapeG, enG, fx] = ['.tf-rng', '.tf-slots', '.tf-tape', '.tf-enemies', '.tf-fx'].map((q) => svg.querySelector(q));
  const winsG = svg.querySelector('#tf-wins');
  const wx = (k) => (level.lives === 1 ? 0 : (k - 0.5) * 20);
  const drawWins = () => { winsG.innerHTML = Array.from({ length: level.lives }, (_, k) => `<g class="tf-win" transform="translate(${wx(k) - 4.5} -5)"><rect width="9" height="10" rx="2" fill="${k < level.lives - cracked ? 'url(#tf-bt)' : '#0B3C5D'}" stroke="#EAF6FF" stroke-width="1.5"/>${k < level.lives - cracked ? '' : '<path d="M1 1L5 5L3 9M5 5L9 4" stroke="#EAF6FF" stroke-width="1" fill="none"/>'}</g>`).join(''); };
  // wave tape: the known waves, one column per spawn tick, hit points as numerals
  const tapeCols = stacks.map((st, c) => {
    const g = sv('g', { class: 'tf-te' }, tapeG);
    st.forEach(([, hp], j) => { g.innerHTML += `<g transform="translate(${tx0 + c * colW + colW / 2} ${tapeY + tapeH - 12 - j * 17})"><ellipse rx="8.5" ry="7.5" fill="url(#tf-lm)" stroke="#EAF6FF" stroke-width="1.3"/><text y="3.4" text-anchor="middle" style="font:700 10px ui-monospace,Menlo,monospace" fill="#0B3C5D">${hp}</text></g>`; });
    return g;
  });
  const head = sv('rect', { class: 'tf-head', x: -colW / 2 + 1, y: tapeY - 4, width: colW - 2, height: tapeH + 4, rx: 5, fill: 'none', stroke: '#FFE066', 'stroke-width': 2, opacity: 0 }, tapeG);
  head.style.transform = `translateX(${tx0 + colW / 2}px)`;

  const bar = mk('tf-bar'), tray = mk('tf-tray', 'div', bar);
  const icons = Array.from({ length: level.maxTowers }, () => { const e = sv('svg', { class: 'tf-ti', viewBox: '-20 -34 40 54' }); e.innerHTML = '<defs>' + DEFS.slice(6, -7) + '</defs>' + TOWER; tray.appendChild(e); return e; });
  const go = mk('tf-go', 'button', bar); go.type = 'button';
  const PLAY = '<svg viewBox="0 0 28 28"><path d="M5 2L25 14L5 26Z" stroke="#0B3C5D" stroke-width="3" stroke-linejoin="round"/></svg>', FF = '<svg viewBox="0 0 28 28"><path d="M2 3L13 14L2 25ZM14 3L25 14L14 25Z" stroke="#0B3C5D" stroke-width="2.5" stroke-linejoin="round"/></svg>';

  const hud = () => ctx.hud({ moves: h.present.moves, best, tries: h.tries, maxTries: logic.maxTries(), canUndo: h.past.length > 0 });
  function paint() {
    const tw = h.present.towers;
    rngG.innerHTML = tw.map((p) => [p - 1, p, p + 1].filter((i) => i >= 0 && i < len).map((i) => { const [x, y] = P(i); return `<rect x="${x - cs / 2 + 2}" y="${y - 18}" width="${cs - 4}" height="36" rx="7" fill="rgba(255,224,102,.07)" stroke="#FFE066" stroke-opacity=".55" stroke-width="1.3" stroke-dasharray="4 3"/>`; }).join('')).join('');
    slotG.innerHTML = level.slots.map((p) => {
      const [x, y] = TP(p), on = tw.includes(p), free = tw.length < level.maxTowers;
      return `<g data-p="${p}" class="tf-sl"><rect class="tf-hit" x="${x - cs / 2}" y="${y - 38}" width="${cs}" height="${P(p)[1] - y + 54}"/>` + (on ? `<g transform="translate(${x} ${y})"><g class="tf-tw">${TOWER}</g></g>` : `<g class="tf-pad" style="opacity:${free ? 1 : 0.4}"><circle cx="${x}" cy="${y}" r="18" fill="rgba(234,246,255,.06)" ${ink} stroke-width="1.8" stroke-dasharray="5 4"/><path d="M${x - 6} ${y}H${x + 6}M${x} ${y - 6}V${y + 6}" ${ink} stroke-width="2"/></g>`) + '</g>';
    }).join('');
    icons.forEach((e, i) => e.classList.toggle('used', i >= level.maxTowers - tw.length));
    go.innerHTML = running ? FF : PLAY; go.classList.toggle('ff', running); go.disabled = won;
  }
  const slotEl = (p) => slotG.querySelector(`[data-p="${p}"]`);
  function squash(el, kx, ky, ms = 420) { if (!rm && el) el.animate([{ transform: 'none' }, { transform: `scale(${kx},${ky})`, offset: 0.3 }, { transform: `scale(${1 / kx * 0.98 + 0.02},${1 / ky * 0.98 + 0.02})`, offset: 0.65 }, { transform: 'none' }], { duration: ms, easing: SPRING }); }

  function tap(p) {
    if (running || won) return;
    const has = h.present.towers.includes(p);
    if (!has && h.present.towers.length >= level.maxTowers) { if (!rm) slotEl(p).animate([{ transform: 'none' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'none' }], { duration: 260 }); snd(() => tone(160, 110, 0.04, 0.12)); return; }
    h = play(h, logic, has ? { t: 'remove', p } : { t: 'place', p });
    snd(() => boing(has ? p : p + 3, 0, 0.08, 0.4));
    paint(); hud();
    if (!has && !rm) { const g = slotEl(p).querySelector('.tf-tw'); g.animate([{ transform: 'scale(.3,1.5)', opacity: 0 }, { transform: 'scale(1.2,.8)', opacity: 1, offset: 0.4 }, { transform: 'scale(.94,1.08)', offset: 0.7 }, { transform: 'none' }], { duration: 520, easing: 'ease-out' }); }
  }

  // the run: the same rules as the logic, recorded tick by tick (the logic only returns the leak count)
  function trace(s) {
    const en = s.waves.map(([at, hp], id) => ({ id, at, hp, pos: 0 })), alive = [], out = [], last = Math.max(...en.map((e) => e.at));
    for (let tick = minAt; tick <= last + s.len + 1; tick++) {
      const r = { tick, spawn: [], shots: [], move: [], dead: [], leak: [] };
      en.forEach((e) => { if (e.at === tick) { alive.push(e); r.spawn.push(e.id); } });
      for (const p of s.towers) {
        const hit = alive.filter((e) => e.hp > 0 && Math.abs(e.pos - p) <= 1).sort((a, b) => b.pos - a.pos)[0];
        if (hit) { hit.hp--; r.shots.push({ p, id: hit.id, left: hit.hp }); }
      }
      for (const e of alive) if (e.hp > 0) e.pos++;
      for (let i = alive.length - 1; i >= 0; i--) {
        const e = alive[i];
        if (e.hp <= 0) { r.dead.push(e.id); alive.splice(i, 1); } else if (e.pos >= s.len) { r.leak.push(e.id); alive.splice(i, 1); } else r.move.push([e.id, e.pos]);
      }
      out.push(r);
      if (tick >= last && !alive.length) break;
    }
    return out;
  }
  function layout() { // enemies sharing a cell form a little jelly pile
    const by = {};
    Object.values(E).forEach((e) => { if (!e.dead) (by[e.pos] ||= []).push(e); });
    for (const k in by) by[k].forEach((e, j, a) => {
      const [x, y] = EP(+k), m = a.length, sc = m > 2 ? 0.8 : 1;
      e.xy = [x + (j - (m - 1) / 2) * (m > 1 ? 10 : 0), y + (j % 2) * 7 - (m > 1 ? 3 : 0)];
      e.g.style.transform = `translate(${e.xy[0]}px,${e.xy[1]}px) scale(${sc})`;
    });
  }
  function spawn(id) {
    const e = { id, pos: 0, hp: level.waves[id][1] }, g = sv('g', { class: 'tf-en' }, enG);
    g.innerHTML = ENEMY + `<g transform="translate(0 -22)"><circle r="7.5" fill="#0B3C5D" stroke="#EAF6FF" stroke-width="1.4"/><text y="3.5" text-anchor="middle" style="font:700 10px ui-monospace,Menlo,monospace" fill="#EAF6FF"></text></g>`;
    e.g = g; e.t = g.querySelector('text'); e.t.textContent = e.hp; E[id] = e;
    g.style.transition = 'none'; layout(); g.getBoundingClientRect(); g.style.transition = '';
    if (!rm) g.firstElementChild.nextElementSibling && g.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
    return e;
  }
  const ring = (x, y, col = '#EAF6FF', r = 16) => {
    if (rm) return;
    const c = sv('circle', { cx: x, cy: y, r: 4, fill: 'none', stroke: col, 'stroke-width': 2 }, fx);
    c.style.transformOrigin = `${x}px ${y}px`;
    c.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: `scale(${r / 4})`, opacity: 0 }], { duration: 500, easing: OUT }).onfinish = () => c.remove();
  };
  const drops = (x, y, k, cols) => {
    if (rm) return;
    for (let m = 0; m < k; m++) {
      const c = sv('circle', { cx: x, cy: y, r: 3.2 + (m % 3), fill: cols[m % cols.length], stroke: '#EAF6FF', 'stroke-width': 1 }, fx), a = (m / k) * 6.28 + 0.4, d = 16 + (m % 3) * 8;
      c.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d - 14}px)`, opacity: 1, offset: 0.5 }, { transform: `translate(${Math.cos(a) * d * 1.2}px,${Math.sin(a) * d + 10}px)`, opacity: 0 }], { duration: 700, easing: OUT }).onfinish = () => c.remove();
    }
  };
  function shoot(sh) {
    const e = E[sh.id], [mx, my] = [TP(sh.p)[0], TP(sh.p)[1] - 26];
    if (!e || e.dead) return;
    const [ex, ey] = [e.xy[0], e.xy[1] - 4];
    const hit = () => {
      e.hp = sh.left; e.t.textContent = Math.max(0, e.hp); ring(ex, ey);
      squash(e.g.querySelector('.tf-body'), 1.3, 0.72, 380);
      snd(() => tone(900 + sh.p * 25, 380, 0.05, 0.1));
      if (e.hp <= 0) { e.dead = true; drops(ex, ey, 7, ['#B6E36B', '#E6FBB6']); snd(() => tone(420, 90, 0.07, 0.18)); if (!rm) e.g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: 'forwards' }); later(() => e.g.remove(), rm ? 0 : 230); layout(); }
    };
    squash(slotEl(sh.p)?.querySelector('.tf-tw'), 0.9, 1.12, 300);
    if (rm) return hit();
    const b = sv('circle', { r: 4.5, fill: '#FFE066', stroke: '#EAF6FF', 'stroke-width': 1.3 }, fx), ln = sv('path', { d: `M${mx} ${my}L${ex} ${ey}`, stroke: '#EAF6FF', 'stroke-width': 1.5, 'stroke-dasharray': '3 4', fill: 'none' }, fx);
    ln.animate([{ opacity: 0.8 }, { opacity: 0 }], { duration: 260 }).onfinish = () => ln.remove();
    b.animate([{ transform: `translate(${mx}px,${my}px) scale(1.4)` }, { transform: `translate(${ex}px,${ey}px) scale(.8)` }], { duration: fast ? 70 : 150, easing: 'ease-in', fill: 'forwards' }).onfinish = () => { b.remove(); hit(); };
  }
  function crack() {
    cracked++; drawWins();
    snd(() => { tone(110, 45, 0.12, 0.5, 0, 'sine'); tone(155, 60, 0.05, 0.4, 0.04, 'sawtooth'); });
    if (!rm) svg.animate([{ transform: 'none' }, { transform: 'translate(-5px,2px)' }, { transform: 'translate(4px,-2px)' }, { transform: 'translate(-2px,1px)' }, { transform: 'none' }], { duration: 380 });
    drops(...gate, 6, ['#FFE066', '#EAF6FF']);
  }
  function doTick(tk) {
    const T = TICK(), ci = tk.tick - minAt;
    tapeCols.forEach((c, k) => c.classList.toggle('past', k < ci));
    head.style.opacity = 1; head.style.transform = `translateX(${tx0 + ci * colW + colW / 2}px)`;
    tk.spawn.forEach((id) => { const e = spawn(id); ring(e.xy[0], e.xy[1], '#B6E36B', 22); });
    if (tk.spawn.length) snd(() => tone(140, 220, 0.04, 0.2));
    tk.shots.forEach((sh, j) => later(() => shoot(sh), T * 0.12 + j * 70));
    later(() => {
      tk.move.forEach(([id, pos]) => { if (E[id]) E[id].pos = pos; });
      tk.leak.forEach((id) => { if (E[id]) E[id].pos = len; });
      layout();
      tk.leak.forEach((id) => later(() => { const e = E[id]; if (!e) return; e.dead = true; e.g.remove(); crack(); }, rm ? 0 : 250));
    }, T * 0.62);
  }
  function runIt() {
    if (running) { fast = true; return; }
    if (won) return;
    h = play(h, logic, { t: 'run' }); hud(); running = true; fast = false; cracked = 0; drawWins(); paint();
    snd(() => boing(7, 0, 0.07, 0.4));
    const tr = trace(h.present); let k = 0;
    const step = () => { if (k >= tr.length) return later(finish, TICK() * 1.2); doTick(tr[k++]); later(step, TICK()); };
    step();
  }
  function board() { // back to the drafting board, ready for the next try
    Object.values(E).forEach((e) => e.g.remove()); E = {}; cracked = 0; drawWins(); fx.textContent = '';
    tapeCols.forEach((c) => c.classList.remove('past')); head.style.opacity = 0;
  }
  function finish() {
    running = false; fast = false;
    if (logic.isSolved(h.present)) return win();
    later(() => { board(); paint(); }, rm ? 80 : 700); // a failed run only fades; the towers stay for another try
  }
  function win() {
    won = true; paint(); head.style.opacity = 0;
    [0, 1, 2, 3, 4].forEach((k) => snd(() => boing(k * 2 + 4, k * 0.1, 0.06, 0.36)));
    h.present.towers.forEach((p, k) => { const [x, y] = TP(p); drops(x, y - 10, 9, ['#FF8FB1', '#B6E36B', '#FFE066']); squash(slotEl(p)?.querySelector('.tf-tw'), 1.2, 0.85, 700); });
    if (!rm) [['circle', { cx: 180, cy: Y0 + ((lines - 1) * RG) / 2, r: 62 }], ['path', { d: `M150 ${Y0 + ((lines - 1) * RG) / 2 + 4}L172 ${Y0 + ((lines - 1) * RG) / 2 + 24}L212 ${Y0 + ((lines - 1) * RG) / 2 - 20}` }]].forEach(([tag, a], k) => {
      const e = sv(tag, { ...a, fill: 'none', stroke: '#fff', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': 1 }, fx);
      e.animate([{ strokeDashoffset: 1, opacity: 1 }, { strokeDashoffset: 0, opacity: 1, offset: 0.6 }, { strokeDashoffset: 0, opacity: 1, offset: 0.8 }, { strokeDashoffset: 0, opacity: 0 }], { duration: 1900, delay: 150 + k * 450, easing: 'ease-out', fill: 'both' });
    });
    later(() => ctx.solved({ score: logic.score(h.present) }), 700);
  }
  function settle() {
    for (const t of timers) clearTimeout(t); timers.clear();
    running = won = fast = false; board(); paint(); hud();
  }

  const down = (e) => { audio(); const s = e.target.closest?.('.tf-sl'); if (s) tap(+s.dataset.p); };
  svg.addEventListener('pointerdown', down);
  root.addEventListener('pointerdown', audio, { passive: true });
  go.addEventListener('pointerdown', runIt);

  drawWins(); paint(); hud();
  if (!rm) { // the blueprint is inked, then the jelly pops in
    svg.querySelectorAll('#tf-draw > path').forEach((p, k) => { if (k > 1) return; p.setAttribute('pathLength', 1); p.style.strokeDasharray = 1; p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 1200, easing: 'ease-in-out', fill: 'backwards' }); });
    svg.querySelectorAll('.tf-sl').forEach((g, k) => g.animate([{ transform: 'scale(.3)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 520, delay: 700 + k * 70, easing: SPRING, fill: 'backwards' }));
  }

  return {
    undo() { h = undo(h, logic.maxTries()); settle(); },
    reset() { h = reset(h, logic.maxTries()); settle(); },
    destroy() {
      for (const t of timers) clearTimeout(t); timers.clear();
      root.removeEventListener('pointerdown', audio);
      ac?.close?.(); ac = undefined;
      root.textContent = ''; root.classList.remove('g-tower-fall', 'tf-m', 'tf-rm');
    },
  };
}
