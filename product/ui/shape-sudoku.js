// Shape Sudoku UI (class: Quantity). Spec 003. Glassy tiles on a drifting field; a shape palette tray.
// Tap a shape (it lifts), then tap a tile; or drag a shape: it is pulled softly onto the tile under it. A repeat in a row or column is refused: the clashing tiles pulse.
import * as logic from '../logic/shape-sudoku.js';
import { newHistory, play, undo, reset } from '../logic/history.js';

const EASE = 'cubic-bezier(.215,.61,.355,1)';
const COL = ['#2EC4B6', '#4CC9F0', '#7B8CDE', '#A98BE0', '#E5446D', '#5ED6A0'];
const NOTE = [523, 587, 659, 784, 880, 1047];
// six silhouettes around (0,0): circle, square, triangle, diamond, hexagon, plus. Every shape also has its own colour; neither is the only cue.
const SH = ['<circle r="10.5"/>', '<rect x="-9.5" y="-9.5" width="19" height="19" rx="3"/>', '<path d="M0-11.5L11.5 9.5H-11.5Z" stroke-linejoin="round"/>',
  '<path d="M0-12.5L10.5 0L0 12.5L-10.5 0Z"/>', '<path d="M-5.5-10h11l5.5 10l-5.5 10h-11l-5.5-10Z"/>', '<path d="M-3.5-11h7v7.5h7.5v7h-7.5v7.5h-7v-7.5H-11v-7h7.5Z"/>'];
const glyph = (v, given) => `<svg viewBox="-14 -14 28 28" class="s-gl"><g fill="${COL[v - 1]}" fill-opacity="${given ? 0.92 : 0.38}" stroke="${COL[v - 1]}" stroke-width="${given ? 0 : 1.8}">${SH[v - 1]}</g><path d="M-6-5Q-3-9 3-9" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.6" stroke-linecap="round"/></svg>`;

