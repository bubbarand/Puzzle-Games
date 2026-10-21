// Resource Allocation UI (class: Quantity). Spec 003. Tubes of liquid coins: drag or tap a tube to set its level (one move per release).
// Live gauges: total return vs target, and the five yearly totals vs the floor line. No words; shapes and numerals only.
import * as logic from '../logic/resource-allocation.js';
import { newHistory, play, undo, reset } from '../logic/history.js';

const COL = ['#2EC4B6', '#4CC9F0', '#7B8CDE'];
const EASE = 'cubic-bezier(.215,.61,.355,1)';
// option glyphs (shape carries identity as well as color)
const GLY = [
  '<circle cx="9" cy="9" r="6"/>', '<rect x="3" y="3" width="12" height="12"/>', '<path d="M9 2.5L15.5 15H2.5Z"/>',
  '<path d="M9 1.5L16.5 9L9 16.5L1.5 9Z"/>', '<path d="M5 2.5h8l4 6.5l-4 6.5H5L1 9Z"/>', '<path d="M6.5 2h5v4.5H16v5h-4.5V16h-5v-4.5H2v-5h4.5Z"/>',
];

export const css = `
.g-resource-allocation{--bg:#F2F6FA;--ink:#1B2A3A;--slate:#5B7083;--teal:#2EC4B6;--alert:#E5446D;--peri:#7B8CDE;--dot:rgba(91,112,131,.16);--tube:rgba(91,112,131,.12);--sh:rgba(27,42,58,.2);
  position:relative;overflow:hidden;min-height:560px;background:var(--bg);color:var(--ink);touch-action:manipulation;user-select:none;-webkit-user-select:none;
  font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-variant-numeric:tabular-nums}
@media (prefers-color-scheme: dark){.g-resource-allocation{--bg:#0E1A2B;--ink:#E6EEF6;--slate:#8FA3B8;--dot:rgba(143,163,184,.16);--tube:rgba(143,163,184,.12);--sh:rgba(0,0,0,.5)}}
.g-resource-allocation .r-dots{position:absolute;inset:0;pointer-events:none}
.g-resource-allocation .r-d1{background-image:radial-gradient(var(--dot) 1.5px,transparent 2px);background-size:56px 56px}
.g-resource-allocation .r-d2{background-image:radial-gradient(var(--dot) 2.5px,transparent 3px);background-size:130px 130px;background-position:40px 70px}
.g-resource-allocation.r-move .r-d1{animation:r-p1 50s linear infinite}
.g-resource-allocation.r-move .r-d2{animation:r-p2 110s linear infinite}
@keyframes r-p1{to{background-position:56px 56px}}
@keyframes r-p2{from{background-position:40px 70px}to{background-position:-90px -60px}}
.g-resource-allocation .r-top{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;overflow:visible}
.g-resource-allocation .r-bar,.g-resource-allocation .r-yb{transition:width .4s ${EASE},height .4s ${EASE},y .4s ${EASE},fill .3s}
.g-resource-allocation .r-yn{font-size:11px;font-weight:300;fill:var(--slate);text-anchor:middle;transition:y .4s ${EASE}}
.g-resource-allocation .r-read{position:absolute;left:18px;top:32px;display:flex;align-items:baseline;gap:7px;color:var(--slate);font-size:14px;font-weight:300;pointer-events:none}
.g-resource-allocation .r-read b{display:inline-flex;color:var(--ink);font-weight:200;font-size:36px;letter-spacing:-.03em;line-height:1.05}
.g-resource-allocation .r-dg{display:block;height:1.05em;overflow:hidden}
.g-resource-allocation .r-cl{display:flex;flex-direction:column;transition:transform .6s ${EASE}}
.g-resource-allocation .r-cl i{display:block;font-style:normal;height:1.05em;line-height:1.05em}
.g-resource-allocation .r-dm{width:8px;height:8px;background:currentColor;transform:rotate(45deg);align-self:center}
.g-resource-allocation .r-pool{position:absolute;left:18px;top:14px;display:flex;gap:6px;pointer-events:none}
.g-resource-allocation .r-pool i{width:10px;height:10px;border-radius:50%;border:1.5px solid var(--slate);transition:background .3s,transform .4s ${EASE},border-color .3s}
.g-resource-allocation .r-pool i.on{background:var(--peri);border-color:var(--peri);transform:scale(.7)}
.g-resource-allocation .r-colm{position:absolute;display:flex;flex-direction:column;align-items:center;gap:3px}
.g-resource-allocation .r-sp{display:block;overflow:visible}
.g-resource-allocation .r-ret{font-size:15px;font-weight:300;color:var(--ink);display:flex;align-items:center;gap:4px;height:20px}
.g-resource-allocation .r-ret .r-dm{width:5px;height:5px;color:var(--slate)}
.g-resource-allocation .r-risk{height:5px;border-radius:3px;background:var(--tube);position:relative;overflow:hidden;width:70%}
.g-resource-allocation .r-risk::after{content:'';position:absolute;inset:0 auto 0 0;width:var(--rk);background:repeating-linear-gradient(135deg,var(--alert) 0 3px,transparent 3px 5px)}
.g-resource-allocation .r-tube{position:relative;width:100%;border-radius:16px;background:var(--tube);overflow:hidden;touch-action:none;cursor:pointer;-webkit-tap-highlight-color:transparent;margin-top:6px}
.g-resource-allocation .r-liq{position:absolute;left:0;right:0;bottom:0;height:0;transition:height .4s ${EASE};background:var(--c);opacity:.9}
.g-resource-allocation .r-drag .r-liq{transition:height .08s linear}
.g-resource-allocation .r-liq .r-wv{position:absolute;left:0;top:-9px;width:200%;height:10px;fill:var(--c)}
.g-resource-allocation.r-move .r-liq .r-wv{animation:r-wave 5s linear infinite}
@keyframes r-wave{to{transform:translateX(-50%)}}
.g-resource-allocation .r-tk{position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.35) 1px,transparent 1px);background-size:100% var(--u);background-position:0 100%;mix-blend-mode:overlay;opacity:.8}
.g-resource-allocation .r-n{position:absolute;left:0;right:0;text-align:center;font-size:24px;font-weight:200;color:var(--ink);pointer-events:none;transition:bottom .4s ${EASE}}
.g-resource-allocation .r-drag .r-n{transition:bottom .08s linear}
.g-resource-allocation .r-gl{position:absolute;left:50%;bottom:6px;margin-left:-9px;width:18px;height:18px;fill:none;stroke:var(--slate);stroke-width:1.6;stroke-linejoin:round;opacity:.7;pointer-events:none}
.g-resource-allocation .r-tube.r-shake{animation:r-sh .4s ease-in-out}
@keyframes r-sh{0%,100%{transform:none}20%{transform:translateX(-4px)}45%{transform:translateX(4px)}70%{transform:translateX(-2px)}}
.g-resource-allocation.r-won .r-liq{filter:drop-shadow(0 0 8px var(--c))}
.g-resource-allocation.r-won .r-top{filter:drop-shadow(0 0 6px var(--teal))}
.g-resource-allocation .r-ring{position:absolute;border-radius:50%;border:1.5px solid var(--teal);pointer-events:none}
@media (prefers-reduced-motion: reduce){.g-resource-allocation .r-liq,.g-resource-allocation .r-bar,.g-resource-allocation .r-yb,.g-resource-allocation .r-n{transition-duration:.12s!important}}
`;

