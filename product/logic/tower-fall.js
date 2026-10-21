// RULE CHOICE: enemies walk a straight path of len cells at 1 cell per tick. A tower on slot p hits the front-most enemy within 1 cell of p for 1 damage each tick (towers fire in slot order, before enemies move). An enemy that walks off the end is a leak; solved = leaks < lives. Placing, removing and running each count as one move.
import { clone, bfs } from './solve.js';

export const meta = { id: 'tower-fall', title: 'Tower Fall', cls: 'sequence' };

// waves = [spawn tick, hp] for each enemy. maxTowers = towers you may place. slots = path cells where towers may go.
const LEVELS = [
  { len: 8, slots: [1, 2, 5, 6, 7], waves: [[1, 3], [5, 1], [3, 3], [4, 4]], maxTowers: 2, lives: 1 },
  { len: 10, slots: [4, 5, 6, 7, 8, 9], waves: [[5, 4], [6, 1], [1, 3], [7, 2], [4, 2], [4, 3], [5, 2]], maxTowers: 3, lives: 2 },
  { len: 11, slots: [1, 3, 4, 5, 8, 10], waves: [[1, 4], [3, 2], [5, 1], [7, 2], [7, 4], [6, 4], [3, 2], [4, 3], [3, 2]], maxTowers: 4, lives: 1 },
  { len: 12, slots: [1, 2, 3, 4, 5, 6, 7, 9, 10], waves: [[4, 3], [1, 4], [2, 3], [5, 2], [2, 2], [6, 2], [6, 2], [3, 1], [4, 4], [7, 2], [6, 4]], maxTowers: 5, lives: 1 },
  { len: 12, slots: [1, 2, 3, 5, 6, 7, 8, 9, 11], waves: [[3, 4], [1, 4], [1, 1], [4, 4], [5, 2], [1, 4], [7, 3], [2, 3], [1, 1], [8, 1], [8, 4], [4, 4], [3, 4]], maxTowers: 6, lives: 1 },
];

export const makeLevel = (n) => clone(LEVELS[Math.min(n, LEVELS.length) - 1]);
export const initialState = (level) => ({ ...clone(level), towers: [], leaks: null, moves: 0 });

// Number of enemies that get past the end.
function run(s) {
  const alive = [];
  let leaks = 0;
  const last = Math.max(...s.waves.map((w) => w[0]));
  for (let tick = 0; tick <= last + s.len + 1; tick++) {
    s.waves.forEach(([at, hp]) => { if (at === tick) alive.push({ pos: 0, hp }); });
    for (const p of s.towers) {
      const hit = alive.filter((e) => e.hp > 0 && Math.abs(e.pos - p) <= 1).sort((a, b) => b.pos - a.pos)[0];
      if (hit) hit.hp--;
    }
    for (const e of alive) if (e.hp > 0) e.pos++;
    for (let i = alive.length - 1; i >= 0; i--) {
      if (alive[i].hp <= 0) alive.splice(i, 1);
      else if (alive[i].pos >= s.len) { leaks++; alive.splice(i, 1); }
    }
  }
  return leaks;
}

export function legalMoves(s) {
  const out = [{ t: 'run' }];
  s.towers.forEach((p) => out.push({ t: 'remove', p }));
  if (s.towers.length < s.maxTowers) s.slots.filter((p) => !s.towers.includes(p)).forEach((p) => out.push({ t: 'place', p }));
  return out;
}

export function applyMove(s, m) {
  if (!m || !legalMoves(s).some((x) => JSON.stringify(x) === JSON.stringify(m))) return null;
  const t = clone(s);
  t.moves++;
  if (m.t === 'run') t.leaks = run(t);
  else {
    t.leaks = null;
    t.towers = m.t === 'place' ? [...t.towers, m.p].sort((a, b) => a - b) : t.towers.filter((p) => p !== m.p);
  }
  return t;
}

export const isSolved = (s) => s.leaks !== null && s.leaks < s.lives;
export const bestScore = (level) => bfs({ initialState, legalMoves, applyMove, isSolved }, level)?.depth ?? null;
export const score = (s) => s.moves;
export const maxTries = () => Infinity;
