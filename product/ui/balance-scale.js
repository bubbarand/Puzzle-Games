// Balance Scale UI (class: Quantity). Spec 003. A brushed-metal beam on a post; glowing solids; the beam swings with a spring and damping.
// Weights stay hidden (only used for the tilt physics). Tap a solid in the tray to add it to the right pan; tap the minus or a pan solid to take back.
import * as logic from '../logic/balance-scale.js';
import { newHistory, play, undo, reset } from '../logic/history.js';

const EASE = 'cubic-bezier(.215,.61,.355,1)';
const COL = ['#2EC4B6', '#4CC9F0', '#7B8CDE', '#A98BE0', '#5FA8D3', '#5ED6A0'];
const NOTE = [523, 587, 659, 784, 880, 1047];
// solids around (0,0): sphere, cube, prism, octahedron, hexagon, pentagon. Each has its own silhouette AND an inner mark (color is never the only cue).
const SOL = ['<circle r="11"/>', '<rect x="-9.5" y="-9.5" width="19" height="19" rx="2.5"/>', '<path d="M0-11.5L11.5 9.5H-11.5Z" stroke-linejoin="round"/>',
  '<path d="M0-12.5L10 0L0 12.5L-10 0Z"/>', '<path d="M-5.5-10h11l5.5 10l-5.5 10h-11l-5.5-10Z"/>', '<path d="M0-11.5L11-3.5L7 10h-14L-11-3.5Z"/>'];
const MARK = ['<circle r="4" fill="none"/>', '<path d="M-6 0H6M0-6V6"/>', '<path d="M-5 3H5"/>', '<circle r="1.6" fill="#fff" stroke="none"/>', '<path d="M-5 4L3-4M-1 6L7-2"/>', '<path d="M-5 2L0-3L5 2"/>'];
const solid = (i) => `<g class="b-sol" fill="url(#bsg${i})" filter="url(#bsglow)">${SOL[i]}</g><g class="b-mk">${MARK[i]}</g>`;
const PX = 180, PY = 88, ARM = 120, DROP = 130;

