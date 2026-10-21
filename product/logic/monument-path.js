// RULE CHOICE: blocks are [x, y, z] cells (y is height). The view turns in 4 steps; in view v the screen position is u (x, z, -x, -z) and height y. You may walk between two blocks that look adjacent on screen: u differs by 1 and height differs by at most 1. Blocks that are stacked behind each other (same u) are not connected. A turn and a walk each count as one move.
import { clone, bfs } from './solve.js';

export const meta = { id: 'monument-path', title: 'Monument Path', cls: 'direction' };

const LEVELS = [
  { blocks: [[3, 0, 2], [4, 2, 1], [3, 2, 2], [0, 1, 1], [0, 0, 0], [2, 2, 4], [1, 2, 2], [0, 2, 0]], start: 0, goal: 5 },
  { blocks: [[2, 2, 1], [2, 2, 3], [4, 0, 4], [3, 2, 1], [3, 0, 4], [3, 0, 1], [1, 0, 0], [2, 2, 4], [0, 1, 1], [1, 2, 1]], start: 0, goal: 4 },
  { blocks: [[0, 0, 0], [2, 0, 4], [0, 1, 0], [0, 1, 3], [0, 1, 4], [3, 2, 0], [4, 2, 1], [4, 0, 1], [4, 0, 0], [2, 2, 4], [4, 2, 4], [4, 0, 3], [0, 2, 1]], start: 0, goal: 11 },
  { blocks: [[1, 2, 2], [4, 2, 4], [1, 0, 4], [0, 0, 4], [4, 2, 0], [1, 2, 0], [0, 2, 3], [0, 0, 0], [4, 0, 1], [4, 0, 4], [0, 2, 4], [3, 2, 0], [1, 2, 3], [4, 1, 0], [4, 0, 3], [2, 0, 0]], start: 0, goal: 9 },
  { blocks: [[4, 0, 3], [0, 0, 1], [0, 2, 3], [0, 2, 0], [1, 0, 0], [0, 2, 2], [1, 2, 2], [2, 0, 3], [2, 0, 1], [4, 0, 4], [0, 0, 0], [4, 1, 0], [3, 2, 0], [4, 2, 0], [0, 0, 3], [4, 0, 1], [0, 2, 4], [4, 2, 4], [1, 2, 0]], start: 0, goal: 3 },
];

export const makeLevel = (n) => clone(LEVELS[Math.min(n, LEVELS.length) - 1]);
export const initialState = (level) => ({ ...clone(level), view: 0, at: level.start, moves: 0 });

const u = (b, view) => [b[0], b[2], -b[0], -b[2]][view];
const linked = (s, i, j) => {
  const a = s.blocks[i], b = s.blocks[j];
  return Math.abs(u(a, s.view) - u(b, s.view)) === 1 && Math.abs(a[1] - b[1]) <= 1;
};

export function legalMoves(s) {
  const out = [{ t: 'rot', d: 1 }, { t: 'rot', d: -1 }];
  s.blocks.forEach((_, to) => { if (to !== s.at && linked(s, s.at, to)) out.push({ t: 'walk', to }); });
  return out;
}

export function applyMove(s, m) {
  if (!m || !legalMoves(s).some((x) => JSON.stringify(x) === JSON.stringify(m))) return null;
  const t = clone(s);
  if (m.t === 'rot') t.view = (t.view + m.d + 4) % 4;
  else t.at = m.to;
  t.moves++;
  return t;
}

export const isSolved = (s) => s.at === s.goal;
export const bestScore = (level) => bfs({ initialState, legalMoves, applyMove, isSolved }, level)?.depth ?? null;
export const score = (s) => s.moves;
export const maxTries = () => Infinity;
