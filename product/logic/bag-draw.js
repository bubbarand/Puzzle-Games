// RULE CHOICE: the bag holds at most cap tiles; a draw takes n tiles at random from it (seeded from the level and the draw number, so it repeats); solved when the drawn sum >= target; 3 draws in total.
import { clone, rng, bfs } from './solve.js';

export const meta = { id: 'bag-draw', title: 'Bag Draw', cls: 'quantity' };

// tiles = values you own (can be negative). seed makes the luck repeatable.
// Level k draws n = k+3 tiles (cap = n+2); the target equals the sum of the n best tiles, so min moves = n adds + 1 draw = 5 to 9.
const LEVELS = [
  { tiles: [9, 7, 6, 5, -3, 2, -2, 1], cap: 6, n: 4, target: 27, seed: 1 },
  { tiles: [9, 8, 7, 6, 5, -4, 3, -2, 2, 1], cap: 7, n: 5, target: 35, seed: 2 },
  { tiles: [10, 9, 8, 7, 6, 5, -5, 4, -3, 3, -1], cap: 8, n: 6, target: 45, seed: 3 },
  { tiles: [12, 10, 9, 8, 7, 6, 5, -6, 4, -4, 3, -2], cap: 9, n: 7, target: 57, seed: 4 },
  { tiles: [14, 12, 11, 10, 9, 8, 7, 6, -7, 5, -5, 4, -3], cap: 10, n: 8, target: 77, seed: 5 },
];

export const makeLevel = (n) => clone(LEVELS[Math.min(n, LEVELS.length) - 1]);

export const initialState = (level) => ({ ...clone(level), bag: [], draws: 0, drawn: [], solved: false, moves: 0 });

export function legalMoves(s) {
  if (s.solved || s.draws >= 3) return [];
  const out = [];
  s.tiles.forEach((_, i) => out.push(s.bag.includes(i) ? { t: 'rm', i } : s.bag.length < s.cap ? { t: 'add', i } : null));
  if (s.bag.length >= s.n) out.push({ t: 'draw' });
  return out.filter(Boolean);
}

export function applyMove(s, m) {
  if (!m || !legalMoves(s).some((x) => JSON.stringify(x) === JSON.stringify(m))) return null;
  const t = clone(s);
  t.moves++;
  if (m.t === 'add') t.bag.push(m.i);
  if (m.t === 'rm') t.bag = t.bag.filter((x) => x !== m.i);
  if (m.t === 'draw') {
    const r = rng(s.seed * 1000 + s.draws);
    const order = [...t.bag].sort((a, b) => a - b);
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    t.drawn = order.slice(0, s.n);
    t.draws++;
    t.solved = t.drawn.reduce((a, i) => a + s.tiles[i], 0) >= s.target;
  }
  return t;
}

export const isSolved = (s) => s.solved;
// Draws are seeded, so the search is exact. Key ignores the order tiles were added in.
const key = (s) => JSON.stringify([[...s.bag].sort(), s.draws, s.solved]);
export const bestScore = (level) => bfs({ initialState, legalMoves, applyMove, isSolved }, level, { key })?.depth ?? null;
export const score = (s) => s.moves;
export const maxTries = () => 3;