export const css = `
.g-balance-scale{--bg:#F2F6FA;--ink:#1B2A3A;--slate:#5B7083;--teal:#2EC4B6;--dot:rgba(91,112,131,.16);--m1:#E3EAF1;--m2:#9FB0C1;--m3:#C8D3DE;--slot:rgba(91,112,131,.12);
  position:relative;overflow:hidden;min-height:560px;display:flex;flex-direction:column;background:var(--bg);color:var(--ink);touch-action:manipulation;user-select:none;-webkit-user-select:none;
  font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-variant-numeric:tabular-nums}
@media (prefers-color-scheme: dark){.g-balance-scale{--bg:#0E1A2B;--ink:#E6EEF6;--slate:#8FA3B8;--dot:rgba(143,163,184,.16);--m1:#7E92A8;--m2:#34475C;--m3:#566B82;--slot:rgba(143,163,184,.12)}}
.g-balance-scale .b-l{position:absolute;inset:0;pointer-events:none}
.g-balance-scale .b-l1{background-image:radial-gradient(var(--dot) 1.5px,transparent 2px);background-size:56px 56px}
.g-balance-scale .b-l2{background-image:radial-gradient(var(--dot) 2.5px,transparent 3px);background-size:130px 130px;background-position:40px 70px}
.g-balance-scale .b-l3{background-image:repeating-linear-gradient(45deg,var(--dot) 0 1px,transparent 1px 90px);opacity:.6}
.g-balance-scale.b-move .b-l1{animation:b-p1 50s linear infinite}
.g-balance-scale.b-move .b-l2{animation:b-p2 110s linear infinite}
.g-balance-scale.b-move .b-l3{animation:b-p3 140s linear infinite}
@keyframes b-p1{to{background-position:56px 56px}}
@keyframes b-p2{from{background-position:40px 70px}to{background-position:-90px -60px}}
@keyframes b-p3{to{background-position:180px 0}}
.g-balance-scale .b-stage{display:block;width:100%;height:auto;position:relative}
.g-balance-scale .b-rd{position:absolute;top:12px;display:flex;align-items:baseline;gap:6px;font-size:30px;font-weight:200;letter-spacing:-.03em;line-height:1.05;pointer-events:none}
.g-balance-scale .b-rd.l{left:18px}.g-balance-scale .b-rd.r{right:18px;flex-direction:row-reverse}
.g-balance-scale .b-rd svg{width:12px;height:12px;fill:var(--slate)}
.g-balance-scale .b-dg{display:block;height:1.05em;overflow:hidden}
.g-balance-scale .b-cl{display:flex;flex-direction:column;transition:transform .5s ${EASE}}
.g-balance-scale .b-cl i{display:block;font-style:normal;height:1.05em;line-height:1.05em}
.g-balance-scale .b-it{cursor:pointer;transition:transform .35s ${EASE}}
.g-balance-scale .b-mk{fill:none;stroke:#fff;stroke-opacity:.8;stroke-width:1.5;stroke-linecap:round;pointer-events:none}
.g-balance-scale .b-sol{stroke:rgba(255,255,255,.55);stroke-width:.8}
.g-balance-scale .jewel{transition:fill .4s,filter .4s}
.g-balance-scale.b-won .jewel{fill:var(--teal);filter:drop-shadow(0 0 6px var(--teal))}
.g-balance-scale.b-won .b-pan{filter:drop-shadow(0 0 7px var(--teal))}
.g-balance-scale .b-tray{margin-top:auto;display:flex;justify-content:center;gap:2px;padding:0 6px 14px}
.g-balance-scale .b-slot{flex:1;max-width:58px;display:flex;flex-direction:column;align-items:center}
.g-balance-scale button{font:inherit;background:none;border:0;padding:0;margin:0;cursor:pointer;-webkit-tap-highlight-color:transparent;color:var(--slate)}
.g-balance-scale .b-add{width:54px;height:54px;border-radius:50%;background:var(--slot);display:grid;place-items:center;transition:transform .3s ${EASE},opacity .3s,box-shadow .3s}
.g-balance-scale .b-add:active{transform:scale(.9)}
.g-balance-scale .b-add svg{width:36px;height:36px;overflow:visible}
.g-balance-scale .b-pips{display:flex;gap:3px;height:14px;align-items:center}
.g-balance-scale .b-pips i{width:6px;height:6px;border-radius:50%;border:1.3px solid var(--c);transition:background .3s,transform .3s ${EASE}}
.g-balance-scale .b-pips i.on{background:var(--c)}
.g-balance-scale .b-rm{width:44px;height:44px;display:grid;place-items:center;border-radius:12px;transition:opacity .3s}
.g-balance-scale .b-rm svg{width:20px;height:20px;stroke:currentColor;stroke-width:1.6;fill:none;stroke-linecap:round}
.g-balance-scale .b-slot.dim .b-add{opacity:.35}
.g-balance-scale .b-slot.none .b-rm{opacity:.25}
.g-balance-scale .b-slot.b-shake{animation:b-sh .4s ease-in-out}
@keyframes b-sh{0%,100%{transform:none}20%{transform:translateX(-4px)}45%{transform:translateX(4px)}70%{transform:translateX(-2px)}}
@media (prefers-reduced-motion: reduce){.g-balance-scale .b-cl,.g-balance-scale .b-it{transition-duration:.12s!important}}
`;

