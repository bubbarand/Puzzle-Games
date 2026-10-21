// Knapsack UI (class: Quantity). Spec 003. Items are HTML circles that glide between a tray and the bag; bag and gauge are SVG.
import * as logic from '../logic/knapsack.js';
import { newHistory, play, undo, reset } from '../logic/history.js';

const COL = { 1: '#7B8CDE', 2: '#4CC9F0', 3: '#2EC4B6' }; // value tier -> color; tier also = rings around the circle (0, 1, 2)
const NS = 'http://www.w3.org/2000/svg';
let uid = 0;

export const css = `
.g-knapsack{--bg:#F2F6FA;--ink:#1B2A3A;--slate:#5B7083;--teal:#2EC4B6;--alert:#E5446D;--dot:rgba(91,112,131,.16);--sh:rgba(27,42,58,.22);
  position:relative;overflow:hidden;min-height:560px;background:var(--bg);color:var(--ink);touch-action:manipulation;user-select:none;-webkit-user-select:none;
  font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-variant-numeric:tabular-nums}
@media (prefers-color-scheme: dark){.g-knapsack{--bg:#0E1A2B;--ink:#E6EEF6;--slate:#8FA3B8;--dot:rgba(143,163,184,.16);--sh:rgba(0,0,0,.5)}}
.g-knapsack .k-dots{position:absolute;inset:0;pointer-events:none}
.g-knapsack .k-d1{background-image:radial-gradient(var(--dot) 1.5px,transparent 2px);background-size:56px 56px}
.g-knapsack .k-d2{background-image:radial-gradient(var(--dot) 2.5px,transparent 3px);background-size:130px 130px;background-position:40px 70px}
.g-knapsack.k-move .k-d1{animation:k-p1 50s linear infinite}
.g-knapsack.k-move .k-d2{animation:k-p2 110s linear infinite}
@keyframes k-p1{to{background-position:56px 56px}}
@keyframes k-p2{from{background-position:40px 70px}to{background-position:-90px -60px}}
.g-knapsack svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}
.g-knapsack .k-bag{transition:transform .5s cubic-bezier(.215,.61,.355,1)}
.g-knapsack .k-water,.g-knapsack .k-fill{transition:transform .4s cubic-bezier(.215,.61,.355,1)}
.g-knapsack .k-glow{opacity:0;filter:drop-shadow(0 0 7px var(--teal));transition:opacity .5s}
.g-knapsack.k-won .k-glow{opacity:1}
.g-knapsack.k-won .k-bag{transition:transform 1.6s cubic-bezier(.45,0,.7,.5)}
.g-knapsack.k-won.k-ready .k-item{transition:transform 1.6s cubic-bezier(.45,0,.7,.5)}
.g-knapsack.k-won .k-env{filter:drop-shadow(0 0 9px var(--teal))}
.g-knapsack .k-bfill{transition:transform .5s cubic-bezier(.215,.61,.355,1)}
.g-knapsack .k-lim{transition:stroke-width .2s}
.g-knapsack.k-flash .k-lim{stroke-width:5}
.g-knapsack .k-item{position:absolute;left:0;top:0;cursor:pointer;-webkit-tap-highlight-color:transparent}
.g-knapsack.k-ready .k-item{transition:transform .38s cubic-bezier(.215,.61,.355,1)}
.g-knapsack .k-c{width:100%;height:100%;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;
  box-shadow:0 8px 22px -6px var(--sh),inset 0 0 0 1px rgba(255,255,255,.28);background-image:linear-gradient(160deg,rgba(255,255,255,.22),rgba(255,255,255,0) 55%);color:#10202F;font-weight:300;line-height:1.05}
.g-knapsack .k-c b{font-size:21px;font-weight:300;letter-spacing:-.02em;display:flex;align-items:center;gap:3px}
.g-knapsack .k-c i{font-style:normal;font-size:11px;font-weight:400;letter-spacing:.04em;display:flex;align-items:center;gap:3px;opacity:.7}
.g-knapsack .k-c b .sq{width:5px;height:5px}
.g-knapsack .k-t2 .k-c{box-shadow:0 8px 22px -6px var(--sh),inset 0 0 0 1px rgba(255,255,255,.28),0 0 0 2px var(--bg),0 0 0 3px var(--tc)}
.g-knapsack .k-t3 .k-c{box-shadow:0 8px 22px -6px var(--sh),inset 0 0 0 1px rgba(255,255,255,.28),0 0 0 2px var(--bg),0 0 0 3px var(--tc),0 0 0 5px var(--bg),0 0 0 6px var(--tc)}
.g-knapsack .k-item::after{content:'';position:absolute;inset:var(--hit,0)}
.g-knapsack .k-shake .k-c{animation:k-sh .4s ease-in-out}
@keyframes k-sh{0%,100%{transform:none}20%{transform:translateX(-5px)}45%{transform:translateX(5px)}70%{transform:translateX(-3px)}}
.g-knapsack .k-ghost{position:absolute;left:0;top:0;border-radius:50%;background:var(--slate);opacity:.1;pointer-events:none}
.g-knapsack .sq,.g-knapsack .dm{display:inline-block;width:7px;height:7px;background:currentColor}
.g-knapsack .dm{transform:rotate(45deg) scale(.85)}
.g-knapsack .k-read{position:absolute;display:flex;align-items:baseline;gap:6px;font-size:14px;font-weight:300;color:var(--slate);justify-content:center;white-space:nowrap;pointer-events:none}
.g-knapsack .k-read b{color:var(--ink);font-weight:200;font-size:34px;letter-spacing:-.03em;line-height:1.05;display:inline-flex}
.g-knapsack .k-dg{display:block;height:1.05em;overflow:hidden;transition:opacity .3s}
.g-knapsack .k-col{display:flex;flex-direction:column;transition:transform .6s cubic-bezier(.215,.61,.355,1)}
.g-knapsack .k-col i{display:block;font-style:normal;height:1.05em;line-height:1.05em}
.g-knapsack .k-read .sq,.g-knapsack .k-read .dm{align-self:center}
.g-knapsack .k-wv{animation:k-wave 6s linear infinite}
@keyframes k-wave{to{transform:translateX(var(--wp))}}
.g-knapsack:not(.k-move) .k-wv{animation:none}
/* legend: value diamond, arrow, then the three tier dots with 0, 1, 2 rings (more rings = more value) */
.g-knapsack .k-leg{position:absolute;display:flex;align-items:center;justify-content:center;gap:9px;color:var(--slate);pointer-events:none}
.g-knapsack .k-leg .dm{width:6px;height:6px}
.g-knapsack .k-leg svg{position:static;width:13px;height:9px;fill:none;stroke:currentColor;stroke-width:1.3;stroke-linecap:round;stroke-linejoin:round;overflow:visible}
.g-knapsack .k-ld{width:11px;height:11px;border-radius:50%;background:var(--tc);margin:0 3px}
.g-knapsack .k-ld.k-t2{box-shadow:0 0 0 2px var(--bg),0 0 0 3px var(--tc)}
.g-knapsack .k-ld.k-t3{box-shadow:0 0 0 2px var(--bg),0 0 0 3px var(--tc),0 0 0 5px var(--bg),0 0 0 6px var(--tc);margin:0 6px}
.g-knapsack.k-move .k-bob{animation:k-bob 4s ease-in-out infinite}
@keyframes k-bob{50%{transform:translateY(-2px)}}
.g-knapsack.k-move .k-tr{animation:k-spin 40s linear infinite;transform-box:fill-box;transform-origin:center}
@keyframes k-spin{to{transform:rotate(360deg)}}
.g-knapsack.k-won .k-tgt{animation:k-pop .9s cubic-bezier(.215,.61,.355,1)}
@keyframes k-pop{40%{transform:scale(1.5)}}
@media (prefers-reduced-motion: reduce){.g-knapsack.k-ready .k-item,.g-knapsack .k-bag,.g-knapsack .k-water,.g-knapsack .k-fill,.g-knapsack .k-bfill{transition-duration:.12s!important}}
`;

