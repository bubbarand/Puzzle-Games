// RULE CHOICE: shapes are the numbers 1 to size; a move fills one empty cell and is only legal if the shape is not already in that row or column; level 1 is 4x4, level 2 and up are 6x6; every level has exactly one solution.
import { clone, rng } from './solve.js';

export const meta = { id: 'shape-sudoku', title: 'Shape Sudoku', cls: 'quantity' };

const BLANKS = [9, 16, 19, 22, 24];

const shuffle = (a, r) => {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

// Counts solutions of a grid (stops at 2), by filling the empty cell with the fewest options first.
function countSolutions(g, size) {
  let best = null;
  for (let i = 0; i < size; i++) for (let j = 0; j < size; j++) {
    if (g[i][j]) continue;
    const opts = [];
    for (let v = 1; v <= size; v++) if (g[i].every((x) => x !== v) && g.every((row) => row[j] !== v)) opts.push(v);
    if (!best || opts.length < best.opts.length) best = { i, j, opts };
  }
  if (!best) return 1;
  let n = 0;
  for (const v of best.opts) {
    g[best.i][best.j] = v;
    n += countSolutions(g, size);
    g[best.i][best.j] = 0;
    if (n > 1) break;
  }
  return n;
}

// Random Latin square, then blank cells one by one while the solution stays unique (up to the level's target).
// solution = the fills, in order.
export function makeLevel(n) {
  const r = rng(n * 313);
  const size = n < 2 ? 4 : 6;
  const want = BLANKS[Math.min(n, BLANKS.length) - 1];
  const full = Array.from({ length: size }, () => Array(size).fill(0));
  const fill = (k) => {
    if (k === size * size) return true;
    const [i, j] = [Math.floor(k / size), k % size];
    for (const v of shuffle([...Array(size).keys()].map((x) => x + 1), r)) {
      if (full[i].includes(v) || full.some((row) => row[j] === v)) continue;
      full[i][j] = v;
      if (fill(k + 1)) return true;
      full[i][j] = 0;
    }
    return false;
  };
  fill(0);
  let grid, cells;
  for (let attempt = 0; attempt < 200; attempt++) {
    grid = clone(full);
    cells = [];
    for (const [i, j] of shuffle(full.flatMap((row, i) => row.map((_, j) => [i, j])), r)) {
      if (cells.length === want) break;
      grid[i][j] = 0;
      if (countSolutions(clone(grid), size) === 1) cells.push([i, j]);
      else grid[i][j] = full[i][j];
    }
    if (cells.length === want) break;
  }
  return { size, grid, solution: shuffle(cells, r).map(([i, j]) => ({ r: i, c: j, v: full[i][j] })) };
}

export const initialState = (level) => ({ size: level.size, grid: clone(level.grid), moves: 0 });

const ok = (s, r, c, v) =>
  v >= 1 && v <= s.size && s.grid[r]?.[c] === 0 && s.grid[r].every((x) => x !== v) && s.grid.every((row) => row[c] !== v);

export function legalMoves(s) {
  const out = [];
  s.grid.forEach((row, r) => row.forEach((_, c) => { for (let v = 1; v <= s.size; v++) if (ok(s, r, c, v)) out.push({ r, c, v }); }));
  return out;
}

export function applyMove(s, m) {
  if (!m || !ok(s, m.r, m.c, m.v)) return null;
  const t = clone(s);
  t.grid[m.r][m.c] = m.v;
  t.moves++;
  return t;
}

export const isSolved = (s) => s.grid.every((row) => row.every((v) => v > 0));
export const bestScore = (level) => level.solution.length;
export const score = (s) => s.moves;
export const maxTries = () => Infinity;