export function mount(root, ctx) {
  root.classList.add('g-balance-scale');
  const rm = !!ctx.reduceMotion;
  const level = logic.makeLevel(ctx.level);
  const best = logic.bestScore(level);
  const K = level.w.length;
  let hist = newHistory(logic.initialState(level));
  let solvedFired = false, dead = false, ac = null, raf = 0, last = 0, a = 0, v = 0, T = 0;
  const timers = new Set();
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
  const blip = (f0, f1, dur, gain, type = 'sine', at = 0) => {
    if (!ac) return;
    const t = ac.currentTime + at, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + 0.05);
  };
  const unlock = () => { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { ac = null; } } if (ac && ac.state === 'suspended') ac.resume(); };
  const sfx = {
    add: (i) => { blip(NOTE[i % 6], NOTE[i % 6], 0.35, 0.05); blip(NOTE[i % 6] * 2.76, NOTE[i % 6] * 2.7, 0.12, 0.02); blip(140, 90, 0.14, 0.05, 'triangle', 0.12); },
    take: (i) => blip(NOTE[i % 6] * 0.5, NOTE[i % 6] * 0.35, 0.25, 0.04, 'triangle'),
    no: () => blip(150, 90, 0.2, 0.07, 'triangle'),
    win: () => [1047, 1319, 1568, 2093].forEach((f, k) => blip(f, f * 0.995, 0.9, 0.035, 'sine', k * 0.11)),
  };

  const NS = 'http://www.w3.org/2000/svg';
  root.innerHTML = '';
  if (!rm) root.classList.add('b-move');
  const mk = (cls, parent = root) => { const d = document.createElement('div'); d.className = cls; parent.append(d); return d; };
  mk('b-l b-l1'); mk('b-l b-l2'); mk('b-l b-l3');
  const odo = (side, n0) => {
    const el = mk('b-rd ' + side);
    el.innerHTML = '<svg viewBox="0 0 12 12"><path d="M6 0L12 6L6 12L0 6Z"/></svg><span style="display:flex">' + [0, 1].map(() => `<span class="b-dg"><span class="b-cl">${'0123456789'.replace(/\d/g, '<i>$&</i>')}</span></span>`).join('') + '</span>';
    const cl = [...el.querySelectorAll('.b-cl')];
    const set = (n) => cl.forEach((c, k) => { const d = String(n).padStart(2, '0')[k]; c.style.transform = `translateY(${-d * 1.05}em)`; c.parentNode.style.opacity = k === 0 && n < 10 ? 0.18 : 1; });
    set(n0); return set;
  };

  const stage = document.createElementNS(NS, 'svg');
  stage.setAttribute('class', 'b-stage'); stage.setAttribute('viewBox', '0 0 360 326');
  const gr = COL.slice(0, K).map((c, i) => `<radialGradient id="bsg${i}" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#fff"/><stop offset=".4" stop-color="${c}"/><stop offset="1" stop-color="${c}"/></radialGradient>`).join('');
  const ticks = [-15, -10, -5, 0, 5, 10, 15].map((d) => { const r = d * Math.PI / 180, c = d === 0; return `<line x1="${PX + Math.sin(r) * 52}" y1="${PY + Math.cos(r) * 52}" x2="${PX + Math.sin(r) * (c ? 62 : 58)}" y2="${PY + Math.cos(r) * (c ? 62 : 58)}" stroke="var(--slate)" stroke-width="${c ? 1.8 : 1}" stroke-opacity="${c ? 1 : .6}"/>`; }).join('');
  stage.innerHTML = `<defs>${gr}
    <filter id="bsglow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <linearGradient id="bsm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--m1)"/><stop offset=".5" style="stop-color:var(--m2)"/><stop offset="1" style="stop-color:var(--m3)"/></linearGradient>
    <pattern id="bsbr" width="6" height="2.4" patternUnits="userSpaceOnUse"><rect width="6" height=".7" fill="#fff" opacity=".28"/></pattern></defs>
    <rect x="${PX - 4}" y="${PY}" width="8" height="${306 - PY}" rx="3" fill="url(#bsm)"/><rect x="${PX - 4}" y="${PY}" width="8" height="${306 - PY}" rx="3" fill="url(#bsbr)"/>
    <rect x="${PX - 56}" y="304" width="112" height="10" rx="5" fill="url(#bsm)"/><rect x="${PX - 56}" y="304" width="112" height="10" rx="5" fill="url(#bsbr)"/>
    <path d="M${PX - 52} ${PY + 52}A52 52 0 0 0 ${PX + 52} ${PY + 52}" fill="none"/>${ticks}
    <g class="b-beam"><rect x="${PX - ARM - 8}" y="${PY - 5}" width="${ARM * 2 + 16}" height="10" rx="5" fill="url(#bsm)"/><rect x="${PX - ARM - 8}" y="${PY - 5}" width="${ARM * 2 + 16}" height="10" rx="5" fill="url(#bsbr)"/>
      <line x1="${PX}" y1="${PY}" x2="${PX}" y2="${PY + 48}" stroke="var(--ink)" stroke-width="1.4" stroke-linecap="round"/><circle cx="${PX}" cy="${PY + 48}" r="2.2" fill="var(--ink)"/>
      <circle cx="${PX}" cy="${PY}" r="13" fill="url(#bsm)"/><circle cx="${PX}" cy="${PY}" r="13" fill="url(#bsbr)"/><circle class="jewel" cx="${PX}" cy="${PY}" r="5" fill="var(--slate)"/></g>`;
  root.append(stage);
  const beam = stage.querySelector('.b-beam');
  const pans = [0, 1].map((side) => {
    const g = document.createElementNS(NS, 'g');
    g.innerHTML = `<g class="b-pan"><line x1="0" y1="0" x2="-54" y2="${DROP}" stroke="var(--slate)" stroke-width="1" opacity=".8"/><line x1="0" y1="0" x2="54" y2="${DROP}" stroke="var(--slate)" stroke-width="1" opacity=".8"/>
      <circle r="4" fill="url(#bsm)"/><path d="M-57 ${DROP}h114q0 15 -29 15h-56q-29 0 -29 -15Z" fill="url(#bsm)"/><path d="M-57 ${DROP}h114q0 15 -29 15h-56q-29 0 -29 -15Z" fill="url(#bsbr)"/><rect x="-57" y="${DROP - 1}" width="114" height="2" rx="1" fill="var(--ink)" opacity=".25"/></g>`;
    stage.append(g);
    return { g, items: [], side };
  });
  const place = (p) => p.items.filter((it) => !it.gone).forEach((it, k) => { it.g.style.transform = `translate(${((k % 4) - 1.5) * 27 + 0}px,${DROP - 13 - Math.floor(k / 4) * 25}px)`; });
  function addItem(p, s, animate) {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'b-it'); g.dataset.s = s;
    g.innerHTML = `<circle r="14" fill="transparent"/><g class="b-in">${solid(s)}</g>`;
    p.g.append(g); const it = { g, s }; p.items.push(it);
    if (!animate) g.style.transition = 'none';
    place(p);
    if (!animate) { void g.getBoundingClientRect(); g.style.transition = ''; }
    else g.querySelector('.b-in').animate([{ transform: 'translateY(-46px) scale(.6)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: rm ? 120 : 380, easing: EASE });
  }
  function dropItem(p, s) {
    const it = [...p.items].reverse().find((x) => x.s === s && !x.gone); if (!it) return;
    it.gone = true; it.g.style.pointerEvents = 'none';
    it.g.querySelector('.b-in').animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-30px) scale(.5)' }], { duration: rm ? 100 : 260, easing: EASE, fill: 'forwards' });
    place(p); later(() => { it.g.remove(); p.items = p.items.filter((x) => x !== it); }, 280);
  }
  level.left.forEach((n, s) => { for (let k = 0; k < n; k++) addItem(pans[0], s, false); });
  const odoL = odo('l', level.left.reduce((x, y) => x + y, 0)), odoR = odo('r', 0);

  const tray = mk('b-tray');
  const slots = level.w.map((_, i) => {
    const s = mk('b-slot', tray); s.style.setProperty('--c', COL[i]);
    s.innerHTML = `<button class="b-add" data-add="${i}"><svg viewBox="-14 -14 28 28">${solid(i)}</svg></button><div class="b-pips">${'<i></i>'.repeat(level.stock[i])}</div><button class="b-rm" data-rm="${i}"><svg viewBox="0 0 20 20"><path d="M4 10H16"/></svg></button>`;
    return s;
  });

  const tilt = (right) => {
    const L = level.left.reduce((x, n, i) => x + n * level.w[i], 0), R = right.reduce((x, n, i) => x + n * level.w[i], 0);
    const d = (R - L) / (R + L || 1);
    return d === 0 ? 0 : Math.sign(d) * Math.max(2.5, Math.min(13, Math.abs(d) * 45));
  };
  function pose() {
    const r = a * Math.PI / 180, dx = ARM * Math.cos(r), dy = ARM * Math.sin(r);
    beam.setAttribute('transform', `rotate(${a} ${PX} ${PY})`);
    pans[0].g.setAttribute('transform', `translate(${PX - dx} ${PY - dy})`);
    pans[1].g.setAttribute('transform', `translate(${PX + dx} ${PY + dy})`);
  }
  function step(t) {
    const dt = Math.min(0.033, (t - last) / 1000); last = t;
    v += (-60 * (a - T) - 6 * v) * dt; a += v * dt; pose();
    if (Math.abs(v) < 0.02 && Math.abs(a - T) < 0.02) { a = T; v = 0; pose(); raf = 0; return; }
    raf = requestAnimationFrame(step);
  }
  function aim(t) {
    T = t;
    if (rm) { a = T; v = 0; pose(); return; }
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); }
  }

  let shown = new Array(K).fill(0);
  function render(animate = true) {
    const right = hist.present.right;
    right.forEach((n, s) => {
      for (let k = shown[s]; k < n; k++) addItem(pans[1], s, animate);
      for (let k = shown[s]; k > n; k--) dropItem(pans[1], s);
    });
    shown = right.slice();
    odoR(right.reduce((x, y) => x + y, 0));
    slots.forEach((el, i) => {
      el.classList.toggle('dim', right[i] >= level.stock[i]); el.classList.toggle('none', right[i] === 0);
      [...el.querySelectorAll('.b-pips i')].forEach((d, k) => d.classList.toggle('on', k < level.stock[i] - right[i]));
    });
    aim(tilt(right));
    ctx.hud({ moves: hist.present.moves, best, tries: hist.tries, maxTries: logic.maxTries(), canUndo: hist.past.length > 0 });
  }
  const shake = (el) => { el.classList.remove('b-shake'); void el.offsetWidth; el.classList.add('b-shake'); later(() => el.classList.remove('b-shake'), 420); };
  function rings() {
    if (rm) return;
    [0, 220, 440].forEach((d) => {
      const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', PX); c.setAttribute('cy', PY); c.setAttribute('r', 14); c.setAttribute('fill', 'none'); c.setAttribute('stroke', '#2EC4B6'); c.setAttribute('stroke-width', 1.5);
      stage.append(c); c.animate([{ transform: 'scale(.5)', opacity: 0 }, { opacity: .8, offset: .2 }, { transform: 'scale(9)', opacity: 0 }], { duration: 1500, delay: d, easing: EASE, fill: 'both' }).onfinish = () => c.remove();
      c.style.transformOrigin = `${PX}px ${PY}px`;
    });
  }
  function act(s, d, slot) {
    if (solvedFired || dead) return;
    unlock();
    const next = play(hist, logic, { shape: s, d });
    if (next === hist) { sfx.no(); shake(slot); return; }
    hist = next; render();
    ctx.sound.move(s + (d > 0 ? 0 : 3));
    (d > 0 ? sfx.add : sfx.take)(s);
    if (logic.isSolved(hist.present)) {
      solvedFired = true; root.classList.add('b-won');
      later(() => { rings(); ctx.sound.win(); sfx.win(); }, 450);
      later(() => ctx.solved({ score: logic.score(hist.present) }), 900);
    }
  }
  function onDown(ev) {
    const t = ev.target.closest && ev.target.closest('[data-add],[data-rm],.b-it');
    if (!t) return;
    if (t.matches('.b-it')) { if (pans[1].g.contains(t)) act(+t.dataset.s, -1, slots[+t.dataset.s]); return; }
    const i = +(t.dataset.add ?? t.dataset.rm);
    act(i, t.dataset.add !== undefined ? 1 : -1, slots[i]);
  }
  root.addEventListener('pointerdown', onDown);
  pose(); render(false);

  return {
    undo() { if (solvedFired) return; hist = undo(hist, logic.maxTries()); render(); },
    reset() { if (solvedFired) return; hist = reset(hist, logic.maxTries()); render(); },
    destroy() {
      dead = true; root.removeEventListener('pointerdown', onDown);
      if (raf) cancelAnimationFrame(raf);
      timers.forEach(clearTimeout); if (ac) { try { ac.close(); } catch (_) {} ac = null; }
      root.innerHTML = ''; root.classList.remove('g-balance-scale', 'b-move', 'b-won');
    },
  };
}
