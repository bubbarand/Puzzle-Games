// RULE CHOICE: the final left pan is fixed; you load shapes from a limited stock onto the right pan, one shape per move (add or take back), and solved = both pans equal weight with something on the right. Hidden weights w are in the data for the rules check only.
import { clone, bfs } from './solve.js';

export const meta = { id: 'balance-scale', title: 'Balance Scale', cls: 'quantity' };

// eqs: pairs [leftCounts, rightCounts] that balance. left = final left pan counts. stock = shapes you may use.
const LEVELS = [
  { w: [8, 9, 12], eqs: [[[0, 0, 2], [3, 0, 0]], [[0, 4, 0], [0, 0, 3]]], left: [3, 3, 1], stock: [4, 3, 4] },
  { w: [5, 2, 8, 13], eqs: [[[0, 0, 0, 2], [2, 0, 2, 0]], [[4, 3, 0, 0], [0, 0, 0, 2]], [[0, 0, 1, 0], [0, 4, 0, 0]], [[4, 2, 0, 0], [0, 0, 3, 0]]], left: [2, 3, 3, 1], stock: [2, 2, 3, 4] },
  { w: [8, 6, 2, 3], eqs: [[[0, 2, 0, 0], [0, 0, 0, 4]], [[1, 0, 0, 0], [0, 0, 4, 0]], [[3, 0, 0, 2], [0, 4, 3, 0]], [[0, 1, 0, 0], [0, 0, 0, 2]]], left: [3, 2, 1, 2], stock: [2, 3, 2, 4] },
  { w: [12, 5, 13, 7, 6], eqs: [[[0, 0, 3, 0, 0], [2, 3, 0, 0, 0]], [[1, 0, 0, 0, 0], [0, 0, 0, 0, 2]], [[0, 0, 1, 0, 0], [0, 0, 0, 1, 1]], [[1, 0, 0, 0, 0], [0, 1, 0, 1, 0]]], left: [3, 3, 3, 2, 1], stock: [2, 4, 4, 3, 3] },
  { w: [4, 9, 11, 3, 6, 5], eqs: [[[0, 1, 0, 0, 0, 0], [0, 0, 0, 3, 0, 0]], [[0, 0, 2, 0, 0, 1], [0, 3, 0, 0, 0, 0]], [[0, 0, 0, 3, 0, 0], [0, 1, 0, 0, 0, 0]], [[0, 0, 2, 4, 0, 0], [4, 2, 0, 0, 0, 0]], [[3, 0, 0, 0, 0, 0], [0, 0, 0, 4, 0, 0]], [[4, 0, 0, 0, 0, 0], [0, 0, 0, 0, 1, 2]]], left: [0, 3, 3, 1, 3, 2], stock: [2, 2, 2, 3, 4, 2] },
];

export const makeLevel = (n) => clone(LEVELS[Math.min(n, LEVELS.length) - 1]);
export const initialState = (level) => ({ ...clone(level), right: level.w.map(() => 0), moves: 0 });

const weight = (w, counts) => counts.reduce((a, n, i) => a + n * w[i], 0);

export function legalMoves(s) {
  const out = [];
  s.right.forEach((n, shape) => {
    if (n < s.stock[shape]) out.push({ shape, d: 1 });
    if (n > 0) out.push({ shape, d: -1 });
  });
  return out;
}

export function applyMove(s, m) {
  if (!m || !legalMoves(s).some((x) => x.shape === m.shape && x.d === m.d)) return null;
  const t = clone(s);
  t.right[m.shape] += m.d;
  t.moves++;
  return t;
}

export const isSolved = (s) => s.right.some((n) => n > 0) && weight(s.w, s.right) === weight(s.w, s.left);
export const bestScore = (level) => bfs({ initialState, legalMoves, applyMove, isSolved }, level)?.depth ?? null;
export const score = (s) => s.moves;
export const maxTries = () => Infinity;
export const equalitiesHold = (level) => level.eqs.every(([a, b]) => weight(level.w, a) === weight(level.w, b));
