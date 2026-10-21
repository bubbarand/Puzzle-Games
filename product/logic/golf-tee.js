// RULE CHOICE: every board is a triangle (4 pegs on the bottom row at level 1); jumps use the 6 triangle directions; a jump is one move; solved = exactly one peg left.
import { clone } from './solve.js';

export const meta = { id: 'golf-tee', title: 'Golf Tee', cls: 'space' };

// board rows: 0 no hole, 1 peg, 2 empty hole. dirs: [dr, dc] list.
const SQ = [[0, 1], [0, -1], [1, 0], [-1, 0]];
const TRI = [...SQ, [1, 1], [-1, -1]];
// One board: the 4-row triangle (4 pegs on the bottom row, 10 holes, 8 jumps). Levels differ only in which hole starts empty; every one of these is solvable.
const tri = (r, c) => ({ dirs: TRI, board: Array.from({ length: 4 }, (_, i) => Array.from({ length: i + 1 }, (_, k) => (i === r && k === c ? 2 : 1))) });
const LEVELS = [tri(3, 1), tri(1, 0), tri(2, 2), tri(2, 0), tri(1, 1)];

export const makeLevel = (n) => clone(LEVELS[Math.min(n, LEVELS.length) - 1]);
export const initialState = (level) => ({ ...clone(level), moves: 0 });

const at = (s, r, c) => (s.board[r] ? s.board[r][c] : undefined);

export function legalMoves(s) {
  const out = [];
  s.board.forEach((row, r) => row.forEach((v, c) => {
    if (v !== 1) return;
    for (const [dr, dc] of s.dirs)
      if (at(s, r + dr, c + dc) === 1 && at(s, r + 2 * dr, c + 2 * dc) === 2) out.push({ from: [r, c], dir: [dr, dc] });
  }));
  return out;
}

export function applyMove(s, m) {
  if (!m || !legalMoves(s).some((x) => JSON.stringify(x) === JSON.stringify(m))) return null;
  const t = clone(s);
  const [r, c] = m.from, [dr, dc] = m.dir;
  t.board[r][c] = 2;
  t.board[r + dr][c + dc] = 2;
  t.board[r + 2 * dr][c + 2 * dc] = 1;
  t.moves++;
  return t;
}

const pegs = (b) => b.flat().filter((v) => v === 1).length;
export const isSolved = (s) => pegs(s.board) === 1;
// Every jump removes one peg, so a solution always takes pegs - 1 moves. Depth-first search with a memo of dead boards
// (the state space is too big for BFS on the larger boards). solve returns the jump list, or null when unsolvable.
export function solve(level) {
  const b = clone(level.board), dead = new Set(), path = [];
  const at = (r, c) => (b[r] ? b[r][c] : undefined);
  const dfs = () => {
    if (pegs(b) === 1) return true;
    const key = b.map((row) => row.join('')).join('/');
    if (dead.has(key)) return false;
    for (let r = 0; r < b.length; r++)
      for (let c = 0; c < b[r].length; c++) {
        if (b[r][c] !== 1) continue;
        for (const [dr, dc] of level.dirs)
          if (at(r + dr, c + dc) === 1 && at(r + 2 * dr, c + 2 * dc) === 2) {
            b[r][c] = 2; b[r + dr][c + dc] = 2; b[r + 2 * dr][c + 2 * dc] = 1;
            path.push({ from: [r, c], dir: [dr, dc] });
            if (dfs()) return true;
            path.pop();
            b[r][c] = 1; b[r + dr][c + dc] = 1; b[r + 2 * dr][c + 2 * dc] = 2;
          }
      }
    dead.add(key);
    return false;
  };
  return dfs() ? path : null;
}
export const bestScore = (level) => (solve(level) ? pegs(level.board) - 1 : null);
export const score = (s) => s.moves;
export const maxTries = () => Infinity;
