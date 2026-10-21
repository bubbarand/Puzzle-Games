// RULE CHOICE: pips are 0 to 6; the rule is the same for the whole chain (0 every domino sums to p, 1 every domino differs by p with the second half larger, 2 domino sums grow by p each step); the last domino's second half is empty and you set it in one move.
import { clone, rng } from './solve.js';

export const meta = { id: 'domino-logic', title: 'Domino Logic', cls: 'sequence' };

// Per level (capped at 5): [rule, chain length, step p or 0 for random, max start]. The last second half is the answer.
const PLAN = [[0, 5, 0, 0], [1, 6, 0, 0], [2, 6, 1, 6], [2, 8, 1, 4], [2, 7, 2, 0]];

export function makeLevel(n) {
  const r = rng(n * 577);
  const [rule, len, step, maxStart] = PLAN[Math.min(n, PLAN.length) - 1];
  const p = step || (rule === 0 ? 4 + Math.floor(r() * 6) : 2 + Math.floor(r() * 3));
  const start = rule === 2 ? Math.floor(r() * (maxStart + 1)) : 0;
  const ds = [];
  for (let i = 0; i < len; i++) {
    const sum = rule === 2 ? start + i * p : rule === 0 ? p : 0;
    const lo = rule === 1 ? 0 : Math.max(0, sum - 6), hi = rule === 1 ? 6 - p : Math.min(6, sum);
    const a = lo + Math.floor(r() * (hi - lo + 1));
    ds.push([a, rule === 1 ? a + p : sum - a]);
  }
  return { rule, p, start, dominoes: ds, solution: [{ v: ds[len - 1][1] }] };
}

export const initialState = (level) => {
  const d = clone(level.dominoes);
  d[d.length - 1][1] = null;
  return { rule: level.rule, p: level.p, start: level.start, dominoes: d, moves: 0 };
};

export const legalMoves = (s) => (s.dominoes[s.dominoes.length - 1][1] === null ? [0, 1, 2, 3, 4, 5, 6].map((v) => ({ v })) : []);

export function applyMove(s, m) {
  if (!m || !Number.isInteger(m.v) || m.v < 0 || m.v > 6 || s.dominoes[s.dominoes.length - 1][1] !== null) return null;
  const t = clone(s);
  t.dominoes[t.dominoes.length - 1][1] = m.v;
  t.moves++;
  return t;
}

export function isSolved(s) {
  const last = s.dominoes.length - 1, [a, b] = s.dominoes[last];
  if (b === null) return false;
  return s.rule === 0 ? a + b === s.p : s.rule === 1 ? b - a === s.p : a + b === s.start + last * s.p;
}

export const bestScore = () => 1;
export const score = (s) => s.moves;
export const maxTries = () => Infinity;
