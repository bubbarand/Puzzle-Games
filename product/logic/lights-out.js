// RULE CHOICE: 5x5 always; level n is made by seeded random presses from solved, and is kept only when its best solution needs MIN_PRESSES[n] or one more presses (8-9 at level 1, 14 or more from level 5); it is never already solved.
import { clone, rng } from './solve.js';

export const meta = { id: 'lights-out', title: 'Lights Out', cls: 'sequence' };

const N = 5;
const press = (g, i) => {
  const r = Math.floor(i / N), c = i % N;
  for (const [a, b] of [[r, c], [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]])
    if (a >= 0 && b >= 0 && a < N && b < N) g[a * N + b] ^= 1;
};

const MIN_PRESSES = [8, 10, 11, 13, 14];

// Levels 1-4 keep their best score within need..need+1 so the curve rises; level 5 and up only need the minimum.
const inBand = (best, n, need) => best >= need && (n >= MIN_PRESSES.length || best <= need + 1);

export function makeLevel(n) {
  const need = MIN_PRESSES[Math.min(n, MIN_PRESSES.length) - 1];
  for (let attempt = 0; ; attempt++) {
    const r = rng(n * 7919 + attempt * 104729);
    const grid = Array(N * N).fill(0);
    for (let i = 0; i < N * N; i++) if (r() < 0.5) press(grid, i);
    if (grid.includes(1) && inBand(bestScore({ grid }), n, need)) return { grid };
  }
}

export const initialState = (level) => ({ grid: clone(level.grid), moves: 0 });
export const legalMoves = () => Array.from({ length: N * N }, (_, cell) => ({ cell }));

export function applyMove(s, m) {
  if (!m || !Number.isInteger(m.cell) || m.cell < 0 || m.cell >= N * N) return null;
  const t = clone(s);
  press(t.grid, m.cell);
  t.moves++;
  return t;
}

export const isSolved = (s) => !s.grid.includes(1);

// Chase the lights: the first row decides every other row, so try all 32 first rows.
// Returns every set of cells to press (4 for 5x5, or none).
export function solutions(grid) {
  const out = [];
  for (let top = 0; top < 1 << N; top++) {
    const g = [...grid], p = [];
    for (let c = 0; c < N; c++) if (top >> c & 1) { press(g, c); p.push(c); }
    for (let r = 1; r < N; r++)
      for (let c = 0; c < N; c++) if (g[(r - 1) * N + c]) { press(g, r * N + c); p.push(r * N + c); }
    if (!g.includes(1)) out.push(p);
  }
  return out;
}

export const bestScore = (level) => Math.min(...solutions(level.grid).map((p) => p.length));
export const score = (s) => s.moves;
export const maxTries = () => Infinity;
