// RULE CHOICE: a cell is [count, rotation, fill] with moduli 3, 4, 3; each attribute follows (a0 + across*col + down*row) mod modulus; the missing cell is always the bottom right; more attributes vary in later levels.
import { clone, rng } from './solve.js';

export const meta = { id: 'matrix-reasoning', title: 'Matrix Reasoning', cls: 'sequence' };

const MOD = [3, 4, 3];
const cell = (rules, r, c) => rules.map(([a0, across, down], k) => (a0 + across * c + down * r) % MOD[k]);

// Per level (capped at 5): how many attributes change across a row, and how many also change down a column.
const VARY = [1, 2, 3, 3, 3], DOWN = [0, 0, 1, 2, 3];

export function makeLevel(n) {
  const rnd = rng(n * 37);
  const d = Math.min(n, 5) - 1;
  const rules = MOD.map((m, k) => {
    const vary = k < VARY[d];
    return [Math.floor(rnd() * m), vary ? 1 + Math.floor(rnd() * (m - 1)) : 0, vary && k >= VARY[d] - DOWN[d] ? 1 + Math.floor(rnd() * (m - 1)) : 0];
  });
  const ans = cell(rules, 2, 2);
  const alts = MOD.flatMap((m, k) => [...Array(m).keys()].filter((v) => v !== ans[k]).map((v) => ({ k, o: ans.map((x, i) => (i === k ? v : x)) })));
  for (let i = alts.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [alts[i], alts[j]] = [alts[j], alts[i]]; }
  if (d >= 2) alts.sort((x, y) => (rules[y.k][1] || rules[y.k][2] ? 1 : 0) - (rules[x.k][1] || rules[x.k][2] ? 1 : 0));
  const options = alts.slice(0, 5).map((a) => a.o);
  const at = Math.floor(rnd() * 6);
  options.splice(at, 0, ans);
  return { rules, options, solution: [{ pick: at }] };
}

export const initialState = (level) => ({
  rules: clone(level.rules),
  options: clone(level.options),
  grid: [0, 1, 2].map((r) => [0, 1, 2].map((c) => (r === 2 && c === 2 ? null : cell(level.rules, r, c)))),
  picked: null,
  moves: 0,
});

export const legalMoves = (s) => (isSolved(s) ? [] : s.options.map((_, pick) => ({ pick })));

export function applyMove(s, m) {
  if (!m || !Number.isInteger(m.pick) || m.pick < 0 || m.pick >= s.options.length || isSolved(s)) return null;
  const t = clone(s);
  t.picked = m.pick;
  t.moves++;
  return t;
}

export const isSolved = (s) => s.picked !== null && JSON.stringify(s.options[s.picked]) === JSON.stringify(cell(s.rules, 2, 2));
export const bestScore = () => 1;
export const score = (s) => s.moves;
export const maxTries = () => Infinity;
