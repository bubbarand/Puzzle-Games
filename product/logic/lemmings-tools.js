// RULE CHOICE: one row of cells (0 floor, 1 pit, 2 wall, 3 exit). Creatures walk right one at a time from the spawn cell. A wall turns them around; a pit or the board edge kills them. Tools: 0 bridge (fills a pit), 1 digger (removes a wall), 2 arrow (on a floor cell, turns a right-walking creature to the left), 3 blocker (on a floor cell, the first creature to reach it stays there for good and turns into a wall). The run is deterministic; a creature still walking after 200 steps is lost.
import { clone, bfs } from './solve.js';

export const meta = { id: 'lemmings-tools', title: 'Lemmings Tools', cls: 'direction' };

// avail = how many of each tool [bridge, digger, arrow, blocker].
const LEVELS = [
  { cells: [3, 0, 0, 0, 0, 1, 0], spawn: 4, k: 3, need: 2, avail: [1, 1, 1, 0] },
  { cells: [0, 3, 1, 2, 0, 1, 2, 2], spawn: 4, k: 4, need: 3, avail: [2, 1, 0, 1] },
  { cells: [0, 2, 1, 1, 3, 2, 0, 1, 0, 1, 0, 0], spawn: 8, k: 3, need: 3, avail: [2, 1, 1, 0] },
  { cells: [1, 0, 3, 1, 1, 0, 2, 0, 1, 0, 0, 1, 0], spawn: 7, k: 3, need: 2, avail: [3, 1, 2, 0] },
  { cells: [0, 0, 3, 1, 2, 0, 0, 1, 0, 0, 1, 0, 2, 0, 0, 0], spawn: 14, k: 3, need: 3, avail: [3, 2, 1, 0] },
];

export const makeLevel = (n) => clone(LEVELS[Math.min(n, LEVELS.length) - 1]);
export const initialState = (level) => ({ ...clone(level), tools: [], saved: null, moves: 0 });

const toolAt = (s, cell) => s.tools.find((t) => t[0] === cell)?.[1];
const FITS = [1, 2, 0, 0]; // cell type each tool goes on

// Number of creatures that reach the exit.
function run(s) {
  const eff = s.cells.map((c, i) => (toolAt(s, i) <= 1 ? 0 : c));
  const blockers = new Set(s.tools.filter((t) => t[1] === 3).map((t) => t[0]));
  let saved = 0;
  for (let i = 0; i < s.k; i++) {
    let pos = s.spawn, dir = 1;
    for (let step = 0; step < 200; step++) {
      const next = pos + dir;
      if (next < 0 || next >= eff.length || eff[next] === 1) break;
      if (eff[next] === 2) { dir = -dir; continue; }
      if (blockers.has(next)) { blockers.delete(next); eff[next] = 2; break; }
      pos = next;
      if (eff[pos] === 3) { saved++; break; }
      if (toolAt(s, pos) === 2 && dir === 1) dir = -1;
    }
  }
  return saved;
}

export function legalMoves(s) {
  const out = [{ t: 'run' }];
  s.tools.forEach(([cell]) => out.push({ t: 'remove', cell }));
  s.cells.forEach((type, cell) => {
    if (toolAt(s, cell) !== undefined || cell === s.spawn) return;
    for (let tool = 0; tool < 4; tool++)
      if (FITS[tool] === type && s.tools.filter((x) => x[1] === tool).length < s.avail[tool]) out.push({ t: 'place', cell, tool });
  });
  return out;
}

export function applyMove(s, m) {
  if (!m || !legalMoves(s).some((x) => JSON.stringify(x) === JSON.stringify(m))) return null;
  const t = clone(s);
  t.moves++;
  if (m.t === 'run') t.saved = run(t);
  else {
    t.saved = null;
    if (m.t === 'place') t.tools.push([m.cell, m.tool]);
    else t.tools = t.tools.filter((x) => x[0] !== m.cell);
    t.tools.sort((a, b) => a[0] - b[0]);
  }
  return t;
}

export const isSolved = (s) => s.saved !== null && s.saved >= s.need;
export const bestScore = (level) => bfs({ initialState, legalMoves, applyMove, isSolved }, level)?.depth ?? null;
export const score = (s) => s.moves;
export const maxTries = () => Infinity;
