// Tutorial engine (specs/005-puzzle-tutorials.md): coach card, spotlight ring, hand, step runner, seen flags.
// Imports run no DOM code. Step files are plain data (product/ui/tutorials/<id>.js).

const KEY = 'puzzle-app-tutorial-v1';
let mem = {};
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || mem; } catch { return mem; } };
export const isSeen = (id) => !!load()[id];
export const markSeen = (id) => { mem = { ...load(), [id]: true }; try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch { /* private window */ } };

// Used when a game has no own file. Targets are the shell controls, so it works for every game.
export const defaultSteps = [
  { ch: 'Goal', title: 'Welcome', body: 'Play a short practice level. Tap Next.', target: ({ root }) => root, lesson: true },
  { ch: 'Move', title: 'Make a move', body: 'Touch the puzzle and make one move.', target: ({ root }) => root, done: (S) => S.moves > 0 },
  { ch: 'Undo', title: 'Take it back', body: 'Tap undo to take back the move.', target: ({ gv }) => gv.querySelector('[data-a=undo]'), begin: (S) => ({ u: S.undos, r: S.resets }), done: (S, s0) => S.undos > s0.u || S.resets > s0.r },
  { ch: 'Solve', title: 'Solve it', body: 'Finish the practice level.', target: ({ root }) => root, done: (S) => S.solved },
];

const HAND = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M12 4a2.2 2.2 0 0 1 4.4 0v10l1.6-.5a2 2 0 0 1 2.5 1.2l.4 1 1.3-.4a2 2 0 0 1 2.4 1.5l.6 3.7c.5 3.2-1.3 6.5-4.4 7.7l-2.2.8a8 8 0 0 1-7-.7l-4.6-3a2 2 0 0 1-.3-3.1 2 2 0 0 1 2.6-.2l1.7 1.2V4z" fill="#fff" stroke="#222" stroke-width="1.6" stroke-linejoin="round"/></svg>';

const STAR = (on) => `<svg viewBox="0 0 24 24" fill="${on ? '#F5B82E' : 'none'}" stroke="${on ? '#B8851B' : 'currentColor'}" stroke-width="1.6" stroke-linejoin="round" style="opacity:${on ? 1 : 0.4}"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"/></svg>`;