export function mount(root, ctx) {
  root.classList.add('g-knapsack');
  const rm = !!ctx.reduceMotion;
  const level = logic.makeLevel(ctx.level);
  const best = logic.bestScore(level);
  let hist = newHistory(logic.initialState(level));
  let solvedFired = false, dead = false, dlt = 0, ac = null;
  const timers = new Set();
  // Own tiny synth for the Knapsack voice (water drops, odometer ticks, glass shimmer); ctx.sound still plays the class chime.
  const blip = (f0, f1, dur, gain, type = 'sine', at = 0) => {
    if (!ac) return;
    const t = ac.currentTime + at, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + 0.05);
  };
  const unlock = () => { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { ac = null; } } if (ac && ac.state === 'suspended') ac.resume(); };
  const sfx = {
    add: () => blip(980, 360, 0.16, 0.06),
    out: () => blip(360, 980, 0.13, 0.05),
    no: () => blip(150, 90, 0.2, 0.08, 'triangle'),
    ticks: (n) => { for (let k = 0; k < Math.min(6, n); k++) blip(2600, 2600, 0.02, 0.016, 'square', 0.05 + k * 0.07); },
    win: () => [1568, 1976, 2349, 3136].forEach((f, k) => blip(f, f * 0.995, 0.9, 0.035, 'sine', k * 0.11)),
  };
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };

  root.innerHTML = '';
  if (!rm) root.classList.add('k-move');
  const mk = (cls, parent = root) => { const d = document.createElement('div'); d.className = cls; parent.append(d); return d; };
  mk('k-dots k-d1'); mk('k-dots k-d2');
  const svg = document.createElementNS(NS, 'svg'); root.append(svg);
  const readW = mk('k-read'), readV = mk('k-read');
  const ico = (c) => `<span class="${c}"></span>`;
  readW.innerHTML = `${ico('sq')}<b></b><span>/ ${level.cap}</span>`;
  readV.innerHTML = `${ico('dm')}<b></b><span>/ ${level.target}</span>`;
  const leg = mk('k-leg');
  leg.innerHTML = `${ico('dm')}<svg viewBox="0 0 13 9"><path d="M1 4.5h10M8 1.5l3 3-3 3"/></svg>` + [1, 2, 3].map((t) => `<span class="k-ld k-t${t}" style="--tc:${COL[t]}"></span>`).join('');
  const nW = readW.querySelector('b'), nV = readV.querySelector('b');
  // odometer: each digit is a column of 0-9 twice, so it can roll forward through the wrap
  const odo = (host, digits) => {
    host.innerHTML = Array.from({ length: digits }, () => `<span class="k-dg"><span class="k-col">${'01234567890123456789'.replace(/\d/g, '<i>$&</i>')}</span></span>`).join('');
    host._n = 0; host._cols = [...host.querySelectorAll('.k-col')]; host._cols.forEach((c, k) => { c._p = 0; c.parentNode.style.opacity = k === digits - 1 ? 1 : 0; });
  };
  odo(nW, String(level.cap).length); odo(nV, Math.max(String(level.target).length, String(level.items.reduce((a, it) => a + it[1], 0)).length));

  // item geometry: radius follows weight
  const rad = level.items.map(([w]) => 21 + 1.6 * w);
  const vs = level.items.map((it) => it[1]).sort((a, b) => a - b);
  const tier = level.items.map(([, v]) => (v >= vs[Math.floor(vs.length * 2 / 3)] ? 3 : v >= vs[Math.floor(vs.length / 3)] ? 2 : 1));
  const els = level.items.map(([w, v], i) => {
    const r = rad[i];
    const g = mk('k-ghost'); g.style.width = g.style.height = 2 * r + 'px';
    const e = mk('k-item k-t' + tier[i]); e.dataset.i = i; e.style.setProperty('--tc', COL[tier[i]]); e.style.width = e.style.height = 2 * r + 'px';
    e.innerHTML = `<div class="k-c" style="background:${COL[tier[i]]}"><b>${ico('sq')}${w}</b><i>${ico('dm')}${v}</i></div>`;
    return { e, g };
  });

  let G = null, water, fill, bag, bfill;
  function build() {
    const W = root.clientWidth || 360, H = Math.max(root.clientHeight || 560, 560);
    const bw = W * 0.7, bx = W * 0.06, by = Math.max(142, H * 0.21), bh = Math.min(H * 0.28, 230); // room above the bag for the balloon that carries it
    const gx = W - 40, gb = by + bh, limY = by + bh * 0.13, id = 'kc' + (++uid);
    const P = bw / 4; let wave = `M${bx - bw / 2} ${limY}q${P / 2} -5 ${P} 0`; for (let k = 1; k < 8; k++) wave += `t${P} 0`; wave += `V${limY + 6}H${bx - bw / 2}Z`;
    const cx = bx + bw / 2, hy = by - 14, knot = hy - 26, ry = 38, rx = 30, cy = knot - ry + 2;
    const env = `M${cx} ${cy - ry}C${cx + rx * 1.3} ${cy - ry} ${cx + rx * 1.2} ${cy + ry * .5} ${cx + 5} ${knot}H${cx - 5}C${cx - rx * 1.2} ${cy + ry * .5} ${cx - rx * 1.3} ${cy - ry} ${cx} ${cy - ry}Z`; // teardrop balloon
    G = { W, H, bx, bw, by, bh, gx, gb, limY, cx, cy };
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const st = 'fill="none" stroke="var(--slate)" stroke-width="2.5" stroke-linecap="round"';
    svg.innerHTML = `<defs><clipPath id="${id}b"><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="17"/></clipPath>
      <clipPath id="${id}e"><path d="${env}"/></clipPath><clipPath id="${id}g"><rect x="${gx - 6}" y="${by}" width="12" height="${bh}" rx="6"/></clipPath></defs>
      <g class="k-bag"><g ${st} stroke-width="1.5"><path d="M${cx - 6} ${knot - 3}L${bx + bw * .3} ${hy}M${cx + 6} ${knot - 3}L${bx + bw * .7} ${hy}"/></g>
        <g class="k-balloon"><g class="k-bob"><g class="k-env"><path d="${env}" fill="var(--bg)"/>
          <g clip-path="url(#${id}e)"><rect class="k-bfill" x="${cx - rx}" y="${cy - ry}" width="${2 * rx}" height="${2 * ry}" fill="#7B8CDE" opacity=".55"/></g>
          <path d="M${cx} ${cy - ry}Q${cx - rx * .62} ${cy} ${cx - 4} ${knot}M${cx} ${cy - ry}Q${cx + rx * .62} ${cy} ${cx + 4} ${knot}" fill="none" stroke="var(--bg)" stroke-width="1.2" opacity=".7"/>
          <path d="${env}" fill="none" stroke="#2EC4B6" stroke-width="2.5" stroke-linejoin="round"/>
          <rect x="${cx - 5}" y="${knot - 1}" width="10" height="5" rx="1.6" fill="var(--bg)" stroke="#2EC4B6" stroke-width="2"/></g></g></g>
        <path d="M${bx + bw * .3} ${by} V${hy} H${bx + bw * .7} V${by}" ${st} stroke-linejoin="round"/>
        <g clip-path="url(#${id}b)"><g class="k-water"><rect x="${bx}" y="${limY + 6}" width="${bw}" height="${gb - limY}" fill="#2EC4B6" opacity=".22"/>
          <g class="k-wv" style="--wp:${bw / 2}px"><path d="${wave}" fill="#2EC4B6" opacity=".22"/><path d="${wave.split('V')[0]}" fill="none" stroke="#2EC4B6" stroke-width="1.5" opacity=".7"/></g></g></g>
        <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="17" ${st}/>
        <line class="k-lim" x1="${bx}" x2="${bx + bw}" y1="${limY}" y2="${limY}" stroke="#E5446D" stroke-width="2" stroke-dasharray="5 5"/></g>
      <rect class="k-glow" x="${gx - 6}" y="${by}" width="12" height="${bh}" rx="6" fill="#2EC4B6"/>
      <line x1="${gx}" x2="${gx}" y1="${by + 6}" y2="${gb - 6}" ${st}/>
      <g clip-path="url(#${id}g)"><rect class="k-fill" x="${gx - 6}" y="${by}" width="12" height="${bh}" fill="#2EC4B6"/></g>
      <g ${st} stroke-width="2">${[1, 2, 3].map((k) => `<path d="M${gx - 18} ${by + bh * k / 4}h8"/>`).join('')}</g>
      <line x1="${gx}" x2="${gx}" y1="${by - 33}" y2="${by + 2}" stroke="#7B8CDE" stroke-width="1.5" stroke-dasharray="2 4" stroke-linecap="round"/>
      <g class="k-tgt" style="transform-origin:${gx}px ${by - 44}px"><g transform="translate(${gx} ${by - 44})"><g class="k-tr" stroke="#7B8CDE" stroke-width="1.5" stroke-linecap="round">${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => `<path d="M0 -13.5V-17" transform="rotate(${k * 45})"/>`).join('')}</g>
        <circle r="9.5" fill="var(--bg)" stroke="#7B8CDE" stroke-width="1.5"/><rect x="-3.6" y="-3.6" width="7.2" height="7.2" fill="#7B8CDE" transform="rotate(45)"/></g></g>`;
    bfill = svg.querySelector('.k-bfill'); water = svg.querySelector('.k-water'); fill = svg.querySelector('.k-fill'); bag = svg.querySelector('.k-bag');
    readW.style.cssText = `left:${bx}px;width:${bw}px;top:${gb + 14}px`;
    readV.style.cssText = `left:${W - 120}px;width:112px;top:${gb + 14}px`;
    leg.style.cssText = `left:${W - 134}px;width:112px;top:${gb + 54}px`;
  }

  // Fixed tray slot per item (so slots never reshuffle) and shelf packing inside the bag.
  function trayPos() {
    const top = G.gb + 78, availH = G.H - top - 12, W = G.W - 32;
    for (let s = 1.4; s >= 0.8; s -= 0.05) { // few items (easy levels): start big so the tray fills its space
      const rows = []; let row = [], used = 0;
      rad.forEach((r, i) => {
        const d = 2 * r * s;
        if (row.length && used + d > W) { rows.push(row); row = []; used = 0; }
        row.push(i); used += d + 10;
      });
      rows.push(row);
      const rh = rows.map((rw) => Math.max(...rw.map((i) => 2 * rad[i] * s)));
      const tot = rh.reduce((a, b) => a + b + 10, -10);
      if (tot <= availH || s <= 0.8) {
        const out = []; let y = top + Math.max(0, (availH - tot) / 2);
        rows.forEach((rw, ri) => {
          const wd = rw.reduce((a, i) => a + 2 * rad[i] * s + 10, -10); let x = G.W / 2 - wd / 2;
          rw.forEach((i) => { const d = 2 * rad[i] * s; out[i] = { x: x + d / 2, y: y + rh[ri] / 2, s }; x += d + 10; });
          y += rh[ri] + 10;
        });
        return out;
      }
    }
  }
  function bagPos(ids, lift) { // in the bag every item stays at least 44 px wide (tap target); the bag is large enough for max load
    const inW = G.bw - 22, bottom = G.gb - 8, top = G.limY + 6, out = {}, gap = 8;
    for (let k = 0.85; k >= 0.45; k -= 0.05) {
      const sc = (i) => Math.max(44 / (2 * rad[i]), k);
      const rows = []; let row = [], used = 0;
      ids.forEach((i) => {
        const d = 2 * rad[i] * sc(i);
        if (row.length && used + d > inW) { rows.push(row); row = []; used = 0; }
        row.push(i); used += d + gap;
      });
      if (row.length) rows.push(row);
      const rh = rows.map((rw) => Math.max(...rw.map((i) => 2 * rad[i] * sc(i))));
      const tot = rh.reduce((a, b) => a + b + gap, -gap);
      if (tot <= bottom - top || k < 0.5) {
        let y = bottom;
        rows.forEach((rw, ri) => {
          const wd = rw.reduce((a, i) => a + 2 * rad[i] * sc(i) + gap, -gap); let x = G.bx + G.bw / 2 - wd / 2;
          rw.forEach((i) => { const d = 2 * rad[i] * sc(i); out[i] = { x: x + d / 2, y: y - rh[ri] / 2 + lift, s: sc(i) }; x += d + gap; });
          y -= rh[ri] + gap;
        });
        break;
      }
    }
    return out;
  }

  function odoSet(host, n) { // rolls each digit column; returns how far the number moved
    const cols = host._cols, str = String(n).padStart(cols.length, '0'), up = n >= host._n, moved = Math.abs(n - host._n);
    host._n = n;
    const at = (c, p, dur) => { c.style.transition = dur && !rm ? `transform ${dur}s cubic-bezier(.215,.61,.355,1)` : 'none'; c.style.transform = `translateY(${-p * 1.05}em)`; c._p = p; };
    cols.forEach((c, k) => {
      c.parentNode.style.opacity = cols.length - k <= String(n).length ? 1 : 0;
      let a = c._p; if (a >= 10) { at(c, a - 10, 0); a -= 10; }
      const d = +str[k], dur = 0.55 + (cols.length - 1 - k) * 0.15; if (d === a) return;
      if (!up && d > a) { at(c, a + 10, 0); void c.offsetWidth; }
      else void c.offsetWidth;
      at(c, up ? (d > a ? d : d + 10) : d, dur);
    });
    return moved;
  }

  function render() {
    const s = hist.present;
    let w = 0, v = 0; const inBag = [];
    level.items.forEach(([iw, iv], i) => { if (s.picked[i]) { w += iw; v += iv; inBag.push(i); } });
    const wf = Math.min(1, w / level.cap), vf = Math.min(1, v / level.target);
    const lift = solvedFired ? (rm ? -24 : -(G.by + 40)) : wf * 8 - vf * 18; // the balloon rises with value, sinks with weight, flies off on a win
    const tp = trayPos(), bp = bagPos(inBag, lift);
    els.forEach(({ e, g }, i) => {
      const p = s.picked[i] ? bp[i] : tp[i], r = rad[i];
      e.style.transform = `translate(${p.x - r}px,${p.y - r}px) scale(${p.s})`;
      e.style.zIndex = s.picked[i] ? 3 : 2;
      e.style.setProperty('--hit', -Math.min(6, Math.max(0, (44 / p.s - 2 * r) / 2)) + 'px');
      const t = tp[i]; g.style.transform = `translate(${t.x - r}px,${t.y - r}px) scale(${t.s})`;
      g.style.display = s.picked[i] ? '' : 'none';
    });
    bag.style.transform = `translateY(${lift}px)`;
    water.style.transform = `translateY(${(1 - wf) * (G.gb - G.limY + 6)}px)`;
    bfill.style.transform = `translateY(${(1 - vf) * 76}px)`;
    fill.style.transform = `translateY(${(1 - vf) * G.bh}px)`;
    dlt = odoSet(nW, w) + odoSet(nV, v);
    ctx.hud({ moves: s.moves, best, tries: hist.tries, maxTries: logic.maxTries(), canUndo: hist.past.length > 0 });
    return v;
  }

  function rings() { // calm win: rings spread from the balloon and tier-colored sparks rise with it
    if (rm) return;
    const { cx, cy } = G, burst = (c, a, o) => c.animate(a, { ...o, easing: 'cubic-bezier(.215,.61,.355,1)', fill: 'both' }).onfinish = () => c.remove();
    const mkc = (r, attrs) => { const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', cx); c.setAttribute('cy', cy); c.setAttribute('r', r); for (const k in attrs) c.setAttribute(k, attrs[k]); c.style.transformOrigin = `${cx}px ${cy}px`; svg.append(c); return c; };
    [0, 200, 400, 600].forEach((d, k) => burst(mkc(G.bw * 0.35, { fill: 'none', stroke: k % 2 ? '#7B8CDE' : '#2EC4B6', 'stroke-width': 1.5, style: 'vector-effect:non-scaling-stroke' }), [{ transform: 'scale(.5)', opacity: 0 }, { opacity: .7, offset: .2 }, { transform: 'scale(2.8)', opacity: 0 }], { duration: 1500, delay: d }));
    for (let k = 0; k < 14; k++) { // sparks rise and fall away from the balloon
      const a = (k / 14) * Math.PI * 2, dx = Math.cos(a) * (70 + (k % 3) * 30), dy = Math.sin(a) * 60 - 50 - (k % 4) * 14;
      burst(mkc(2 + (k % 3), { fill: COL[1 + (k % 3)] }), [{ transform: 'none', opacity: 0 }, { opacity: 1, offset: .15 }, { transform: `translate(${dx}px,${dy}px)`, opacity: 0 }], { duration: 1100 + (k % 4) * 150, delay: 120 + k * 35 });
    }
  }
  function onClick(ev) {
    const el = ev.target.closest && ev.target.closest('.k-item');
    if (!el || solvedFired || dead) return;
    unlock();
    const i = +el.dataset.i, next = play(hist, logic, { i });
    if (next === hist) {
      sfx.no();
      el.classList.remove('k-shake'); void el.offsetWidth; el.classList.add('k-shake');
      root.classList.add('k-flash');
      later(() => { el.classList.remove('k-shake'); root.classList.remove('k-flash'); }, 420);
      return;
    }
    hist = next;
    const done = logic.isSolved(hist.present);
    if (done) { solvedFired = true; root.classList.add('k-won'); rings(); }
    const v = render();
    ctx.sound.move(v);
    (hist.present.picked[i] ? sfx.add : sfx.out)();
    sfx.ticks(dlt);
    if (done) {
      later(() => { ctx.sound.win(); sfx.win(); }, 250);
      later(() => ctx.solved({ score: logic.score(hist.present) }), 700);
    }
  }
  root.addEventListener('click', onClick);

  let ro = null;
  const relayout = () => { build(); render(); };
  build(); render();
  later(() => root.classList.add('k-ready'), 60);
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => { if (root.clientWidth && Math.abs(root.clientWidth - G.W) > 1) relayout(); });
    ro.observe(root);
  }

  return {
    undo() { if (solvedFired) return; hist = undo(hist, logic.maxTries()); render(); },
    reset() { if (solvedFired) return; hist = reset(hist, logic.maxTries()); render(); },
    destroy() {
      dead = true;
      root.removeEventListener('click', onClick);
      if (ro) ro.disconnect();
      timers.forEach(clearTimeout); if (ac) { try { ac.close(); } catch (_) {} ac = null; }
      root.innerHTML = ''; root.classList.remove('g-knapsack', 'k-move', 'k-ready', 'k-won', 'k-flash');
    },
  };
}