export const css = `
.g-shape-sudoku{--bg:#F2F6FA;--ink:#1B2A3A;--slate:#5B7083;--teal:#2EC4B6;--dot:rgba(91,112,131,.16);--glass:rgba(255,255,255,.62);--rim:rgba(91,112,131,.22);--given:rgba(91,112,131,.2);--sh:rgba(27,42,58,.16);--orb1:rgba(46,196,182,.18);--orb2:rgba(123,140,222,.2);
  position:relative;overflow:hidden;min-height:560px;display:flex;flex-direction:column;align-items:center;background:var(--bg);color:var(--ink);touch-action:none;user-select:none;-webkit-user-select:none;
  font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-variant-numeric:tabular-nums}
@media (prefers-color-scheme: dark){.g-shape-sudoku{--bg:#0E1A2B;--ink:#E6EEF6;--slate:#8FA3B8;--dot:rgba(143,163,184,.16);--glass:rgba(255,255,255,.07);--rim:rgba(255,255,255,.16);--given:rgba(143,163,184,.22);--sh:rgba(0,0,0,.45);--orb1:rgba(46,196,182,.14);--orb2:rgba(123,140,222,.16)}}
.g-shape-sudoku .s-l{position:absolute;inset:0;pointer-events:none}
.g-shape-sudoku .s-l1{background-image:radial-gradient(var(--dot) 1.5px,transparent 2px);background-size:56px 56px}
.g-shape-sudoku .s-l2{background-image:radial-gradient(circle at 30% 30%,var(--orb1) 0,transparent 38%),radial-gradient(circle at 75% 70%,var(--orb2) 0,transparent 40%);background-size:520px 520px}
.g-shape-sudoku .s-l3{background-image:repeating-linear-gradient(45deg,var(--dot) 0 1px,transparent 1px 90px);opacity:.6}
.g-shape-sudoku.s-move .s-l1{animation:s-p1 50s linear infinite}
.g-shape-sudoku.s-move .s-l2{animation:s-p2 90s linear infinite}
.g-shape-sudoku.s-move .s-l3{animation:s-p3 140s linear infinite}
@keyframes s-p1{to{background-position:56px 56px}}
@keyframes s-p2{to{background-position:520px 260px}}
@keyframes s-p3{to{background-position:180px 0}}
.g-shape-sudoku .s-rd{align-self:flex-start;margin:14px 0 0 18px;display:flex;align-items:baseline;gap:7px;font-size:34px;font-weight:200;letter-spacing:-.03em;line-height:1.05;position:relative;pointer-events:none}
.g-shape-sudoku .s-rd svg{width:12px;height:12px;fill:var(--slate)}
.g-shape-sudoku .s-dg{display:block;height:1.05em;overflow:hidden}
.g-shape-sudoku .s-cl{display:flex;flex-direction:column;transition:transform .5s ${EASE}}
.g-shape-sudoku .s-cl i{display:block;font-style:normal;height:1.05em;line-height:1.05em}
.g-shape-sudoku .s-grid{position:relative;display:grid;gap:5px;margin:auto 0;padding:8px;border-radius:22px;background:var(--glass);box-shadow:0 10px 30px var(--sh),inset 0 0 0 1px var(--rim);transition:box-shadow .6s}
.g-shape-sudoku .s-c{position:relative;width:var(--cs);height:var(--cs);border-radius:14px;background:var(--glass);box-shadow:inset 0 0 0 1px var(--rim),0 2px 6px var(--sh);display:grid;place-items:center;transition:transform .3s ${EASE},opacity .3s,box-shadow .3s}
.g-shape-sudoku .s-c.g{background:var(--given);box-shadow:inset 0 0 0 1px var(--rim)}
.g-shape-sudoku .s-gl{width:72%;height:72%;overflow:visible;pointer-events:none}
.g-shape-sudoku .s-c.p .s-gl{filter:drop-shadow(0 0 5px var(--gc))}
.g-shape-sudoku.s-pick .s-c.e{box-shadow:inset 0 0 0 1.5px var(--teal),0 2px 8px var(--sh)}
.g-shape-sudoku.s-pick .s-c.e.x{opacity:.5;box-shadow:inset 0 0 0 1px var(--rim)}
.g-shape-sudoku .s-c.h{transform:scale(1.07);box-shadow:inset 0 0 0 2px var(--teal),0 0 14px var(--teal)}
.g-shape-sudoku .s-c.bad{box-shadow:inset 0 0 0 2px #E5446D;background-image:repeating-linear-gradient(45deg,rgba(229,68,109,.35) 0 3px,transparent 3px 7px)}
.g-shape-sudoku .s-c.sk{animation:s-sh .4s ease-in-out}
@keyframes s-sh{0%,100%{transform:none}20%{transform:translateX(-4px)}45%{transform:translateX(4px)}70%{transform:translateX(-2px)}}
.g-shape-sudoku.s-won .s-grid{box-shadow:0 0 28px var(--teal),inset 0 0 0 1px var(--rim)}
.g-shape-sudoku .s-tray{display:flex;gap:4px;justify-content:center;padding:8px 6px 14px;width:100%;box-sizing:border-box}
.g-shape-sudoku .s-slot{display:flex;flex-direction:column;align-items:center;width:56px}
.g-shape-sudoku button{font:inherit;background:none;border:0;padding:0;margin:0;cursor:pointer;color:var(--ink);-webkit-tap-highlight-color:transparent;touch-action:none}
.g-shape-sudoku .s-tr{width:52px;height:52px;border-radius:16px;background:var(--glass);box-shadow:inset 0 0 0 1px var(--rim),0 3px 8px var(--sh);display:grid;place-items:center;transition:transform .3s ${EASE},opacity .3s,box-shadow .3s}
.g-shape-sudoku .s-tr .s-gl{width:70%;height:70%}
.g-shape-sudoku .s-tr.on{transform:translateY(-6px);box-shadow:inset 0 0 0 2px var(--teal),0 8px 16px var(--sh)}
.g-shape-sudoku .s-slot.done .s-tr{opacity:.3}
.g-shape-sudoku .s-left{font-size:15px;font-weight:300;color:var(--slate);height:20px;line-height:20px}
.g-shape-sudoku .s-ghost{position:absolute;pointer-events:none;z-index:5;transform:translate(-50%,-50%) scale(1.1);filter:drop-shadow(0 8px 10px var(--sh))}
.g-shape-sudoku .s-ghost.snap{transition:left .09s ${EASE},top .09s ${EASE}}
@media (prefers-reduced-motion: reduce){.g-shape-sudoku .s-cl,.g-shape-sudoku .s-c{transition-duration:.12s!important}}
`;

