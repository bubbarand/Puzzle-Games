// RULE CHOICE: the target is the best value that fits the weight limit; each tap on an item (in or out) is one move; level n has 8, 9, 11, 12, 14 items (14 from level 5) whose values nearly tie.
import { clone, rng } from './solve.js';

export const meta = { id: 'knapsack', title: 'Knapsack', cls: 'quantity' };

// Brute force over subsets (at most 14 items). Returns [best value, fewest items reaching it].
const search = (items, cap, target) => {
  let best = 0, fewest = null;
  for (let m = 0; m < 1 << items.length; m++) {
    let w = 0, v = 0, k = 0;
    items.forEach(([iw, iv], i) => { if (m >> i & 1) { w += iw; v += iv; k++; } });
    if (w > cap) continue;
    best = Math.max(best, v);
    if (v >= target && (fewest === null || k < fewest)) fewest = k;
  }
  return [best, fewest];
};

const COUNTS = [8, 9, 11, 12, 14];

// Values track weights (value = 2 * weight + small noise), so many different bags have almost the same value.
// A seed is kept only when at least 3 other bags reach within 2 of the best value and, from level 2, the
// greedy "best value per weight" bag misses the target.
const build = (n, attempt) => {
  const r = rng(n * 101 + attempt * 7919);
  const items = Array.from({ length: COUNTS[Math.min(n, COUNTS.length) - 1] }, () => {
    const w = 2 + Math.floor(r() * 8);
    return [w, 2 * w + Math.floor(r() * 5) - 1];
  });
  const cap = Math.floor(items.reduce((a, [w]) => a + w, 0) / 2);
  return { items, cap, target: search(items, cap, Infinity)[0] };
};

export const nearTies = ({ items, cap, target }) => {
  let k = 0;
  for (let m = 0; m < 1 << items.length; m++) {
    let w = 0, v = 0;
    items.forEach(([iw, iv], i) => { if (m >> i & 1) { w += iw; v += iv; } });
    if (w <= cap && v >= target - 2 && v < target) k++;
  }
  return k;
};

export const greedyValue = ({ items, cap }) => {
  let w = 0, v = 0;
  items.map((it) => it).sort((a, b) => b[1] / b[0] - a[1] / a[0]).forEach(([iw, iv]) => { if (w + iw <= cap) { w += iw; v += iv; } });
  return v;
};

export function makeLevel(n) {
  for (let attempt = 0; ; attempt++) {
    const level = build(n, attempt);
    if (nearTies(level) >= 3 && (n < 2 || greedyValue(level) < level.target)) return level;
  }
}

export const initialState = (level) => ({ ...clone(level), picked: level.items.map(() => 0), moves: 0 });

const totals = (s) => s.items.reduce((a, [w, v], i) => (s.picked[i] ? [a[0] + w, a[1] + v] : a), [0, 0]);

export const legalMoves = (s) => {
  const [w] = totals(s);
  return s.items.map((it, i) => i).filter((i) => s.picked[i] || w + s.items[i][0] <= s.cap).map((i) => ({ i }));
};

export function applyMove(s, m) {
  if (!m || !legalMoves(s).some((x) => x.i === m.i)) return null;
  const t = clone(s);
  t.picked[m.i] ^= 1;
  t.moves++;
  return t;
}

export const isSolved = (s) => { const [w, v] = totals(s); return w <= s.cap && v >= s.target; };
export const bestScore = (level) => search(level.items, level.cap, level.target)[1];
export const score = (s) => s.moves;
export const maxTries = () => Infinity;
