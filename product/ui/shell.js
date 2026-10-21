// App shell: home list, game screen (top bar, hud, undo/reset), win screen, sound. See specs/003-game-ui-contract.md.
import { css as homeCss } from './home-css.js';
import { thumbs } from './thumbs.js';
import { games } from './games.js';
import { stars as rate } from '../logic/rating.js';

// Earned order. Built games (in games.js) are available; the rest are locked until built.
const ORDER = [
  ['traffic-jam', 'Traffic Jam', 'space'], ['knapsack', 'Knapsack', 'quantity'], ['mirror-laser', 'Mirror & Laser', 'direction'], ['lights-out', 'Lights Out', 'sequence'],
  ['golf-tee', 'Golf Tee', 'space'], ['build-square', 'Build the Square', 'space'], ['sokoban', 'Sokoban', 'space'], ['pentomino-5x5', 'Pentomino Square', 'space'],
  ['bag-draw', 'Bag Draw', 'quantity'], ['resource-allocation', 'Resource Split', 'quantity'], ['balance-scale', 'Balance Scale', 'quantity'], ['shape-sudoku', 'Shape Sudoku', 'quantity'],
  ['monument-path', 'Monument Path', 'direction'], ['network-flow', 'Network Flow', 'direction'], ['lemmings-tools', 'Tool Crew', 'direction'],
  ['breach-turns', 'Turn Tactics', 'sequence'], ['hanoi', 'Tower of Hanoi', 'sequence'], ['tower-fall', 'Tower Fall', 'sequence'], ['matrix-reasoning', 'Matrix Reasoning', 'sequence'], ['domino-logic', 'Domino Logic', 'sequence'],
];

