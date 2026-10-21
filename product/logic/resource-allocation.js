// RULE CHOICE: one move sets how many coins sit on one option (0 to 10); solved needs all 10 coins placed, total return >= target and worst-year total >= floor. The risk number is display only (largest one-year loss per coin).
import { clone, bfs } from './solve.js';

export const meta = { id: 'resource-allocation', title: 'Resource Allocation', cls: 'quantity' };

// ret[i] = return per coin in each of 5 years. 4 to 6 options; each level has exactly one winning split
// (coins per option: [7,0,2,1], [1,3,3,3], [1,2,4,3,0], [1,1,1,2,5], [2,1,1,3,2,1]), so min moves are 3, 4, 4, 5, 6.
const LEVELS = [
  { ret: [[7, 0, 6, 9, 8], [-1, -3, 9, 5, -3], [-4, 7, 6, 0, -4], [2, 2, -1, 7, -2]], target: 228, floor: 16 },
  { ret: [[-1, 2, 4, 8, -2], [9, -1, 6, 2, 0], [8, -2, -2, 9, 7], [0, 4, -2, 1, 9]], target: 155, floor: 5 },
  { ret: [[-3, 4, 4, 1, 2], [4, 5, -3, -3, 4], [4, 1, 1, 2, 8], [8, 1, 7, 6, -4], [3, 0, -1, 5, -3]], target: 140, floor: 21 },
  { ret: [[2, 3, 6, 7, 0], [8, -2, -2, -2, 1], [4, -4, 6, 5, 5], [2, 6, -4, 8, 6], [1, 3, 4, 6, 9]], target: 188, floor: 22 },
  { ret: [[1, 1, 5, 4, 7], [8, -1, -3, 2, 9], [3, 5, 1, 2, -1], [4, 1, 4, 0, 6], [-2, 7, 1, 8, 9], [4, 2, 3, -1, 0]], target: 160, floor: 25 },
];

export function makeLevel(n) {
  const l = clone(LEVELS[Math.min(n, LEVELS.length) - 1]);
  return { coins: 10, ...l, risk: l.ret.map((r) => Math.max(0, -Math.min(...r))) };
}

export const initialState = (level) => ({ ...clone(level), alloc: level.ret.map(() => 0), moves: 0 });

const used = (s) => s.alloc.reduce((a, b) => a + b, 0);
export const years = (s) => [0, 1, 2, 3, 4].map((y) => s.alloc.reduce((a, n, i) => a + n * s.ret[i][y], 0));

export function legalMoves(s) {
  const out = [];
  s.alloc.forEach((cur, opt) => {
    for (let n = 0; n <= s.coins; n++) if (n !== cur && used(s) - cur + n <= s.coins) out.push({ opt, n });
  });
  return out;
}

export function applyMove(s, m) {
  if (!m || !legalMoves(s).some((x) => x.opt === m.opt && x.n === m.n)) return null;
  const t = clone(s);
  t.alloc[m.opt] = m.n;
  t.moves++;
  return t;
}

export function isSolved(s) {
  const y = years(s);
  return used(s) === s.coins && y.reduce((a, b) => a + b, 0) >= s.target && Math.min(...y) >= s.floor;
}

export const bestScore = (level) => bfs({ initialState, legalMoves, applyMove, isSolved }, level)?.depth ?? null;
export const score = (s) => s.moves;
export const maxTries = () => Infinity;
