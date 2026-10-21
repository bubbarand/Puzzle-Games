// RULE CHOICE: a mirror may not sit on the laser, a wall, the target or a checkpoint; place, remove and submit each count as one move; "solved" needs the beam to touch the target and every checkpoint.
import { clone } from './solve.js';

export const meta = { id: 'mirror-laser', title: 'Mirror Laser', cls: 'direction' };

// laser = [row, col, dir] with dir 0 north, 1 east, 2 south, 3 west. mirror m: 0 is '/', 1 is '\'.
// solution = stored list of moves, checked by the tests (found by exhaustive search; a test also proves no layout with fewer mirrors works).
// Levels grow from 6x6 with 2 mirrors and 1 checkpoint to 9x9 with 6 mirrors and 5 checkpoints; count is the fewest mirrors that can win.
const LEVELS = [
  { size: 6, laser: [4, 0, 1], target: [1, 3], checks: [[4, 2]], walls: [[4, 5], [5, 2], [0, 2], [2, 3]], count: 2, maxTries: 5, solution: [{ t: 'p', cell: [4, 4], m: 0 }, { t: 'p', cell: [1, 4], m: 1 }, { t: 's' }] },
  { size: 7, laser: [1, 0, 1], target: [4, 3], checks: [[0, 2], [1, 4]], walls: [[3, 6], [6, 3], [0, 1], [3, 0], [5, 4], [5, 5]], count: 3, maxTries: 5, solution: [{ t: 'p', cell: [1, 5], m: 1 }, { t: 'p', cell: [4, 5], m: 0 }, { t: 'p', cell: [4, 2], m: 1 }, { t: 's' }] },
  { size: 8, laser: [3, 0, 1], target: [2, 1], checks: [[5, 2], [4, 6], [3, 6]], walls: [[3, 4], [1, 1], [0, 3], [3, 5], [5, 4], [3, 3], [4, 5], [0, 7]], count: 4, maxTries: 5, solution: [{ t: 'p', cell: [3, 2], m: 1 }, { t: 'p', cell: [6, 2], m: 1 }, { t: 'p', cell: [6, 6], m: 0 }, { t: 'p', cell: [2, 6], m: 1 }, { t: 's' }] },
  { size: 9, laser: [5, 0, 1], target: [7, 7], checks: [[5, 2], [3, 3], [4, 2], [5, 7]], walls: [[1, 8], [4, 8], [6, 6], [2, 7], [7, 4], [0, 6], [0, 1], [1, 7], [5, 6], [3, 0]], count: 5, maxTries: 5, solution: [{ t: 'p', cell: [5, 1], m: 0 }, { t: 'p', cell: [3, 1], m: 0 }, { t: 'p', cell: [3, 7], m: 1 }, { t: 'p', cell: [8, 7], m: 0 }, { t: 'p', cell: [8, 2], m: 1 }, { t: 's' }] },
  { size: 9, laser: [2, 0, 1], target: [6, 1], checks: [[5, 2], [6, 4], [3, 5], [3, 2], [7, 3]], walls: [[8, 8], [8, 4], [6, 6], [3, 8], [0, 4], [2, 6], [2, 3], [1, 7], [5, 6], [3, 3]], count: 6, maxTries: 5, solution: [{ t: 'p', cell: [2, 1], m: 1 }, { t: 'p', cell: [7, 1], m: 1 }, { t: 'p', cell: [7, 5], m: 0 }, { t: 'p', cell: [1, 5], m: 1 }, { t: 'p', cell: [1, 2], m: 0 }, { t: 'p', cell: [6, 2], m: 1 }, { t: 's' }] },
];

export const makeLevel = (n) => clone(LEVELS[Math.min(n, LEVELS.length) - 1]);

export const initialState = (level) => ({ ...clone(level), mirrors: [], submits: 0, solved: false, moves: 0 });

const DR = [-1, 0, 1, 0], DC = [0, 1, 0, -1];
const BOUNCE = [[1, 0, 3, 2], [3, 2, 1, 0]]; // [m][dir] -> new dir

const has = (list, r, c) => list.some((p) => p[0] === r && p[1] === c);

// Cells the beam visits after the laser cell, in order (a bounce cell appears when the beam enters it).
function walk(s) {
  let [r, c, d] = s.laser;
  const out = [];
  for (let i = 0; i < 100; i++) {
    r += DR[d]; c += DC[d];
    if (r < 0 || c < 0 || r >= s.size || c >= s.size || has(s.walls, r, c)) break;
    out.push([r, c]);
    const mi = s.mirrors.find((p) => p[0] === r && p[1] === c);
    if (mi) d = BOUNCE[mi[2]][d];
  }
  return out;
}

// Cells the beam visits (as "r,c" strings).
const trace = (s) => new Set(walk(s).map(([r, c]) => r + ',' + c));

// Beam path as [row, col] cell centers: the laser cell first, then every cell visited, until a wall or the edge.
export const beam = (s) => [[s.laser[0], s.laser[1]], ...walk(s)];

export function legalMoves(s) {
  if (s.solved || s.submits >= s.maxTries) return [];
  const out = [{ t: 's' }];
  s.mirrors.forEach(([r, c]) => out.push({ t: 'r', cell: [r, c] }));
  if (s.mirrors.length < s.count)
    for (let r = 0; r < s.size; r++)
      for (let c = 0; c < s.size; c++) {
        if (has(s.mirrors, r, c) || has(s.walls, r, c) || has(s.checks, r, c) || has([s.laser, s.target], r, c)) continue;
        out.push({ t: 'p', cell: [r, c], m: 0 }, { t: 'p', cell: [r, c], m: 1 });
      }
  return out;
}

export function applyMove(s, m) {
  if (!m || !legalMoves(s).some((x) => JSON.stringify(x) === JSON.stringify(m))) return null;
  const t = clone(s);
  t.moves++;
  if (m.t === 'p') t.mirrors.push([...m.cell, m.m]);
  if (m.t === 'r') t.mirrors = t.mirrors.filter((p) => !(p[0] === m.cell[0] && p[1] === m.cell[1]));
  if (m.t === 's') {
    t.submits++;
    const seen = trace(t);
    t.solved = [t.target, ...t.checks].every(([r, c]) => seen.has(r + ',' + c));
  }
  return t;
}

export const isSolved = (s) => s.solved;
export const bestScore = (level) => level.solution.length;
export const score = (s) => s.moves;
export const maxTries = () => 5;