const KEY = 'puzzle-app-v1';
let memory = {};
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return memory; } };
const save = (d) => { memory = d; try { localStorage.setItem(KEY, JSON.stringify(d)); } catch { /* private window */ } };
let data = load(); // { [id]: { level, done, stars } }

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- sound: one scale per class, starts after the first tap
const SCALES = {
  space: { wave: 'triangle', notes: [0, 2, 4, 7, 9], base: 392 },      // warm marimba pentatonic
  quantity: { wave: 'sine', notes: [0, 2, 4, 7, 9, 11], base: 523 },   // clean chimes
  direction: { wave: 'sine', notes: [0, 4, 7, 11, 14], base: 330 },    // vibraphone
  sequence: { wave: 'square', notes: [0, 3, 5, 7, 10], base: 247 },    // soft clicks
};
let ac = null;
const unlockAudio = () => { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { ac = null; } } if (ac && ac.state === 'suspended') ac.resume(); };
addEventListener('pointerdown', unlockAudio, { passive: true });
function tone(freq, when, dur, wave, gain) {
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = wave; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(gain, when + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  o.connect(g).connect(ac.destination); o.start(when); o.stop(when + dur + 0.05);
}
const makeSound = (cls) => {
  const sc = SCALES[cls];
  const f = (i) => sc.base * 2 ** ((sc.notes[((i % sc.notes.length) + sc.notes.length) % sc.notes.length] + 12 * Math.floor(i / sc.notes.length % 2)) / 12);
  return {
    move: (i = 0) => { if (ac) tone(f(i), ac.currentTime, 0.28, sc.wave, sc.wave === 'square' ? 0.03 : 0.08); },
    win: () => { if (ac) [0, 2, 4].forEach((k, j) => tone(f(k + 5), ac.currentTime + j * 0.09, 0.7, sc.wave === 'square' ? 'sine' : sc.wave, 0.07)); },
  };
};

// ---- styles
const shellCss = `
.gv { --gbg:#FFF3E0; --gink:#4A2C2A; --gchip:rgba(74,44,42,.12); min-height: 100vh; display: flex; flex-direction: column; background: var(--gbg); color: var(--gink); font-family: var(--font-ui); }
.gv[data-class="quantity"] { --gbg:#F2F6FA; --gink:#1B2A3A; --gchip:rgba(27,42,58,.10); }
.gv[data-class="direction"] { --gbg:#2B2D5B; --gink:#F4F1FF; --gchip:rgba(255,255,255,.16); }
.gv[data-class="sequence"] { --gbg:#0B3C5D; --gink:#EAF6FF; --gchip:rgba(234,246,255,.16); }
.gv header { display: flex; align-items: center; gap: 10px; padding: 10px 12px 4px; padding-top: max(10px, env(safe-area-inset-top, 0px)); }
.gv header h2 { margin: 0; font-size: 1.15rem; font-weight: 800; flex: 1; min-width: 0; }
.gv .lvl { font-family: var(--font-mono); font-size: .8rem; opacity: .8; }
.ibtn { width: 44px; height: 44px; border: 0; border-radius: 22px; background: var(--gchip); color: inherit; display: grid; place-items: center; cursor: pointer; touch-action: manipulation; }
.ibtn svg { width: 22px; height: 22px; fill: none; stroke: currentColor; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }
.ibtn[disabled] { opacity: .35; cursor: default; }
.hud { display: flex; gap: 16px; align-items: center; padding: 4px 16px 8px; font-family: var(--font-mono); font-size: .85rem; }
.hud b { font-weight: 500; font-size: 1.05rem; }
.hud .dots { display: flex; gap: 5px; margin-left: auto; }
.hud .dots i { width: 10px; height: 10px; border-radius: 50%; background: currentColor; transition: opacity .4s ease, transform .4s ease; }
.hud .dots i.off { opacity: .2; transform: scale(.6); }
.stage { flex: 1; position: relative; min-height: 420px; }
.gv footer { display: flex; justify-content: center; gap: 16px; padding: 8px 12px; padding-bottom: max(14px, env(safe-area-inset-bottom, 0px)); }
.win { position: fixed; inset: 0; z-index: 20; display: grid; place-items: center; background: rgba(10,10,20,.55); animation: fade .35s ease both; }
.win[hidden] { display: none; }
.win .card { background: #fff; color: #2A2623; border-radius: 28px; padding: 22px 26px; text-align: center; min-width: 260px; box-shadow: 0 10px 40px rgba(0,0,0,.35); animation: pop .5s cubic-bezier(.22,.8,.3,1) both; }
.win .stars { display: flex; justify-content: center; gap: 8px; margin: 6px 0 10px; }
.win .stars svg { width: 44px; height: 44px; }
.win .sc { font-family: var(--font-mono); font-size: .9rem; color: #6b645d; margin-bottom: 14px; }
.win .acts { display: flex; justify-content: center; gap: 14px; }
.win .ibtn { background: #EFEBE5; color: #2A2623; }
.win .ibtn.go { background: #2FA66A; color: #fff; }
@keyframes fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes pop { from { opacity: 0; transform: scale(.85) translateY(12px) } to { opacity: 1; transform: none } }
@media (prefers-reduced-motion: reduce) { .win, .win .card { animation: none } }
`;
const ICON = {
  back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  undo: '<svg viewBox="0 0 24 24"><path d="M9 7L4 12l5 5"/><path d="M4 12h10a6 6 0 0 1 0 12" transform="translate(0 -5)"/></svg>',
  reset: '<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.5-5.8"/><path d="M20 4v5h-5"/></svg>',
  next: '<svg viewBox="0 0 24 24"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>',
  home: '<svg viewBox="0 0 24 24"><path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/></svg>',
};
const STAR = (on) => `<svg viewBox="0 0 24 24" fill="${on ? '#F5B82E' : 'none'}" stroke="${on ? '#B8851B' : '#C9C3BB'}" stroke-width="1.6" stroke-linejoin="round"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"/></svg>`;
const LOCK = '<svg class="lock" viewBox="0 0 30 30"><rect x="6" y="14" width="18" height="13" rx="3.5"/><path d="M10 14v-4a5 5 0 0 1 10 0v4" fill="none" stroke-width="3"/></svg>';

const app = document.getElementById('app');
const styleEl = (id, text) => { let s = document.getElementById(id); if (!s) { s = document.createElement('style'); s.id = id; document.head.append(s); } s.textContent = text; };
styleEl('shell-css', homeCss + shellCss + 'body{margin:0}');
const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; };
let current = null; // { destroy }

// ---- home
function home() {
  current?.destroy(); current = null; scrollTo(0, 0);
  const state = (id) => (!games[id] ? 'locked' : data[id]?.done ? 'done' : 'available');
  const rank = { available: 0, done: 1, locked: 2 };
  const list = ORDER.map((g, i) => ({ g, i, st: state(g[0]) })).sort((a, b) => rank[a.st] - rank[b.st] || a.i - b.i);
  const main = h('<main><h1>Puzzles</h1></main>');
  for (const { g: [id, title, cls], st } of list) {
    const d = data[id] || {};
    const starsHtml = st === 'done' ? `<span class="stars">${[1, 2, 3].map((n) => STAR(n <= (d.stars || 0)).replace('<svg', '<svg')).join('')}<span>level ${d.level || 1}</span></span><span class="stamp"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5 10-11"/></svg>Solved</span>` : '';
    const row = h(`<div class="row" data-class="${cls}" data-state="${st}" ${st === 'locked' ? '' : 'tabindex="0" role="button"'}>${st === 'locked' ? '' : thumbs[id] || ''}<span class="title">${title}</span>${starsHtml}${st === 'locked' ? LOCK : ''}</div>`);
    if (st !== 'locked') { const go = () => openGame(id); row.addEventListener('click', go); row.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }); }
    main.append(row);
  }
  app.replaceChildren(main);
  shine(main);
}

