// Shared tiling rules for build-square and pentomino-5x5. A level has a board mask, a full tiling
// (list of cell lists, one per piece) and fixed (piece numbers already placed). Pieces may rotate, not flip.
import { clone } from './solve.js';

const norm = (cells) => {
  const r0 = Math.min(...cells.map((p) => p[0])), c0 = Math.min(...cells.map((p) => p[1]));
  return cells.map(([r, c]) => [r - r0, c - c0]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
};
const turn = (cells) => cells.map(([r, c]) => [c, -r]);
const rotations = (cells) => {
  const out = [];
  let cur = cells;
  for (let k = 0; k < 4; k++) {
    cur = norm(turn(cur));
    if (!out.some((o) => JSON.stringify(o) === JSON.stringify(cur))) out.push(cur);
  }
  return out;
};
const cellKey = (cells) => JSON.stringify([...cells].sort((a, b) => a[0] - b[0] || a[1] - b[1]));

export function makePoly(meta, LEVELS) {
  const makeLevel = (n) => {
    const l = clone(LEVELS[Math.min(n, LEVELS.length) - 1]);
    l.solution = l.tiling.map((cells, i) => ({ t: 'place', i, cells })).filter((m) => !l.fixed.includes(m.i));
    return l;
  };

  const initialState = (level) => ({
    board: clone(level.board),
    shapes: level.tiling.map(norm),
    placed: level.tiling.map((cells, i) => (level.fixed.includes(i) ? clone(cells) : null)),
    fixed: level.tiling.map((_, i) => level.fixed.includes(i)),
    moves: 0,
  });

  const covered = (s, skip) => new Set(s.placed.flatMap((cells, i) => (cells && i !== skip ? cells.map(([r, c]) => r * 100 + c) : [])));

  const fits = (s, i, cells) =>
    Number.isInteger(i) && s.placed[i] === null && Array.isArray(cells) &&
    rotations(s.shapes[i]).some((o) => JSON.stringify(o) === JSON.stringify(norm(cells))) &&
    cells.every(([r, c]) => s.board[r]?.[c] === 1 && !covered(s).has(r * 100 + c));

  function legalMoves(s) {
    const out = [];
    s.placed.forEach((cells, i) => {
      if (cells) { if (!s.fixed[i]) out.push({ t: 'remove', i }); return; }
      const seen = new Set();
      for (const o of rotations(s.shapes[i]))
        for (let r = 0; r < s.board.length; r++)
          for (let c = 0; c < s.board[0].length; c++) {
            const abs = o.map(([a, b]) => [a + r, b + c]);
            if (!seen.has(cellKey(abs)) && fits(s, i, abs)) { seen.add(cellKey(abs)); out.push({ t: 'place', i, cells: abs }); }
          }
    });
    return out;
  }

  function applyMove(s, m) {
    if (!m) return null;
    const t = clone(s);
    if (m.t === 'place' && fits(s, m.i, m.cells)) t.placed[m.i] = clone(m.cells);
    else if (m.t === 'remove' && s.placed[m.i] && !s.fixed[m.i]) t.placed[m.i] = null;
    else return null;
    t.moves++;
    return t;
  }

  const isSolved = (s) => s.placed.every(Boolean);
  const bestScore = (level) => level.tiling.length - level.fixed.length;
  return { meta, makeLevel, initialState, legalMoves, applyMove, isSolved, bestScore, score: (s) => s.moves, maxTries: () => Infinity };
}
