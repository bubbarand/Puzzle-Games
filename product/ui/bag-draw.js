// Bag Draw UI (class: Quantity). Spec 003. A velvet-dark pouch of glowing numbered stones; draws arc out of the pouch with no hand.
// Tap a shelf stone to drop it in the pouch, tap it again to take it back, tap the ring to draw. 3 draws; a spent set softly starts over.
import * as logic from '../logic/bag-draw.js';
import { newHistory, play, undo, reset } from '../logic/history.js';

const COL = ['#7B8CDE', '#4CC9F0', '#2EC4B6']; // stone tier (by value rank) -> color; tier also = rings around the stone (0, 1, 2)
const NS = 'http://www.w3.org/2000/svg';
const D = 46; // stone diameter (tap target >= 44)
const EASE = 'cubic-bezier(.215,.61,.355,1)';

export const css = `
.g-bag-draw{--bg:#F2F6FA;--ink:#1B2A3A;--slate:#5B7083;--teal:#2EC4B6;--alert:#E5446D;--dot:rgba(91,112,131,.16);--sh:rgba(27,42,58,.25);
  position:relative;overflow:hidden;min-height:560px;background:var(--bg);color:var(--ink);touch-action:manipulation;user-select:none;-webkit-user-select:none;
  font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-variant-numeric:tabular-nums}
@media (prefers-color-scheme: dark){.g-bag-draw{--bg:#0E1A2B;--ink:#E6EEF6;--slate:#8FA3B8;--dot:rgba(143,163,184,.16);--sh:rgba(0,0,0,.55)}}
.g-bag-draw .b-dots{position:absolute;inset:0;pointer-events:none}
.g-bag-draw .b-d1{background-image:radial-gradient(var(--dot) 1.5px,transparent 2px);background-size:56px 56px}
.g-bag-draw .b-d2{background-image:radial-gradient(var(--dot) 2.5px,transparent 3px);background-size:130px 130px;background-position:40px 70px}
.g-bag-draw.b-move .b-d1{animation:b-p1 50s linear infinite}
.g-bag-draw.b-move .b-d2{animation:b-p2 110s linear infinite}
@keyframes b-p1{to{background-position:56px 56px}}
@keyframes b-p2{from{background-position:40px 70px}to{background-position:-90px -60px}}
.g-bag-draw svg.b-bg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}
.g-bag-draw .b-glow{transition:opacity .6s;opacity:0}
.g-bag-draw.b-move .b-sway{animation:b-sway 7s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 0}
@keyframes b-sway{50%{transform:rotate(.7deg)}}
.g-bag-draw .b-rim{transition:stroke .2s}
.g-bag-draw.b-full .b-rim{stroke:var(--alert)}
.g-bag-draw.b-won .b-glow{opacity:1}
.g-bag-draw .b-s{position:absolute;left:0;top:0;width:${D}px;height:${D}px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-size:22px;font-weight:300;letter-spacing:-.02em;color:#10202F;cursor:pointer;-webkit-tap-highlight-color:transparent;
  background:var(--tc);background-image:linear-gradient(155deg,rgba(255,255,255,.34),rgba(255,255,255,0) 55%);
  box-shadow:0 0 16px -2px var(--tc),inset 0 0 0 1px rgba(255,255,255,.3)}
.g-bag-draw.b-ready .b-s{transition:transform .45s ${EASE}}
.g-bag-draw .b-t2{box-shadow:0 0 16px -2px var(--tc),inset 0 0 0 1px rgba(255,255,255,.3),0 0 0 2px #151a38,0 0 0 3px var(--tc)}
.g-bag-draw .b-t3{box-shadow:0 0 16px -2px var(--tc),inset 0 0 0 1px rgba(255,255,255,.3),0 0 0 2px #151a38,0 0 0 3px var(--tc),0 0 0 5px #151a38,0 0 0 6px var(--tc)}
.g-bag-draw .b-neg{--tc:#8FA3B8;background:#3A4663;color:#DDE6F2;box-shadow:inset 0 0 0 2px #8FA3B8,inset 0 0 0 4px #3A4663,0 0 10px -3px #000;
  background-image:repeating-linear-gradient(135deg,rgba(255,255,255,.1) 0 2px,transparent 2px 6px)}
.g-bag-draw .b-shelf{background:var(--slate);opacity:.1;box-shadow:none;background-image:none;pointer-events:none;position:absolute}
.g-bag-draw .b-hand{pointer-events:none;z-index:6;width:var(--hs);height:var(--hs);font-size:calc(var(--hs)*.46)}
.g-bag-draw .b-shake{animation:b-sh .4s ease-in-out}
@keyframes b-sh{0%,100%{margin-left:0}20%{margin-left:-5px}45%{margin-left:5px}70%{margin-left:-3px}}
.g-bag-draw .b-read{position:absolute;left:18px;top:14px;display:flex;align-items:baseline;gap:7px;color:var(--slate);font-size:14px;font-weight:300;pointer-events:none}
.g-bag-draw .b-read b{display:inline-flex;color:var(--ink);font-weight:200;font-size:36px;letter-spacing:-.03em;line-height:1.05}
.g-bag-draw .b-dg{display:block;height:1.05em;overflow:hidden}
.g-bag-draw .b-col{display:flex;flex-direction:column;transition:transform .6s ${EASE}}
.g-bag-draw .b-col i{display:block;font-style:normal;height:1.05em;line-height:1.05em}
.g-bag-draw .b-dm{width:8px;height:8px;background:currentColor;transform:rotate(45deg);align-self:center}
.g-bag-draw .b-pips{position:absolute;right:18px;top:24px;display:flex;gap:8px;pointer-events:none}
.g-bag-draw .b-pips i{width:12px;height:12px;border-radius:50%;background:#7B8CDE;box-shadow:0 0 10px #7B8CDE;transition:opacity .5s,transform .5s ${EASE}}
.g-bag-draw .b-pips i.off{opacity:.18;transform:scale(.55);box-shadow:none}
.g-bag-draw .b-go{position:absolute;width:64px;height:64px;border-radius:50%;border:0;padding:0;background:none;color:var(--ink);cursor:pointer;-webkit-tap-highlight-color:transparent;
  display:grid;place-items:center;font-size:24px;font-weight:200;font-family:inherit;transition:opacity .3s,transform .3s ${EASE}}
.g-bag-draw .b-go svg{position:absolute;inset:0;width:100%;height:100%}
.g-bag-draw .b-go.off{opacity:.4}
.g-bag-draw .b-go.live{animation:b-pulse 2.4s ease-in-out infinite}
.g-bag-draw:not(.b-move) .b-go.live{animation:none}
@keyframes b-pulse{50%{transform:scale(1.07)}}
.g-bag-draw .b-ring{transition:stroke-dashoffset .5s ${EASE}}
.g-bag-draw.b-won .b-go{color:var(--teal)}
@media (prefers-reduced-motion: reduce){.g-bag-draw.b-ready .b-s,.g-bag-draw .b-col{transition-duration:.12s!important}}
`;

