// RULE CHOICE: the goal is all discs on the last peg; levels go from 3 pegs/4 discs up to 3 pegs/7 discs (level 3 uses 4 pegs/7 discs).
import { clone, bfs } from './solve.js';

export const meta = { id: 'hanoi', title: 'Hanoi', cls: 'sequence' };

const LEVELS = [[3, 4], [3, 5], [4, 7], [3, 6], [3, 7]];

export function makeLevel(n) {
  const [pegs, discs] = LEVELS[Math.min(n, LEVELS.length) - 1];
  return { pegs, discs };
}

export const initialState = ({ pegs, discs }) => ({
  pegs: Array.from({ length: pegs }, (_, i) => (i ? [] : Array.from({ length: discs }, (_, k) => discs - k))),
  moves: 0,
});

const top = (p) => p[p.length - 1];

export function legalMoves(s) {
  const out = [];
  s.pegs.forEach((a, from) => s.pegs.forEach((b, to) => {
    if (from !== to && a.length && (!b.length || top(a) < top(b))) out.push({ from, to });
  }));
  return out;
}

export function applyMove(s, m) {
  if (!m || !legalMoves(s).some((x) => x.from === m.from && x.to === m.to)) return null;
  const t = clone(s);
  t.pegs[m.to].push(t.pegs[m.from].pop());
  t.moves++;
  return t;
}

export const isSolved = (s) => s.pegs.slice(0, -1).every((p) => !p.length);
export const bestScore = (level) => bfs({ initialState, legalMoves, applyMove, isSolved }, level)?.depth ?? null;
export const score = (s) => s.moves;
export const maxTries = () => Infinity;
