// RULE CHOICE: classic rules for every level (no changing crates); a move is one step or one push, 4 directions numbered 0 up, 1 right, 2 down, 3 left.
import { clone } from './solve.js';

export const meta = { id: 'sokoban', title: 'Sokoban', cls: 'space' };

// Symbols: # wall, space floor, . target, $ crate, * crate on target, @ player, + player on target.
// Min moves (steps and pushes, checked by solve): 23, 41, 47, 67, 87. Levels 4 and 5 are pillar rooms.
const LEVELS = [
  ['########', '#      #', '# .**$@#', '#      #', '#####  #', '########'],
  ['#########', '###  ####', '#     $ #', '# #  #$ #', '# . .#@ #', '#########'],
  ['##########', '#@  #    #', '# $ #  $ #', '#   #    #', '#   ## ###', '# $      #', '#        #', '####.. .##', '##########'],
  ['###########', '#@        #', '# # # # # #', '# $   $ $ #', '# # # # # #', '#         #', '# # # # # #', '#.  . .   #', '###########'],
  ['###########', '#@        #', '# # # # # #', '# $   $ $ #', '# # # # # #', '#   $     #', '# # # # # #', '#.  . . . #', '###########'],
];

export const makeLevel = (n) => ({ rows: [...LEVELS[Math.min(n, LEVELS.length) - 1]] });

export function initialState({ rows }) {
  const s = { walls: rows.map((r) => [...r].map((ch) => (ch === '#' ? 1 : 0))), targets: [], crates: [], player: null, moves: 0 };
  rows.forEach((row, r) => [...row].forEach((ch, c) => {
    if ('.*+'.includes(ch)) s.targets.push([r, c]);
    if ('$*'.includes(ch)) s.crates.push([r, c]);
    if ('@+'.includes(ch)) s.player = [r, c];
  }));
  return s;
}

const D = [[-1, 0], [0, 1], [1, 0], [0, -1]];
const crateAt = (s, r, c) => s.crates.findIndex((p) => p[0] === r && p[1] === c);
const free = (s, r, c) => s.walls[r]?.[c] === 0 && crateAt(s, r, c) < 0;

export function applyMove(s, m) {
  if (!m || !(m.d >= 0 && m.d < 4)) return null;
  const [dr, dc] = D[m.d];
  const r = s.player[0] + dr, c = s.player[1] + dc;
  const i = crateAt(s, r, c);
  if (s.walls[r]?.[c] !== 0) return null;
  if (i >= 0 && !free(s, r + dr, c + dc)) return null;
  const t = clone(s);
  if (i >= 0) t.crates[i] = [r + dr, c + dc];
  t.player = [r, c];
  t.moves++;
  return t;
}

export const legalMoves = (s) => [0, 1, 2, 3].map((d) => ({ d })).filter((m) => applyMove(s, m));
export const isSolved = (s) => s.crates.every(([r, c]) => s.targets.some((p) => p[0] === r && p[1] === c));
// Fewest-move solution (steps and pushes) by breadth-first search over (player, sorted crates), packed into short keys so
// the bigger rooms stay fast. Returns the move list ({ d }), or null.
const memo = new Map();
export function solve(level) {
  const mk = JSON.stringify(level.rows);
  if (!memo.has(mk)) memo.set(mk, search(level));
  return memo.get(mk);
}
function search(level) {
  const s = initialState(level);
  const W = s.walls[0].length, cell = (p) => p[0] * W + p[1];
  const goal = new Set(s.targets.map(cell));
  const done = (cs) => cs.every((c) => goal.has(c));
  const key = (p, cs) => String.fromCharCode(p, ...cs);
  const start = s.crates.map(cell).sort((a, b) => a - b), sp = cell(s.player);
  if (done(start)) return [];
  const parent = new Map([[key(sp, start), null]]);
  let frontier = [[sp, start]];
  while (frontier.length) {
    const next = [];
    for (const [p, cs] of frontier) {
      const pr = Math.floor(p / W), pc = p % W;
      for (let d = 0; d < 4; d++) {
        const nr = pr + D[d][0], nc = pc + D[d][1];
        if (s.walls[nr]?.[nc] !== 0) continue;
        const np = nr * W + nc, ci = cs.indexOf(np);
        let ncs = cs;
        if (ci >= 0) {
          const br = nr + D[d][0], bc = nc + D[d][1];
          if (s.walls[br]?.[bc] !== 0 || cs.includes(br * W + bc)) continue;
          ncs = cs.slice(); ncs[ci] = br * W + bc; ncs.sort((a, b) => a - b);
        }
        const k = key(np, ncs);
        if (parent.has(k)) continue;
        parent.set(k, { from: key(p, cs), d });
        if (done(ncs)) {
          const out = [];
          for (let q = k; parent.get(q); q = parent.get(q).from) out.unshift({ d: parent.get(q).d });
          return out;
        }
        next.push([np, ncs]);
      }
    }
    frontier = next;
  }
  return null;
}
export const bestScore = (level) => solve(level)?.length ?? null;
export const score = (s) => s.moves;
export const maxTries = () => Infinity;