export function mount(root, ctx) {
  root.classList.add('g-bag-draw');
  const rm = !!ctx.reduceMotion;
  const level = logic.makeLevel(ctx.level);
  const best = logic.bestScore(level);
  const N = level.tiles.length;
  let hist = newHistory(logic.initialState(level));
  let prior = 0, busy = false, solvedFired = false, dead = false, ac = null, hand = [], G = null, ro = null;
  const timers = new Set();
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };

  // Own tiny synth (glass drops, rising chimes); ctx.sound still plays the class chime.
  const blip = (f0, f1, dur, gain, type = 'sine', at = 0) => {
    if (!ac) return;
    const t = ac.currentTime + at, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + 0.05);
  };
  const unlock = () => { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { ac = null; } } if (ac && ac.state === 'suspended') ac.resume(); };
  const PENT = [0, 2, 4, 7, 9, 12, 14, 16, 19];
  const sfx = {
    drop: () => blip(700, 240, 0.14, 0.06),
    lift: () => blip(240, 700, 0.12, 0.05),
    no: () => blip(150, 90, 0.2, 0.08, 'triangle'),
    pull: (k) => blip(660 * 2 ** (PENT[k % PENT.length] / 12), 660 * 2 ** (PENT[k % PENT.length] / 12) * 0.99, 0.5, 0.05),
    miss: () => blip(330, 220, 0.6, 0.04, 'sine'),
    win: () => [1568, 1976, 2349, 3136].forEach((f, k) => blip(f, f * 0.995, 0.9, 0.035, 'sine', k * 0.11)),
  };

  root.innerHTML = '';
  if (!rm) root.classList.add('b-move');
  const mk = (cls, tag = 'div', parent = root) => { const d = document.createElement(tag); d.className = cls; parent.append(d); return d; };
  mk('b-dots b-d1'); mk('b-dots b-d2');
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'b-bg'); root.append(svg);
  const read = mk('b-read');
  read.innerHTML = `<span class="b-dm"></span><b></b><span>/ ${level.target}</span>`;
  const pips = mk('b-pips'); pips.innerHTML = '<i></i><i></i><i></i>';
  const go = mk('b-go', 'button'); go.setAttribute('aria-label', 'Draw');
  const digits = String(level.target).length + 1;
  const nb = read.querySelector('b');
  nb.innerHTML = Array.from({ length: digits }, () => `<span class="b-dg"><span class="b-col">${'0123456789'.replace(/\d/g, '<i>$&</i>')}</span></span>`).join('');
  const cols = [...nb.querySelectorAll('.b-col')];
  let shown = 0;
  const odo = (n) => { // roll each digit column to n
    const str = String(Math.max(0, n)).padStart(digits, '0');
    cols.forEach((c, k) => { c.style.transitionDuration = rm ? '.01s' : ''; c.style.transform = `translateY(${-str[k] * 1.05}em)`; c.parentNode.style.opacity = digits - k <= String(Math.max(0, n)).length ? 1 : 0.18; });
    shown = n;
  };

  const pos = [...level.tiles].filter((v) => v > 0).sort((a, b) => a - b);
  const tier = level.tiles.map((v) => (v <= 0 ? 0 : v >= pos[Math.floor(pos.length * 2 / 3)] ? 3 : v >= pos[Math.floor(pos.length / 3)] ? 2 : 1));
  const els = level.tiles.map((v, i) => {
    const e = mk('b-s ' + (tier[i] ? 'b-t' + tier[i] : 'b-neg'));
    e.dataset.i = i; e.textContent = v; if (tier[i]) e.style.setProperty('--tc', COL[tier[i] - 1]);
    const g = mk('b-s b-shelf'); return { e, g };
  });

  function build() {
    const W = root.clientWidth || 360, H = Math.max(root.clientHeight || 560, 560);
    const pw = W - 36, pt = 112, pb = pt + 150, cx = W / 2;
    G = { W, H, pw, pt, pb, cx, btn: { x: cx, y: pb + 40 }, shelfTop: pb + 82, handY: 78 };
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const l = cx - pw / 2, r = cx + pw / 2, nk = 54;
    const body = `M${cx - nk} ${pt}C${cx - nk - 4} ${pt + 30} ${l} ${pt + 34} ${l} ${pt + 80}C${l} ${pb - 6} ${l + 40} ${pb} ${cx} ${pb}C${r - 40} ${pb} ${r} ${pb - 6} ${r} ${pt + 80}C${r} ${pt + 34} ${cx + nk + 4} ${pt + 30} ${cx + nk} ${pt}Z`;
    svg.innerHTML = `<defs><linearGradient id="bv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#38458A"/><stop offset="1" stop-color="#121838"/></linearGradient>
      <radialGradient id="bg" cx=".5" cy=".75" r=".6"><stop offset="0" stop-color="#2EC4B6" stop-opacity=".55"/><stop offset="1" stop-color="#2EC4B6" stop-opacity="0"/></radialGradient>
      <filter id="bs" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="12" stdDeviation="10" flood-color="#0b1020" flood-opacity=".35"/></filter></defs>
      <g class="b-sway"><path d="${body}" fill="url(#bv)" filter="url(#bs)" stroke="#7B8CDE" stroke-opacity=".3" stroke-width="1.2"/>
      <path class="b-glow" d="${body}" fill="url(#bg)"/>
      <path d="M${l + 14} ${pt + 90}C${l + 14} ${pb - 18} ${l + 48} ${pb - 12} ${cx} ${pb - 12}C${r - 48} ${pb - 12} ${r - 14} ${pb - 18} ${r - 14} ${pt + 90}" fill="none" stroke="#8FA3B8" stroke-opacity=".28" stroke-width="1.2" stroke-dasharray="3 6" stroke-linecap="round"/>
      <path d="M${l + 26} ${pt + 40}C${l + 12} ${pt + 56} ${l + 8} ${pt + 80} ${l + 10} ${pt + 105}" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width="10" stroke-linecap="round"/>
      <ellipse class="b-rim" cx="${cx}" cy="${pt}" rx="${nk}" ry="9" fill="#0B0F26" stroke="#7B8CDE" stroke-width="2"/>
      <path d="M${cx - nk} ${pt + 14}Q${cx} ${pt + 30} ${cx + nk} ${pt + 14}" fill="none" stroke="#7B8CDE" stroke-width="2" stroke-linecap="round"/>
      <circle cx="${cx + nk - 6}" cy="${pt + 22}" r="3" fill="#7B8CDE"/></g>
      <circle cx="${G.btn.x}" cy="${G.btn.y}" r="29" fill="none" stroke="var(--slate)" stroke-opacity=".25" stroke-width="1.5"/>`;
    go.style.left = G.btn.x - 32 + 'px'; go.style.top = G.btn.y - 32 + 'px';
    go.innerHTML = `<svg viewBox="0 0 64 64"><circle class="b-ring" cx="32" cy="32" r="29" fill="none" stroke="#7B8CDE" stroke-width="2.5" stroke-linecap="round" transform="rotate(-90 32 32)" stroke-dasharray="${2 * Math.PI * 29}" stroke-dashoffset="${2 * Math.PI * 29}"/></svg>${level.n}`;
  }

  const shelfPos = () => {
    const per = Math.max(1, Math.floor((G.W - 24) / (D + 10))), out = [], rows = Math.ceil(N / per);
    const availH = G.H - G.shelfTop - 12, step = Math.min(D + 14, availH / rows), y0 = G.shelfTop + Math.max(0, (availH - rows * step) / 2) + D / 2;
    for (let i = 0; i < N; i++) {
      const row = Math.floor(i / per), cnt = Math.min(per, N - row * per), k = i - row * per;
      out[i] = { x: G.W / 2 + (k - (cnt - 1) / 2) * (D + 10), y: y0 + row * step };
    }
    return out;
  };
  const bagPos = (ids) => {
    const per = Math.max(1, Math.floor((G.pw - 70) / (D + 6))), out = {}, rows = Math.ceil(ids.length / per);
    ids.forEach((id, j) => {
      const row = Math.floor(j / per), cnt = Math.min(per, ids.length - row * per), k = j - row * per;
      out[id] = { x: G.cx + (k - (cnt - 1) / 2) * (D + 6) + ((id * 7) % 5 - 2), y: G.pb - 34 - row * (D + 4) + (rows > 1 ? 0 : 0) - ((id * 3) % 3) };
    });
    return out;
  };
  const place = (e, p) => { e.style.transform = `translate(${p.x - D / 2}px,${p.y - D / 2}px)`; };

  function render(opts = {}) {
    const s = hist.present, sp = shelfPos(), ids = s.bag, bp = bagPos(ids);
    els.forEach(({ e, g }, i) => {
      const inBag = ids.includes(i);
      place(e, inBag ? bp[i] : sp[i]); e.style.zIndex = inBag ? 3 : 2;
      place(g, sp[i]); g.style.display = inBag ? '' : 'none';
    });
    const need = level.n, frac = Math.min(1, ids.length / need), circ = 2 * Math.PI * 29;
    go.querySelector('.b-ring').style.strokeDashoffset = circ * (1 - frac);
    const ok = ids.length >= need && !busy && !solvedFired && s.draws < 3;
    go.classList.toggle('off', !ok); go.classList.toggle('live', ok);
    const sum = ids.reduce((a, i) => a + level.tiles[i], 0);
    svg.querySelector('.b-glow').style.opacity = solvedFired ? 1 : Math.max(0, Math.min(0.9, sum / level.target * 0.7));
    [...pips.children].forEach((p, k) => p.classList.toggle('off', k < s.draws));
    root.classList.toggle('b-full', ids.length >= level.cap && !solvedFired);
    if (!opts.quiet) ctx.hud({ moves: prior + s.moves, best, tries: s.draws, maxTries: logic.maxTries(), canUndo: false });
  }

  function clearHand(fade = true) {
    hand.forEach((h) => { if (fade && !rm) h.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }).onfinish = () => h.remove(); else h.remove(); });
    hand = [];
  }

  function doDraw() {
    const before = hist.present, next = play(hist, logic, { t: 'draw' });
    if (next === hist) return;
    hist = next; busy = true; clearHand(false);
    const s = hist.present, n = s.drawn.length, hs = Math.min(D, (G.W - 24) / n - 6), bp = bagPos(before.bag);
    let run = 0;
    odo(0); render();
    s.drawn.forEach((ti, k) => {
      const e = els[ti].e.cloneNode(true);
      e.classList.add('b-hand'); e.style.setProperty('--hs', hs + 'px'); e.style.cssText += ';opacity:0';
      root.append(e); hand.push(e);
      const sx = bp[ti].x - D / 2, sy = bp[ti].y - D / 2, sc0 = D / hs;
      const tx = G.W / 2 + (k - (n - 1) / 2) * (hs + 6) - hs / 2, ty = G.handY - hs / 2 - Math.sin(Math.PI * (n > 1 ? k / (n - 1) : .5)) * 10;
      const mid = `translate(${(sx + tx) / 2 + (k % 2 ? 26 : -26)}px,${Math.min(sy, ty) - 36}px) scale(${(1 + sc0) / 2})`;
      const frames = [{ transform: `translate(${sx}px,${sy}px) scale(${sc0})`, opacity: 1 }, { transform: mid, opacity: 1, offset: .5 }, { transform: `translate(${tx}px,${ty}px) scale(1)`, opacity: 1 }];
      e.style.left = e.style.top = '0';
      const delay = rm ? 0 : k * 130;
      e.animate(frames, { duration: rm ? 1 : 620, delay, easing: EASE, fill: 'both' });
      run += level.tiles[ti];
      const part = run;
      later(() => { odo(part); sfx.pull(k); ctx.sound.move(part); }, delay + (rm ? 0 : 480));
    });
    const total = (rm ? 0 : (n - 1) * 130) + (rm ? 50 : 700);
    later(() => {
      busy = false;
      if (logic.isSolved(hist.present)) {
        solvedFired = true; root.classList.add('b-won'); render({ quiet: true });
        hand.forEach((h) => { if (!rm) h.animate([{ filter: 'brightness(1)' }, { filter: 'brightness(1.5)' }, { filter: 'brightness(1)' }], { duration: 900 }); });
        ctx.sound.win(); sfx.win();
        later(() => ctx.solved({ score: prior + logic.score(hist.present) }), 700);
      } else if (hist.present.draws >= 3) {
        sfx.miss();
        later(() => { clearHand(); prior += hist.present.moves; hist = newHistory(logic.initialState(level)); odo(0); render(); }, 1700); // spent: fade and start over, moves still counted
      } else { sfx.miss(); render(); }
    }, total);
  }

  function onUp(ev) {
    if (solvedFired || dead || busy) return;
    unlock();
    if (go.contains(ev.target)) { if (!go.classList.contains('off')) doDraw(); return; }
    const el = ev.target.closest && ev.target.closest('.b-s');
    if (!el || el.dataset.i === undefined) return;
    const i = +el.dataset.i, inBag = hist.present.bag.includes(i);
    const next = play(hist, logic, { t: inBag ? 'rm' : 'add', i });
    if (next === hist) {
      sfx.no(); el.classList.remove('b-shake'); void el.offsetWidth; el.classList.add('b-shake');
      later(() => el.classList.remove('b-shake'), 420); return;
    }
    hist = next;
    if (hand.length) { clearHand(); odo(0); }
    render();
    (inBag ? sfx.lift : sfx.drop)();
    ctx.sound.move(hist.present.bag.reduce((a, j) => a + level.tiles[j], 0));
  }
  root.addEventListener('pointerup', onUp);

  build(); odo(0); render();
  later(() => root.classList.add('b-ready'), 60);
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => { if (root.clientWidth && Math.abs(root.clientWidth - G.W) > 1 && !busy) { build(); render({ quiet: true }); } });
    ro.observe(root);
  }

  return {
    undo() { hist = undo(hist, logic.maxTries()); }, // limited tries: no-op
    reset() { hist = reset(hist, logic.maxTries()); },
    destroy() {
      dead = true;
      root.removeEventListener('pointerup', onUp);
      if (ro) ro.disconnect();
      timers.forEach(clearTimeout); if (ac) { try { ac.close(); } catch (_) {} ac = null; }
      root.innerHTML = ''; root.classList.remove('g-bag-draw', 'b-move', 'b-ready', 'b-won', 'b-full');
    },
  };
}
