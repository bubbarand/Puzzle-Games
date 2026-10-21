// Shared undo/reset/try counting. Pure: every function returns a new history.
// Finite-maxTries games (laser, bag-draw) keep their tries inside the game state,
// so undo and reset are disabled for them (pass the game's maxTries value).
export const newHistory = (state) => ({ initial: state, present: state, past: [], tries: 1 });

export function play(h, game, move) {
  const s = game.applyMove(h.present, move);
  return s ? { ...h, present: s, past: [...h.past, h.present] } : h;
}

export function undo(h, max = Infinity) {
  if (max !== Infinity || !h.past.length) return h;
  return { ...h, present: h.past[h.past.length - 1], past: h.past.slice(0, -1) };
}

// Reset goes back to the start and counts one more try.
export function reset(h, max = Infinity) {
  return max !== Infinity ? h : { ...h, present: h.initial, past: [], tries: h.tries + 1 };
}