// ---- shine: each available box shines every 20 s; hover/touch/focus holds the shine until you move away
function shine(main) {
  if (reduceMotion) return;
  let touchHeld = [];
  [...main.querySelectorAll('.row')].forEach((row, i) => {
    let timer = 0; const avail = row.dataset.state === 'available';
    const pulse = () => { if (row.classList.contains('hold')) return; row.classList.add('lit'); setTimeout(() => row.classList.remove('lit'), 1300); };
    const sched = (d) => { if (!avail) return; clearTimeout(timer); timer = setTimeout(() => { pulse(); sched(20000); }, d); };
    const hold = () => { row.classList.remove('lit'); row.classList.add('hold'); sched(20000); };
    const release = () => { row.classList.remove('hold'); sched(20000); };
    row.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && hold());
    row.addEventListener('pointerleave', (e) => e.pointerType === 'mouse' && release());
    row.addEventListener('touchstart', () => { touchHeld.forEach((r) => r.classList.remove('hold')); touchHeld = [row]; hold(); }, { passive: true });
    row.addEventListener('focus', hold); row.addEventListener('blur', release);
    sched(2000 + i * 6000);
  });
  let y = scrollY;
  addEventListener('scroll', () => { if (Math.abs(scrollY - y) < 30) return; y = scrollY; touchHeld.forEach((r) => r.classList.remove('hold')); touchHeld = []; }, { passive: true });
}

// ---- game screen
function openGame(id) {
  const meta = ORDER.find((g) => g[0] === id), [, title, cls] = meta;
  const { ui, logic } = games[id];
  scrollTo(0, 0);
  styleEl('game-css', ui.css);
  const gv = h(`<div class="gv" data-class="${cls}">
    <header><button class="ibtn" data-a="back" aria-label="Back">${ICON.back}</button><h2>${title}</h2><span class="lvl"></span></header>
    <div class="hud"><span>moves <b data-k="moves">0</b></span><span>best <b data-k="best">-</b></span><span class="dots"></span></div>
    <div class="stage"></div>
    <footer><button class="ibtn" data-a="undo" aria-label="Undo">${ICON.undo}</button><button class="ibtn" data-a="reset" aria-label="Reset">${ICON.reset}</button></footer>
    <div class="win" hidden><div class="card"><div class="stars"></div><div class="sc"></div><div class="acts"><button class="ibtn" data-a="home" aria-label="Home">${ICON.home}</button><button class="ibtn go" data-a="next" aria-label="Next level">${ICON.next}</button></div></div></div>
  </div>`);
  app.replaceChildren(gv);
  const $ = (s) => gv.querySelector(s);
  const sound = makeSound(cls);
  let inst = null, level = data[id]?.level || 1, lastHud = {};

  function start() {
    inst?.destroy(); $('.win').hidden = true;
    const stage = $('.stage'); stage.replaceChildren();
    $('.lvl').textContent = 'level ' + level;
    inst = ui.mount(stage, {
      level, reduceMotion, sound,
      hud: (x) => {
        lastHud = x;
        $('[data-k=moves]').textContent = x.moves; $('[data-k=best]').textContent = x.best ?? '-';
        const dots = $('.dots');
        if (Number.isFinite(x.maxTries)) { const left = x.maxTries - (x.tries ?? 0); dots.innerHTML = Array.from({ length: x.maxTries }, (_, k) => `<i class="${k < left ? '' : 'off'}"></i>`).join(''); }
        else dots.innerHTML = '';
        gv.querySelector('[data-a=undo]').disabled = Number.isFinite(x.maxTries) || !x.canUndo;
        gv.querySelector('[data-a=reset]').disabled = Number.isFinite(x.maxTries);
      },
      solved: ({ score }) => {
        const n = rate(score, lastHud.best ?? logic.bestScore(logic.makeLevel(level)), true);
        const prev = data[id] || {};
        data[id] = { level, done: true, stars: Math.max(prev.level === level ? prev.stars || 0 : 0, n) };
        save(data);
        $('.win .stars').innerHTML = [1, 2, 3].map((k) => STAR(k <= n)).join('');
        $('.win .sc').textContent = `${score} moves, best ${lastHud.best ?? '-'}`;
        $('.win').hidden = false; sound.win();
      },
    });
  }
  gv.addEventListener('click', (e) => {
    const a = e.target.closest('[data-a]')?.dataset.a; if (!a) return;
    if (a === 'back' || a === 'home') { inst?.destroy(); home(); }
    if (a === 'undo') inst.undo();
    if (a === 'reset') { $('.win').hidden = true; inst.reset(); }
    if (a === 'next') { level += 1; data[id] = { ...(data[id] || {}), level }; save(data); start(); }
  });
  current = { destroy: () => inst?.destroy() };
  start();
}

home();