export const css = `
.tut-spot { position: fixed; z-index: 31; pointer-events: none; border-radius: 14px; box-shadow: 0 0 0 9999px rgba(8,8,18,.5); border: 3px solid var(--tc); transition: left .25s ease, top .25s ease, width .25s ease, height .25s ease, opacity .2s ease; animation: tutPulse 1.4s ease-in-out infinite; }
.tut-spot[hidden], .tut-hand[hidden] { display: none; }
.tut-hand { position: fixed; z-index: 32; pointer-events: none; width: 44px; height: 44px; margin: -6px 0 0 -14px; filter: drop-shadow(0 2px 3px rgba(0,0,0,.4)); animation: tutTap 1.3s ease-in-out infinite; }
.tut-hand.slide { animation: tutSlide 1.8s ease-in-out infinite; }
.tut-hand svg { width: 100%; height: 100%; }
.tut-coach { position: fixed; z-index: 33; left: 10px; right: 10px; max-width: 460px; margin: 0 auto; padding: 12px 14px 10px; border-radius: 18px; background: var(--tb); color: var(--ti); border: 1.5px solid var(--tc); box-shadow: 0 8px 28px rgba(0,0,0,.35); font-family: var(--font-ui, system-ui); animation: tutIn .3s ease both; }
.tut-coach.at-top { top: max(10px, env(safe-area-inset-top, 0px)); }
.tut-coach.at-bot { bottom: max(10px, env(safe-area-inset-bottom, 0px)); }
.tut-ch { font-family: var(--font-mono, monospace); font-size: .72rem; letter-spacing: .08em; text-transform: uppercase; opacity: .75; display: flex; justify-content: space-between; align-items: center; }
.tut-seg { display: flex; gap: 4px; margin: 6px 0 8px; }
.tut-seg i { flex: 1; height: 5px; border-radius: 3px; background: var(--ti); opacity: .2; }
.tut-seg i.on { background: var(--tc); opacity: 1; }
.tut-t { font-size: 1.1rem; font-weight: 800; margin: 0 0 2px; }
.tut-b { font-size: .98rem; margin: 0 0 8px; line-height: 1.3; }
.tut-row { display: flex; gap: 10px; justify-content: flex-end; align-items: center; }
.tut-btn { min-height: 44px; min-width: 44px; padding: 0 16px; border-radius: 22px; border: 1.5px solid var(--tc); background: transparent; color: var(--ti); font: inherit; font-weight: 700; cursor: pointer; touch-action: manipulation; }
.tut-btn.go { background: var(--tc); color: var(--tg); }
.tut-btn.x { border-color: transparent; opacity: .7; }
.tut-stars { display: flex; justify-content: center; gap: 8px; margin: 6px 0; }
.tut-stars svg { width: 40px; height: 40px; }
.tut-coach[data-class=space] { --tb:#FFF8EC; --ti:#4A2C2A; --tc:#FF8A3D; --tg:#fff; border: 3px solid #4A2C2A; border-radius: 24px; box-shadow: 0 5px 0 #4A2C2A; }
.tut-coach[data-class=space] .tut-t { font-weight: 900; }
.tut-coach[data-class=quantity] { --tb:#FFFFFF; --ti:#1B2A3A; --tc:#2E7DD7; --tg:#fff; border-width: 1px; border-radius: 10px; box-shadow: 0 2px 10px rgba(27,42,58,.18); }
.tut-coach[data-class=quantity] .tut-t { font-weight: 500; }
.tut-coach[data-class=direction] { --tb:#3A3C74; --ti:#F4F1FF; --tc:#FFB86B; --tg:#2B2D5B; box-shadow: 0 0 26px rgba(255,184,107,.35), 0 8px 28px rgba(0,0,0,.4); border-radius: 22px; }
.tut-coach[data-class=sequence] { --tb:#0B3C5D; --ti:#EAF6FF; --tc:#EAF6FF; --tg:#0B3C5D; border: 1.5px dashed #EAF6FF; border-radius: 6px; }
.tut-coach[data-class=sequence] .tut-t { font-family: var(--font-mono, monospace); font-weight: 500; }
.tut-spot[data-class=space] { --tc:#FF8A3D; border-width: 4px; border-radius: 20px; }
.tut-spot[data-class=quantity] { --tc:#2E7DD7; border-width: 2px; border-radius: 8px; }
.tut-spot[data-class=direction] { --tc:#FFB86B; box-shadow: 0 0 0 9999px rgba(20,20,50,.5), 0 0 22px 4px rgba(255,184,107,.7); }
.tut-spot[data-class=sequence] { --tc:#EAF6FF; border-style: dashed; border-radius: 4px; }
@keyframes tutPulse { 50% { transform: scale(1.03); } }
@keyframes tutTap { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(6px,8px) scale(.9); } }
@keyframes tutSlide { 0% { transform: translate(calc(var(--dx) * -.5), calc(var(--dy) * -.5)); } 80%,100% { transform: translate(calc(var(--dx) * .5), calc(var(--dy) * .5)); } }
@keyframes tutIn { from { opacity: 0; transform: translateY(10px); } }
@media (prefers-reduced-motion: reduce) { .tut-spot, .tut-hand, .tut-hand.slide, .tut-coach { animation: none; transition: none; } }
`;