export function mount(root, ctx) {
  root.classList.add('g-resource-allocation');
  const rm = !!ctx.reduceMotion;
  const level = logic.makeLevel(ctx.level);
  const best = logic.bestScore(level);
  const K = level.ret.length, C = level.coins;
  let hist = newHistory(logic.initialState(level));
  let solvedFired = false, dead = false, ac = null, G = null, ro = null, drag = null, preview = null;
  const timers = new Set();
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
  const blip = (f0, f1, dur, gain, type = 'sine', at = 0) => {
    if (!ac) return;
    const t = ac.currentTime + at, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + 0.05);
  };
  const unlock = () => { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { ac = null; } } if (ac && ac.state === 'suspended') ac.resume(); };
  const sfx = {
    tick: (n) => blip(900 + n * 90, 900 + n * 90, 0.03, 0.02, 'square'), // one per coin passed while dragging
    up: () => blip(300, 720, 0.28, 0.05), down: () => blip(720, 300, 0.28, 0.05),
    no: () => blip(150, 90, 0.2, 0.08, 'triangle'),
    win: () => [1568, 1976, 2349, 3136].forEach((f, k) => blip(f, f * 0.995, 0.9, 0.035, 'sine', k * 0.11)),
  };

  root.innerHTML = '';
  if (!rm) root.classList.add('r-move');
  const mk = (cls, parent = root, tag = 'div') => { const d = document.createElement(tag); d.className = cls; parent.append(d); return d; };
  mk('r-dots r-d1'); mk('r-dots r-d2');
  const NS = 'http://www.w3.org/2000/svg';
  const top = document.createElementNS(NS, 'svg'); top.setAttribute('class', 'r-top'); root.append(top);
  const pool = mk('r-pool'); pool.innerHTML = '<i></i>'.repeat(C);
  const read = mk('r-read');
  const digits = String(level.target).length + 1;
  read.innerHTML = `<span class="r-dm"></span><b><span class="r-sg" style="opacity:0">-</span>${Array.from({ length: digits }, () => `<span class="r-dg"><span class="r-cl">${'0123456789'.replace(/\d/g, '<i>$&</i>')}</span></span>`).join('')}</b><span>/ ${level.target}</span>`;
  const cl = [...read.querySelectorAll('.r-cl')], sg = read.querySelector('.r-sg');
  const odo = (n) => {
    const a = Math.abs(n), str = String(a).padStart(digits, '0');
    cl.forEach((c, k) => { c.style.transform = `translateY(${-str[k] * 1.05}em)`; c.parentNode.style.opacity = digits - k <= String(a).length ? 1 : 0.18; });
    sg.style.opacity = n < 0 ? 1 : 0;
  };

  const maxY = Math.max(level.floor * 2.4, 30), maxT = level.target * 1.3;
  const cols = level.ret.map((ret, i) => {
    const m = mk('r-colm'), c = COL[i % 3];
    const sp = document.createElementNS(NS, 'svg'); sp.setAttribute('class', 'r-sp'); m.append(sp);
    const mx = Math.max(...ret.map(Math.abs), 1), cw = 8; // five-year mini bars: up = gain, down = loss (hatched, pink)
    sp.setAttribute('viewBox', '0 0 50 36'); sp.setAttribute('width', 50); sp.setAttribute('height', 36);
    sp.innerHTML = '<defs><pattern id="rh' + i + '" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="2" height="4" fill="#E5446D"/></pattern></defs><line x1="0" x2="50" y1="18" y2="18" stroke="#5B7083" stroke-opacity=".35"/>' +
      ret.map((v, y) => { const h = Math.max(1.5, Math.abs(v) / mx * 16); return `<rect x="${3 + y * 9.5}" y="${v >= 0 ? 18 - h : 18}" width="${cw}" height="${h}" rx="1.5" fill="${v >= 0 ? c : 'url(#rh' + i + ')'}"/>`; }).join('');
    const rt = mk('r-ret', m); rt.innerHTML = `<span class="r-dm"></span>${ret.reduce((a, b) => a + b, 0)}`;
    const rk = mk('r-risk', m); rk.style.setProperty('--rk', level.risk[i] / 9 * 100 + '%');
    const tube = mk('r-tube', m); tube.dataset.i = i; tube.style.setProperty('--c', c);
    const liq = mk('r-liq', tube);
    liq.innerHTML = `<svg class="r-wv" viewBox="0 0 80 10" preserveAspectRatio="none"><path d="M0 5q10 -5 20 0t20 0t20 0t20 0V10H0Z"/></svg>`;
    mk('r-tk', tube);
    const n = mk('r-n', tube), gl = document.createElementNS(NS, 'svg'); gl.setAttribute('class', 'r-gl'); gl.setAttribute('viewBox', '0 0 18 18'); gl.innerHTML = GLY[i % GLY.length]; tube.append(gl);
    return { m, tube, liq, n, rk, rt, c };
  });

  // top gauges: total-return bar with a target diamond; five yearly bars with a dashed floor line
  function build() {
    const W = root.clientWidth || 360, H = Math.max(root.clientHeight || 560, 560);
    const gx = 18, gw = W - 36, by = 82, yb = 160, yh = 56, ytop = 166;
    const bw = 38, gap = (gw - 5 * bw) / 4;
    G = { W, H, gx, gw, by, yb, yh, bw, gap };
    const fy = yb - level.floor / maxY * yh, tx = gx + level.target / maxT * gw;
    top.setAttribute('viewBox', `0 0 ${W} ${H}`);
    top.innerHTML = `<rect x="${gx}" y="${by}" width="${gw}" height="6" rx="3" fill="var(--slate)" opacity=".18"/>
      <rect class="r-bar" x="${gx}" y="${by}" width="0" height="6" rx="3" fill="#7B8CDE"/>
      <path d="M${tx} ${by - 7}l5 5l-5 5l-5 -5Z" fill="#7B8CDE" transform="translate(0 ${6})"/><line x1="${tx}" x2="${tx}" y1="${by - 2}" y2="${by + 8}" stroke="var(--bg)" stroke-width="1"/>
      <defs><pattern id="rhy" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="2.5" height="5" fill="#E5446D"/></pattern></defs>
      <rect data-tut="years" x="${gx}" y="${ytop - 6}" width="${gw}" height="${yb - ytop + 24}" fill="none" pointer-events="none"/><line x1="${gx}" x2="${W - gx}" y1="${yb}" y2="${yb}" stroke="var(--slate)" stroke-opacity=".4"/>
      ${Array.from({ length: 5 }, (_, y) => `<rect class="r-yb" x="${gx + y * (bw + gap)}" y="${yb}" width="${bw}" height="0" rx="4" fill="#2EC4B6"/><text class="r-yn" x="${gx + y * (bw + gap) + bw / 2}" y="${yb + 14}">0</text>`).join('')}
      <line x1="${gx}" x2="${W - gx}" y1="${fy}" y2="${fy}" stroke="#E5446D" stroke-width="1.5" stroke-dasharray="5 4"/>
      <path d="M${gx - 2} ${fy - 4}l-6 4l6 4Z" fill="#E5446D"/>`;
    G.fy = fy; G.ytop = ytop;
    // columns
    const cw = (W - 24) / K, colTop = ytop + 26, th = 0;
    G.th = th; G.cw = cw; G.colTop = colTop;
    cols.forEach((c, i) => {
      c.m.style.cssText = `left:${12 + i * cw + 3}px;top:${colTop}px;width:${cw - 6}px;height:${H - colTop - 12}px`;
      c.tube.style.flex = '1'; c.tube.style.height = ''; c.tube.style.setProperty('--u', '1px');
    });
    requestAnimationFrame(() => cols.forEach((c) => c.tube.style.setProperty('--u', c.tube.clientHeight / C + 'px')));
  }

  function render(alloc = hist.present.alloc, quiet = false) {
    const s = { ...hist.present, alloc }, ys = logic.years(s), tot = ys.reduce((a, b) => a + b, 0), used = alloc.reduce((a, b) => a + b, 0);
    [...pool.children].forEach((d, k) => d.classList.toggle('on', k < used));
    odo(tot);
    const bar = top.querySelector('.r-bar');
    bar.setAttribute('width', Math.max(0, Math.min(1, tot / maxT)) * G.gw); bar.setAttribute('fill', tot >= level.target ? '#2EC4B6' : '#7B8CDE');
    top.querySelectorAll('.r-yb').forEach((b, y) => {
      const v = ys[y], h = Math.max(0, Math.min(1, v / maxY)) * G.yh;
      b.setAttribute('height', h); b.setAttribute('y', G.yb - h);
      b.setAttribute('fill', v >= level.floor ? '#2EC4B6' : 'url(#rhy)');
    });
    top.querySelectorAll('.r-yn').forEach((t, y) => { t.textContent = ys[y]; });
    cols.forEach((c, i) => {
      const th = c.tube.clientHeight || G.th, h = alloc[i] / C * th;
      c.liq.style.height = h + 'px'; c.liq.style.opacity = h ? '' : 0;
      c.n.style.bottom = Math.max(30, h - 32) + 'px'; c.n.textContent = alloc[i];
    });
    if (!quiet) ctx.hud({ moves: hist.present.moves, best, tries: hist.tries, maxTries: logic.maxTries(), canUndo: hist.past.length > 0 });
    return tot;
  }

  const levelAt = (c, ev) => { const r = c.tube.getBoundingClientRect(); return Math.max(0, Math.min(C, Math.ceil((r.bottom - ev.clientY) / (r.height / C) - 0.2))); };
  function onDown(ev) {
    const t = ev.target.closest && ev.target.closest('.r-tube');
    if (!t || solvedFired || dead) return;
    unlock();
    const i = +t.dataset.i, c = cols[i], cur = hist.present.alloc[i];
    drag = { i, c, cur, free: C - hist.present.alloc.reduce((a, b) => a + b, 0) + cur, last: cur, moved: false, y0: ev.clientY };
    try { t.setPointerCapture(ev.pointerId); } catch (_) {}
    t.classList.add('r-drag');
  }
  function onMove(ev) {
    if (!drag) return;
    if (Math.abs(ev.clientY - drag.y0) > 6) drag.moved = true;
    if (!drag.moved) return;
    const n = Math.min(drag.free, levelAt(drag.c, ev));
    if (n !== drag.last) { sfx.tick(n); drag.last = n; preview = hist.present.alloc.map((a, k) => (k === drag.i ? n : a)); render(preview, true); }
  }
  function onUp(ev) {
    if (!drag) return;
    const d = drag; drag = null; preview = null;
    d.c.tube.classList.remove('r-drag');
    let n = d.moved ? d.last : Math.min(d.free, levelAt(d.c, ev));
    if (!d.moved && n === d.cur) n = Math.max(0, d.cur - 1); // tap on the level you already have takes one coin back
    if (n === d.cur) { if (d.moved) render(); else if (n === 0 || d.free === d.cur) { sfx.no(); shake(d.c.tube); } return; }
    const next = play(hist, logic, { opt: d.i, n });
    if (next === hist) { sfx.no(); shake(d.c.tube); render(); return; }
    hist = next;
    const tot = render();
    ctx.sound.move(Math.round(tot / 20));
    (n > d.cur ? sfx.up : sfx.down)();
    if (logic.isSolved(hist.present)) {
      solvedFired = true; root.classList.add('r-won'); rings();
      later(() => { ctx.sound.win(); sfx.win(); }, 250);
      later(() => ctx.solved({ score: logic.score(hist.present) }), 700);
    }
  }
  function onCancel() { if (!drag) return; drag.c.tube.classList.remove('r-drag'); drag = null; render(); }
  const shake = (el) => { el.classList.remove('r-shake'); void el.offsetWidth; el.classList.add('r-shake'); later(() => el.classList.remove('r-shake'), 420); };
  function rings() {
    if (rm) return;
    [0, 220, 440].forEach((d) => {
      const r = mk('r-ring'); r.style.cssText = `left:${G.W / 2 - 20}px;top:${G.by - 17}px;width:40px;height:40px`;
      r.animate([{ transform: 'scale(.4)', opacity: 0 }, { opacity: .8, offset: .2 }, { transform: 'scale(9)', opacity: 0 }], { duration: 1500, delay: d, easing: EASE, fill: 'both' }).onfinish = () => r.remove();
    });
  }
  root.addEventListener('pointerdown', onDown);
  root.addEventListener('pointermove', onMove);
  root.addEventListener('pointerup', onUp);
  root.addEventListener('pointercancel', onCancel);

  build(); render();
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => { if (root.clientWidth && Math.abs(root.clientWidth - G.W) > 1) { build(); later(() => render(undefined, true), 30); } });
    ro.observe(root);
  }

  return {
    undo() { if (solvedFired) return; hist = undo(hist, logic.maxTries()); render(); },
    reset() { if (solvedFired) return; hist = reset(hist, logic.maxTries()); render(); },
    destroy() {
      dead = true;
      ['pointerdown', 'pointermove', 'pointerup', 'pointercancel'].forEach((e, k) => root.removeEventListener(e, [onDown, onMove, onUp, onCancel][k]));
      if (ro) ro.disconnect();
      timers.forEach(clearTimeout); if (ac) { try { ac.close(); } catch (_) {} ac = null; }
      root.innerHTML = ''; root.classList.remove('g-resource-allocation', 'r-move', 'r-won');
    },
  };
}
