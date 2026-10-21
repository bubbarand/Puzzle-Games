import * as logic from '../logic/monument-path.js';
import { newHistory, play, undo, reset } from '../logic/history.js';

const URI = (s) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
const MOON = URI('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><defs><radialGradient id="h"><stop offset="0" stop-color="#FFE3CC" stop-opacity=".5"/><stop offset=".55" stop-color="#FFB8A0" stop-opacity=".16"/><stop offset="1" stop-color="#FFB8A0" stop-opacity="0"/></radialGradient></defs><circle cx="120" cy="120" r="118" fill="url(#h)"/><circle cx="120" cy="120" r="30" fill="#FFF1E0" fill-opacity=".95"/><circle cx="120" cy="120" r="46" fill="none" stroke="#FFF1E0" stroke-opacity=".3"/></svg>');
const CLOUDS = URI('<svg xmlns="http://www.w3.org/2000/svg" width="520" height="300"><g fill="#fff" fill-opacity=".1"><ellipse cx="90" cy="70" rx="80" ry="12"/><ellipse cx="150" cy="60" rx="46" ry="9"/><ellipse cx="380" cy="150" rx="100" ry="14"/><ellipse cx="320" cy="140" rx="50" ry="9"/><ellipse cx="170" cy="240" rx="90" ry="12"/></g></svg>');
const MOTES = URI('<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360">' + [[40, 60, 2], [130, 210, 1.6], [220, 40, 2.2], [300, 150, 1.5], [90, 320, 1.8], [250, 290, 2], [180, 120, 1.3]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r * 2.5}" fill="#FFE3CC" fill-opacity=".14"/><circle cx="${x}" cy="${y}" r="${r}" fill="#FFF3E6" fill-opacity=".6"/>`).join('') + '</svg>');
const SILH = URI('<svg xmlns="http://www.w3.org/2000/svg" width="520" height="520"><g fill="#fff"><polygon points="56,90 90,107 90,141 56,124" fill-opacity=".04"/><polygon points="90,107 124,90 124,124 90,141" fill-opacity=".08"/><polygon points="330,300 384,327 384,381 330,354" fill-opacity=".04"/><polygon points="384,327 438,300 438,354 384,381" fill-opacity=".08"/></g></svg>');
const E = 'cubic-bezier(.215,.61,.355,1)';

export const css = `
.g-monument-path { position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; min-height: 520px; padding: 8px 0 18px;
  touch-action: none; user-select: none; -webkit-user-select: none; --th: 0;
  background: linear-gradient(180deg, #2B2D5B 0%, #5B4A8F 48%, #C77FAA 82%, #FFB8A0 100%); }
@media (prefers-color-scheme: dark) { .g-monument-path { background: linear-gradient(180deg, #14153A 0%, #35295F 48%, #7E4C7C 82%, #B9705F 100%); } }
.g-monument-path .mp-l { position: absolute; inset: -30px; pointer-events: none; background-repeat: repeat; }
.g-monument-path .mp-moon { background: ${MOON} 92% 14px / 210px 210px no-repeat; translate: calc(var(--th) * -.25px) 0; }
.g-monument-path .mp-sil { background-image: ${SILH}; background-size: 520px 520px; translate: calc(var(--th) * -.6px) 0; animation: mp-d1 380s linear infinite; }
.g-monument-path .mp-cl { background-image: ${CLOUDS}; background-size: 520px 300px; translate: calc(var(--th) * -1.1px) 0; animation: mp-d2 200s linear infinite; }
.g-monument-path .mp-mo { background-image: ${MOTES}; background-size: 360px 360px; translate: calc(var(--th) * -2px) 0; animation: mp-d3 70s linear infinite; }
@keyframes mp-d1 { to { background-position: -520px 260px; } }
@keyframes mp-d2 { to { background-position: 520px 0; } }
@keyframes mp-d3 { to { background-position: 120px -360px; } }
.g-monument-path .mp-tilt { position: relative; width: 100%; max-width: 420px; transition: transform .12s linear; }
.g-monument-path.mp-rel .mp-tilt { transition: transform .7s cubic-bezier(.34,1.56,.64,1); }
.g-monument-path svg.mp-s { display: block; width: 100%; height: auto; overflow: visible; }
.g-monument-path .mp-ring { fill: rgba(255,243,230,.16); stroke: #FFF3E6; stroke-width: 1.6; opacity: 0; pointer-events: none; transition: opacity .35s ${E}; }
.g-monument-path .mp-ring.on { opacity: .9; }
.g-monument-path.mp-m .mp-ring.on { animation: mp-rp 2.4s ease-in-out infinite; }
@keyframes mp-rp { 50% { opacity: .35; } }
.g-monument-path.mp-m .mp-beam { animation: mp-bp 4s ease-in-out infinite; }
@keyframes mp-bp { 50% { opacity: .5; } }
.g-monument-path.mp-m .mp-who { animation: mp-br 3s ease-in-out infinite; }
@keyframes mp-br { 50% { transform: translateY(-2px); } }
.g-monument-path .mp-no { animation: mp-sh .4s ${E}; }
@keyframes mp-sh { 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }
.g-monument-path .mp-flood { position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity .6s ${E}; background: radial-gradient(70% 55% at 50% 50%, rgba(255,226,122,.7), rgba(255,184,160,.3) 55%, rgba(255,184,160,0) 80%); }
.g-monument-path .mp-row { position: relative; display: flex; align-items: center; gap: 20px; }
.g-monument-path .mp-bt { width: 56px; height: 56px; padding: 0; border: 0; border-radius: 50%; cursor: pointer; touch-action: manipulation; background: rgba(255,255,255,.16); box-shadow: inset 0 0 0 1.5px rgba(255,255,255,.4); transition: transform .3s ${E}, background .3s; }
.g-monument-path .mp-bt:active { transform: scale(.92); background: rgba(255,255,255,.3); }
.g-monument-path .mp-bt svg { width: 32px; height: 32px; display: block; margin: auto; }
.g-monument-path .mp-dots { display: flex; gap: 8px; }
.g-monument-path .mp-dots i { width: 9px; height: 9px; border-radius: 3px; background: rgba(255,255,255,.35); transform: rotate(45deg); transition: background .4s ${E}, transform .4s ${E}; }
.g-monument-path .mp-dots i.on { background: #FFF3E6; transform: rotate(45deg) scale(1.35); }
`;

const NS = 'http://www.w3.org/2000/svg';
const W = 56, H = 38, K = 10, KV = 7, DS = 10, CX = 179, Y0 = 190; // block width, height, top-face skew, depth stagger, centre, ground
// block colours by height: [top, front, side]
const COL = [['#F6C2D8', '#E8A0BF', '#B96C93'], ['#8FE0D6', '#3FB8AF', '#26837F'], ['#FFD9C8', '#FFB8A0', '#D98A78']];
const FOG = '#7B6BA8', SC = [0, 4, 7, 11, 14];
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');
const ease = (t) => 1 - (1 - t) ** 3;

export function mount(root, ctx) {
  root.classList.add('g-monument-path');
  root.textContent = '';
  const rm = ctx.reduceMotion;
  if (!rm) root.classList.add('mp-m');
  const level = logic.makeLevel(ctx.level), best = logic.bestScore(level), bl = level.blocks;
  let h = newHistory(logic.initialState(level));
  let th = 0, tw = null, raf = 0, won = false, shown = h.present.at, last = h.present.at, ac, bus;
  const timers = new Set(), offs = [];
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
  const on = (n, type, fn) => { n.addEventListener(type, fn); offs.push(() => n.removeEventListener(type, fn)); };
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; };
  const pts = (a) => a.map((p) => p.join(',')).join(' ');

  // ---- sound: a small vibraphone voice plus a quiet wind pad; made on the first touch, closed in destroy
  const audio = () => {
    if (ac !== undefined) return ac;
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      bus = ac.createGain();
      const dl = ac.createDelay(1), fb = ac.createGain(), lp = ac.createBiquadFilter(), pad = ac.createGain();
      dl.delayTime.value = 0.3; fb.gain.value = 0.3; lp.type = 'lowpass'; lp.frequency.value = 2200;
      bus.connect(ac.destination); bus.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(ac.destination);
      pad.gain.value = 0.0001; pad.gain.setTargetAtTime(0.035, ac.currentTime, 1.5); pad.connect(ac.destination);
      [[110, 2], [164.8, -2], [220, 3]].forEach(([f, c]) => { const o = ac.createOscillator(); o.frequency.value = f; o.detune.value = c; o.connect(pad); o.start(); });
    } catch { ac = null; }
    if (ac && ac.state === 'suspended') ac.resume();
    return ac;
  };
  function bell(i, delay = 0, len = 1.4, vol = 0.13) {
    const f = 330 * 2 ** ((SC[((i % 5) + 5) % 5] + 12 * (Math.floor(i / 5) & 1)) / 12), t = ac.currentTime + delay;
    [[1, 1, len], [4, 0.3, len * 0.35], [10, 0.08, 0.05]].forEach(([k, a, d]) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.frequency.value = f * k; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol * a, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g).connect(bus); o.start(t); o.stop(t + d + 0.05);
    });
  }
  const snd = (i, vol) => { if (audio()) bell(i, 0, 1.4, vol); else ctx.sound.move(i); };
  const shellWin = ctx.sound.win; // silence the shell chord; the game plays its own (restored in destroy)
  ctx.sound.win = () => {};
  const chord = () => { if (audio()) [5, 7, 9, 12].forEach((k, j) => bell(k, j * 0.11, 2.4, 0.1)); else shellWin(); };

  // ---- scene
  for (const c of rm ? ['mp-moon'] : ['mp-moon', 'mp-sil', 'mp-cl', 'mp-mo']) { const d = document.createElement('div'); d.className = 'mp-l ' + c; root.appendChild(d); }
  const tilt = document.createElement('div');
  tilt.className = 'mp-tilt';
  const svg = el('svg', { class: 'mp-s', viewBox: '0 0 358 300' });
  tilt.append(svg);
  const flood = document.createElement('div');
  flood.className = 'mp-flood';
  root.append(tilt, flood);
  const defs = el('defs', {}, svg);
  const bf = el('filter', { id: 'mp-bl', x: '-30%', y: '-80%', width: '160%', height: '260%' }, defs);
  el('feGaussianBlur', { stdDeviation: 5 }, bf);
  const lg = el('radialGradient', { id: 'mp-lg' }, defs);
  el('stop', { offset: 0, 'stop-color': '#FFF6C8' }, lg);
  el('stop', { offset: 1, 'stop-color': '#FFD45A', 'stop-opacity': 0 }, lg);
  const bg = el('linearGradient', { id: 'mp-bg', x1: 0, y1: 1, x2: 0, y2: 0 }, defs);
  el('stop', { offset: 0, 'stop-color': '#FFE27A', 'stop-opacity': 0.7 }, bg);
  el('stop', { offset: 1, 'stop-color': '#FFE27A', 'stop-opacity': 0 }, bg);
  const shadowL = el('g', { filter: 'url(#mp-bl)', 'pointer-events': 'none' }, svg), blockL = el('g', {}, svg), ringL = el('g', {}, svg), whoL = el('g', { 'pointer-events': 'none' }, svg);

  const blocks = bl.map((b, i) => {
    const g = el('g', {}, blockL), c = COL[b[1]], goal = i === level.goal;
    const side = el('polygon', { points: pts([[W, 0], [W + K, -KV], [W + K, H - KV], [W, H]]) }, g);
    const front = el('polygon', { points: pts([[0, 0], [W, 0], [W, H], [0, H]]) }, g);
    const top = el('polygon', { points: pts([[0, 0], [K, -KV], [W + K, -KV], [W, 0]]) }, g);
    el('polygon', { points: pts([[8, -1.5], [K + 6, -KV + 1.5], [W + K - 8, -KV + 1.5], [W - 6, -1.5]]), fill: '#fff', 'fill-opacity': goal ? 0.7 : 0.22, 'pointer-events': 'none' }, g);
    const sh = el('ellipse', { rx: W * 0.55, ry: 7, fill: '#1A1740' }, shadowL);
    const ring = el('ellipse', { class: 'mp-ring', rx: 17, ry: 8 }, ringL);
    return { g, side, front, top, c, sh, ring };
  });
  const beam = el('g', { class: 'mp-beam', 'pointer-events': 'none' }, svg); // goal lantern: light shaft + arch
  el('rect', { x: -14, y: -90, width: 28, height: 90, fill: 'url(#mp-bg)' }, beam);
  el('circle', { cy: -10, r: 20, fill: 'url(#mp-lg)' }, beam);
  el('path', { d: 'M-8,0 V-14 A8,8 0 0 1 8,-14 V0 Z', fill: '#2B2D5B' }, beam);
  el('path', { d: 'M-4.5,0 V-13 A4.5,4.5 0 0 1 4.5,-13 V0 Z', fill: '#FFE27A' }, beam);
  svg.insertBefore(beam, ringL);
  const who = el('g', {}, whoL), me = el('g', { class: 'mp-who' }, who);
  el('circle', { cy: -14, r: 15, fill: 'url(#mp-lg)', 'fill-opacity': 0.6 }, me);
  el('path', { d: 'M-7,0 Q-8,-13 0,-22 Q8,-13 7,0 Z', fill: '#F4EFFF' }, me);
  el('path', { d: 'M0,-22 Q8,-13 7,0 L2,0 Q4,-12 0,-22 Z', fill: '#C9B8E8' }, me);
  el('circle', { cy: -25, r: 5, fill: '#FFE9D6' }, me);
  el('path', { d: 'M-5.5,-26 Q0,-36 5.5,-26 Q0,-29 -5.5,-26 Z', fill: '#E8A0BF' }, me);

  const row = document.createElement('div');
  row.className = 'mp-row';
  const arrow = (flip) => `<svg viewBox="0 0 32 32" fill="none" stroke="#FFF3E6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g transform="${flip ? 'translate(32 0) scale(-1 1)' : ''}"><path d="M9 20a8 8 0 1 0 2-9"/><path d="M8 6v6h6"/></g></svg>`;
  const btn = (d) => { const b = document.createElement('button'); b.className = 'mp-bt'; b.innerHTML = arrow(d > 0); b.style.touchAction = 'manipulation'; on(b, 'click', () => turn(d)); return b; };
  const dots = document.createElement('div');
  dots.className = 'mp-dots';
  dots.innerHTML = '<i></i><i></i><i></i><i></i>';
  row.append(btn(-1), dots, btn(1));
  root.append(row);

  // ---- projection: view angle th (degrees) -> screen. u is the screen column, d the depth (bigger = nearer, drawn lower and later)
  const P = (b, a) => {
    const c = Math.cos(a), s = Math.sin(a), u = b[0] * c + b[2] * s - (2 * c + 2 * s), d = -b[0] * s + b[2] * c - (-2 * s + 2 * c);
    return { x: CX + u * W - W / 2 - K / 2, y: Y0 - b[1] * H + d * DS, d };
  };
  const view = () => ((Math.round(th / 90) % 4) + 4) % 4;
  function draw(wp = 1) {
    const a = th * Math.PI / 180, pos = bl.map((b) => P(b, a)), order = bl.map((_, i) => i).sort((p, q) => pos[p].d - pos[q].d || bl[p][1] - bl[q][1] || pos[p].x - pos[q].x);
    const ok = new Set(logic.legalMoves(h.present).filter((m) => m.t === 'walk').map((m) => m.to));
    order.forEach((i) => {
      const p = pos[i], k = blocks[i], f = Math.min(1, Math.max(0, (2.9 - p.d) / 5.8)) * 0.45;
      blockL.appendChild(k.g);
      k.g.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
      k.top.setAttribute('fill', mix(k.c[0], FOG, f)); k.front.setAttribute('fill', mix(k.c[1], FOG, f)); k.side.setAttribute('fill', mix(k.c[2], FOG, f));
      k.sh.setAttribute('cx', p.x + W / 2); k.sh.setAttribute('cy', Y0 + p.d * DS + H + 12); k.sh.setAttribute('opacity', 0.38 - bl[i][1] * 0.08);
      k.ring.setAttribute('cx', p.x + (W + K) / 2); k.ring.setAttribute('cy', p.y - KV / 2 + 2);
      k.ring.classList.toggle('on', ok.has(i) && !tw);
    });
    const A = pos[shown], B = pos[h.present.at], t = wp, hop = Math.sin(Math.PI * t) * 12 * (shown === h.present.at ? 0 : 1);
    const wx = A.x + (B.x - A.x) * t, wy = A.y + (B.y - A.y) * t;
    who.setAttribute('transform', `translate(${(wx + (W + K) / 2).toFixed(1)} ${(wy - KV / 2 - hop).toFixed(1)})`);
    const G = pos[level.goal];
    beam.setAttribute('transform', `translate(${(G.x + (W + K) / 2).toFixed(1)} ${(G.y - KV / 2).toFixed(1)})`);
    root.style.setProperty('--th', th.toFixed(1));
    [...dots.children].forEach((d, i) => d.classList.toggle('on', i === view()));
  }
  function frame(now) {
    raf = 0;
    const p = Math.min(1, (now - tw.t0) / tw.dur), e = ease(p);
    th = tw.th0 + (tw.th1 - tw.th0) * e;
    draw(e);
    if (p < 1) { raf = requestAnimationFrame(frame); return; }
    th = tw.th1; shown = last = h.present.at; tw = null; draw();
    finish();
  }
  function sync() { // tween from what is drawn to the state (turn, walk, undo and reset all come here)
    const want = h.present.view * 90, d = ((want - th) % 360 + 540) % 360 - 180;
    if (tw) { shown = last; }
    tw = { th0: th, th1: th + d, t0: performance.now(), dur: rm ? 0 : 420 };
    last = h.present.at;
    cancelAnimationFrame(raf);
    if (rm) { th = tw.th1; shown = last; tw = null; draw(); finish(); } else raf = requestAnimationFrame(frame);
    ctx.hud({ moves: h.present.moves, best, tries: h.tries, maxTries: Infinity, canUndo: h.past.length > 0 });
  }
  function finish() {
    if (won || !logic.isSolved(h.present)) return;
    won = true;
    flood.style.opacity = 1;
    chord();
    later(() => ctx.solved({ score: logic.score(h.present) }), 700);
  }
  const mv = (m) => { const n = play(h, logic, m); if (n === h) return false; h = n; return true; };
  function turn(d) {
    if (won || tw) return;
    audio();
    if (mv({ t: 'rot', d })) { snd(h.present.view, 0.1); sync(); }
  }
  function tap(x, y) {
    if (won || tw) return;
    let pick = -1, bd = 36;
    logic.legalMoves(h.present).forEach((m) => {
      if (m.t !== 'walk') return;
      const r = blocks[m.to].ring, dist = Math.hypot(x - +r.getAttribute('cx'), (y - +r.getAttribute('cy')) * 1.4);
      if (dist < bd) { bd = dist; pick = m.to; }
    });
    if (pick < 0) { who.classList.remove('mp-no'); void who.getBoundingClientRect(); who.classList.add('mp-no'); snd(-3, 0.05); return; }
    if (mv({ t: 'walk', to: pick })) { snd(5 + (bl[pick][1] * 2 + h.present.moves) % 8, 0.12); sync(); }
  }

  // ---- input: a still tap walks; a drag tilts the world a few degrees, and a long sideways drag turns it
  let ds = null;
  const tiltTo = (ry, rx) => { tilt.style.transform = ry || rx ? `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg)` : ''; };
  on(root, 'pointerdown', (e) => {
    if ((e.pointerType === 'mouse' && e.button !== 0) || e.target.closest('button')) return;
    audio();
    ds = { x: e.clientX, y: e.clientY, moved: false, turned: false };
    root.classList.remove('mp-rel');
    root.setPointerCapture?.(e.pointerId);
  });
  on(root, 'pointermove', (e) => {
    if (!ds) return;
    const dx = e.clientX - ds.x, dy = e.clientY - ds.y;
    if (Math.hypot(dx, dy) > 8) ds.moved = true;
    if (rm || !ds.moved) return;
    tiltTo(Math.max(-6, Math.min(6, dx / 14)), Math.max(-5, Math.min(5, -dy / 18)));
    if (!ds.turned && Math.abs(dx) > 64) { ds.turned = true; turn(dx > 0 ? -1 : 1); }
  });
  const up = (e) => {
    if (!ds) return;
    const s = ds; ds = null;
    root.classList.add('mp-rel');
    tiltTo(0, 0);
    if (s.moved || e.type === 'pointercancel') return;
    const r = svg.getBoundingClientRect();
    tap((e.clientX - r.left) * 358 / r.width, (e.clientY - r.top) * 358 / r.width);
  };
  on(root, 'pointerup', up);
  on(root, 'pointercancel', up);

  draw();
  sync();
  return {
    undo() { if (won) return; const n = undo(h); if (n !== h) { h = n; sync(); } },
    reset() { if (won) return; h = reset(h); sync(); },
    destroy() {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout); timers.clear();
      offs.forEach((f) => f());
      ctx.sound.win = shellWin;
      if (ac) try { ac.close(); } catch { /* already closed */ }
      root.classList.remove('g-monument-path', 'mp-m', 'mp-rel');
      root.style.removeProperty('--th');
      root.textContent = '';
    },
  };
}