// gv: the game screen element. cls: the game class. steps: array of step data.
// onClose(why): 'done' | 'left'. Returns { feed(hud), solved(result), destroy() }.
export function createTutorial({ gv, cls, steps, getRoot, onClose }) {
  const S = { moves: 0, best: null, canUndo: false, tries: 0, maxTries: undefined, undos: 0, resets: 0, solved: false, score: null, stars: 0, root: null, gv };
  const doc = gv.ownerDocument;
  const mk = (tag, c, parent) => { const e = doc.createElement(tag); if (c) e.className = c; parent.append(e); return e; };
  const spot = mk('div', 'tut-spot', gv); spot.dataset.class = cls; spot.hidden = true;
  const hand = mk('div', 'tut-hand', gv); hand.innerHTML = HAND; hand.hidden = true;
  const coach = mk('div', 'tut-coach at-bot', gv); coach.dataset.class = cls; coach.setAttribute('role', 'dialog'); coach.setAttribute('aria-live', 'polite');
  let i = -1, snap, step, target = null, advancing = 0, dead = false, raf = 0, finished = false, confirming = false;

  const onClick = (e) => {
    const a = e.target.closest?.('[data-a]')?.dataset.a;
    if (a === 'undo') S.undos++;
    if (a === 'reset') S.resets++;
  };
  gv.addEventListener('click', onClick, true);

  const segs = () => `<div class="tut-seg">${steps.map((_, k) => `<i class="${k <= i ? 'on' : ''}"></i>`).join('')}</div>`;
  const render = () => {
    if (confirming) {
      coach.innerHTML = `<p class="tut-t">Leave the tutorial?</p><div class="tut-row"><button class="tut-btn" data-t="stay">Stay</button><button class="tut-btn go" data-t="leave">Leave</button></div>`;
      return;
    }
    if (finished) {
      coach.innerHTML = `<div class="tut-ch"><span>Done</span></div><p class="tut-t" style="text-align:center">Tutorial complete</p><div class="tut-stars">${[1, 2, 3].map((k) => STAR(k <= S.stars)).join('')}</div><div class="tut-row"><button class="tut-btn go" data-t="close">Play</button></div>`;
      return;
    }
    const last = i === steps.length - 1;
    coach.innerHTML = `<div class="tut-ch"><span>${step.ch || ''}</span><button class="tut-btn x" data-t="exit" aria-label="Exit tutorial">Exit</button></div>${segs()}<p class="tut-t">${step.title}</p><p class="tut-b">${step.body}</p><div class="tut-row">${step.lesson ? '<button class="tut-btn go" data-t="next">Next</button>' : last ? '' : '<button class="tut-btn x" data-t="next">Skip</button>'}</div>`;
  };
  coach.addEventListener('click', (e) => {
    const t = e.target.closest('[data-t]')?.dataset.t;
    if (t === 'next') go(i + 1);
    else if (t === 'exit') { confirming = true; render(); }
    else if (t === 'stay') { confirming = false; render(); }
    else if (t === 'leave') close('left');
    else if (t === 'close') close('done');
  });

  function go(n) {
    advancing = 0;
    if (n >= steps.length) { finish(); return; }
    i = n; step = steps[n]; S.root = getRoot();
    snap = step.begin ? step.begin(S) : undefined;
    hand.classList.remove('slide');
    if (step.hand) { hand.classList.add('slide'); hand.style.setProperty('--dx', step.hand[0] + 'px'); hand.style.setProperty('--dy', step.hand[1] + 'px'); }
    confirming = false; render();
  }
  function finish() { finished = true; spot.hidden = true; hand.hidden = true; coach.classList.add('at-bot'); coach.classList.remove('at-top'); render(); }
  function close(why) { if (dead) return; dead = true; cancelAnimationFrame(raf); gv.removeEventListener('click', onClick, true); spot.remove(); hand.remove(); coach.remove(); onClose?.(why); }

  function tick() {
    if (dead) return;
    raf = requestAnimationFrame(tick);
    if (finished || !step) return;
    S.root = getRoot();
    try { target = step.target ? step.target({ root: S.root, gv }) : null; } catch { target = null; }
    const r = target?.getBoundingClientRect?.();
    if (r && r.width > 0) {
      const p = 6;
      Object.assign(spot.style, { left: r.left - p + 'px', top: r.top - p + 'px', width: r.width + 2 * p + 'px', height: r.height + 2 * p + 'px' });
      Object.assign(hand.style, { left: r.left + r.width / 2 + 'px', top: r.top + r.height / 2 + 'px' });
      spot.hidden = hand.hidden = false;
      const low = r.top + r.height / 2 > innerHeight * 0.5;
      coach.classList.toggle('at-top', low); coach.classList.toggle('at-bot', !low);
    } else spot.hidden = hand.hidden = true;
    if (!advancing && !step.lesson && step.done?.(S, snap)) advancing = setTimeout(() => go(i + 1), 450);
  }

  go(0);
  raf = requestAnimationFrame(tick);
  return {
    feed(h) { Object.assign(S, { moves: h.moves ?? 0, best: h.best ?? null, canUndo: !!h.canUndo, tries: h.tries ?? 0, maxTries: h.maxTries }); },
    solved(r) { S.solved = true; S.score = r.score; S.stars = r.stars || 0; },
    destroy() { if (!dead) { dead = true; cancelAnimationFrame(raf); clearTimeout(advancing); gv.removeEventListener('click', onClick, true); spot.remove(); hand.remove(); coach.remove(); } },
  };
}