export function mount(root, ctx) {
  root.classList.add('g-shape-sudoku');
  const rm = !!ctx.reduceMotion;
  const level = logic.makeLevel(ctx.level);
  const best = logic.bestScore(level);
  const n = level.size;
  let hist = newHistory(logic.initialState(level));
  let solvedFired = false, dead = false, ac = null, ro = null, sel = 0, drag = null;
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
  const bell = (f, at = 0, g = 0.05) => { blip(f, f, 0.7, g, 'sine', at); blip(f * 2, f * 2, 0.35, g * 0.35, 'sine', at); };
  const sfx = {
    pick: (v) => blip(NOTE[v - 1] * 2, NOTE[v - 1] * 2, 0.06, 0.02),
    snap: () => blip(1800, 1500, 0.025, 0.012, 'square'),
    put: (v) => bell(NOTE[v - 1]),
    no: () => blip(150, 90, 0.2, 0.07, 'triangle'),
    win: () => NOTE.forEach((f, k) => bell(f * 2, k * 0.09, 0.03)),
  };

  root.innerHTML = '';
  if (!rm) root.classList.add('s-move');
  const mk = (cls, parent = root) => { const d = document.createElement('div'); d.className = cls; parent.append(d); return d; };
  mk('s-l s-l1'); mk('s-l s-l2'); mk('s-l s-l3');
  const rd = mk('s-rd');
  rd.innerHTML = '<svg viewBox="0 0 12 12"><path d="M6 0L12 6L6 12L0 6Z"/></svg>' + '<span style="display:flex">' + [0, 1].map(() => `<span class="s-dg"><span class="s-cl">${'0123456789'.replace(/\d/g, '<i>$&</i>')}</span></span>`).join('') + '</span>';
  const cls = [...rd.querySelectorAll('.s-cl')];
  const odo = (k) => cls.forEach((c, i) => { const d = String(k).padStart(2, '0')[i]; c.style.transform = `translateY(${-d * 1.05}em)`; c.parentNode.style.opacity = i === 0 && k < 10 ? 0.18 : 1; });
  const gridEl = mk('s-grid');
  gridEl.style.gridTemplateColumns = `repeat(${n},var(--cs))`;
  const cells = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) { const e = mk('s-c', gridEl); e.dataset.r = r; e.dataset.c = c; cells.push(e); }
  const tray = mk('s-tray');
  const slots = Array.from({ length: n }, (_, i) => {
    const s = mk('s-slot', tray);
    s.innerHTML = `<button class="s-tr" data-v="${i + 1}">${glyph(i + 1, false).replace(`fill-opacity="0.38"`, `fill-opacity="0.55"`)}</button><div class="s-left"></div>`;
    s.style.setProperty('--gc', COL[i]);
    return s;
  });

  const size = () => {
    const W = root.clientWidth || 360;
    root.style.setProperty('--cs', Math.min(72, Math.floor((W - 36 - 16 - 5 * (n - 1)) / n)) + 'px');
  };
  const legal = (r, c, v) => !hist.present.grid[r].includes(v) && hist.present.grid.every((row) => row[c] !== v);
  function paint(pop = -1) {
    const g = hist.present.grid;
    cells.forEach((e, k) => {
      const r = Math.floor(k / n), c = k % n, v = g[r][c], gv = level.grid[r][c];
      if (e.dataset.v !== String(v)) {
        e.dataset.v = v; e.innerHTML = v ? glyph(v, !!gv) : '';
        if (v) e.style.setProperty('--gc', COL[v - 1]);
      }
      e.classList.toggle('g', !!gv); e.classList.toggle('p', !!v && !gv); e.classList.toggle('e', !v);
      e.classList.toggle('x', !v && !!sel && !legal(r, c, sel));
      e.classList.remove('bad', 'h');
      if (k === pop && !rm) e.animate([{ transform: 'scale(.6)', opacity: 0.2 }, { transform: 'scale(1.1)', opacity: 1, offset: 0.6 }, { transform: 'none' }], { duration: 380, easing: EASE });
    });
    let empty = 0;
    slots.forEach((s, i) => {
      const used = g.flat().filter((x) => x === i + 1).length;
      s.classList.toggle('done', used >= n); s.querySelector('.s-left').textContent = n - used;
      s.querySelector('.s-tr').classList.toggle('on', sel === i + 1);
    });
    g.forEach((row) => row.forEach((x) => { if (!x) empty++; }));
    odo(empty);
    root.classList.toggle('s-pick', !!sel);
    ctx.hud({ moves: hist.present.moves, best, tries: hist.tries, maxTries: logic.maxTries(), canUndo: hist.past.length > 0 });
  }

  function refuse(r, c, v) {
    const e = cells[r * n + c];
    e.classList.remove('sk'); void e.offsetWidth; e.classList.add('sk'); later(() => e.classList.remove('sk'), 420);
    const g = hist.present.grid, hit = [];
    for (let k = 0; k < n; k++) { if (g[r][k] === v) hit.push(cells[r * n + k]); if (g[k][c] === v) hit.push(cells[k * n + c]); }
    hit.forEach((h) => h.classList.add('bad')); later(() => hit.forEach((h) => h.classList.remove('bad')), 900);
    sfx.no();
  }
  function put(r, c, v) {
    if (solvedFired || dead) return false;
    if (hist.present.grid[r][c]) { refuse(r, c, v); return false; }
    const next = play(hist, logic, { r, c, v });
    if (next === hist) { refuse(r, c, v); return false; }
    hist = next;
    if (hist.present.grid.flat().filter((x) => x === v).length >= n) sel = 0;
    paint(r * n + c);
    ctx.sound.move(v); sfx.put(v);
    if (logic.isSolved(hist.present)) {
      solvedFired = true; root.classList.add('s-won');
      cells.forEach((e, k) => { if (!rm) e.animate([{ transform: 'none' }, { transform: 'scale(1.12)' }, { transform: 'none' }], { duration: 600, delay: 150 + (Math.floor(k / n) + (k % n)) * 70, easing: EASE }); });
      later(() => { ctx.sound.win(); sfx.win(); }, 250);
      later(() => ctx.solved({ score: logic.score(hist.present) }), 900);
    }
    return true;
  }

  // pointer: a tray press either becomes a drag (moved > 8 px) or a tap that selects the shape
  let rects = null, over = -1;
  const rr = () => root.getBoundingClientRect();
  function onDown(ev) {
    if (solvedFired || dead) return;
    const tr = ev.target.closest && ev.target.closest('.s-tr');
    if (tr) {
      unlock(); const v = +tr.dataset.v;
      if (tr.parentNode.classList.contains('done')) return;
      drag = { v, x0: ev.clientX, y0: ev.clientY, moved: false, ghost: null, was: sel === v };
      try { tr.setPointerCapture(ev.pointerId); } catch (_) {}
      return;
    }
    const ce = ev.target.closest && ev.target.closest('.s-c');
    if (ce && sel) { unlock(); put(+ce.dataset.r, +ce.dataset.c, sel); }
  }
  function onMove(ev) {
    if (!drag) return;
    if (!drag.moved && Math.hypot(ev.clientX - drag.x0, ev.clientY - drag.y0) < 8) return;
    if (!drag.moved) {
      drag.moved = true; rects = cells.map((e) => e.getBoundingClientRect());
      const gh = mk('s-ghost'); gh.innerHTML = glyph(drag.v, false); gh.style.width = gh.style.height = cells[0].offsetWidth * 0.9 + 'px';
      gh.firstChild.style.cssText = 'width:100%;height:100%;overflow:visible'; gh.style.setProperty('--gc', COL[drag.v - 1]); drag.ghost = gh;
    }
    const b = rr(), gx = ev.clientX, gy = ev.clientY - 36;
    const k = rects.findIndex((q) => gx >= q.left && gx <= q.right && gy >= q.top && gy <= q.bottom);
    const free = k >= 0 && !hist.present.grid[Math.floor(k / n)][k % n];
    if (free ? k !== over : over >= 0) { if (over >= 0) cells[over].classList.remove('h'); over = free ? k : -1; if (free) { cells[k].classList.add('h'); sfx.snap(); } }
    const q = free ? rects[k] : null;
    drag.ghost.classList.toggle('snap', !!q);
    drag.ghost.style.left = (q ? (q.left + q.right) / 2 : gx) - b.left + 'px'; drag.ghost.style.top = (q ? (q.top + q.bottom) / 2 : gy) - b.top + 'px';
  }
  function onUp() {
    if (!drag) return;
    const d = drag; drag = null;
    if (d.ghost) d.ghost.remove();
    if (over >= 0) cells[over].classList.remove('h');
    const k = over; over = -1;
    if (d.moved) { sel = 0; if (k >= 0) put(Math.floor(k / n), k % n, d.v); else paint(); }
    else { sel = d.was ? 0 : d.v; if (sel) sfx.pick(sel); paint(); }
  }
  root.addEventListener('pointerdown', onDown);
  root.addEventListener('pointermove', onMove);
  root.addEventListener('pointerup', onUp);
  root.addEventListener('pointercancel', onUp);

  size(); paint();
  if (typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(size); ro.observe(root); }

  return {
    undo() { if (solvedFired) return; hist = undo(hist, logic.maxTries()); paint(); },
    reset() { if (solvedFired) return; hist = reset(hist, logic.maxTries()); sel = 0; paint(); },
    destroy() {
      dead = true;
      ['pointerdown', 'pointermove', 'pointerup', 'pointercancel'].forEach((e, k) => root.removeEventListener(e, [onDown, onMove, onUp, onUp][k]));
      if (ro) ro.disconnect();
      timers.forEach(clearTimeout); if (ac) { try { ac.close(); } catch (_) {} ac = null; }
      root.innerHTML = ''; root.classList.remove('g-shape-sudoku', 's-move', 's-won', 's-pick');
    },
  };
}
