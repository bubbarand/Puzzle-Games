// RULE CHOICE: a unit moves to any empty cell within 3 steps (no path needed), then may punch one adjacent enemy, pushing it 1 cell (a push into another enemy kills both; into a wall, building or unit it does nothing). Enemies stand still, hit the cell they face when the turn ends (building, unit or enemy dies), then turn clockwise. Each act and each end of turn is one move; solved = the turn limit is reached with enough buildings.
import { clone } from './solve.js';

export const meta = { id: 'breach-turns', title: 'Breach Turns', cls: 'sequence' };

// Directions: 0 up, 1 right, 2 down, 3 left. enemy = [row, col, facing dir]. solution = stored list of moves (found by search).
const LEVELS = [
  {
    size: 6, buildings: [[1,0],[5,2],[4,0],[1,2],[2,4],[4,3],[2,5]], units: [[0,1],[2,3],[4,5]], enemies: [[3,0,1],[5,3,0],[4,1,2]], turns: 2, keep: 6,
    solution: [
      {"t": "act", "u": 2, "to": [4, 2], "punch": 3},
      {"t": "end"},
      {"t": "act", "u": 2, "to": [5, 1], "punch": 0},
      {"t": "act", "u": 1, "to": [3, 2], "punch": 3},
      {"t": "end"},
    ],
  },
  {
    size: 6, buildings: [[4,5],[2,4],[2,3],[1,5],[5,1],[0,2],[4,3]], units: [[2,0],[4,2],[5,3]], enemies: [[5,2,2],[2,2,0],[4,4,0]], turns: 2, keep: 7,
    solution: [
      {"t": "act", "u": 0, "to": [1, 2], "punch": 2},
      {"t": "end"},
      {"t": "act", "u": 1, "to": [2, 2], "punch": 2},
      {"t": "act", "u": 0, "to": [3, 2], "punch": 2},
      {"t": "act", "u": 2, "to": [3, 4], "punch": 2},
      {"t": "end"},
    ],
  },
  {
    size: 6, buildings: [[5,2],[3,0],[4,0],[2,1],[3,4],[4,4],[1,5]], units: [[3,2],[5,4],[0,0]], enemies: [[3,3,3],[2,2,3],[2,0,3],[5,0,0]], turns: 3, keep: 6,
    solution: [
      {"t": "act", "u": 0, "to": [3, 2], "punch": 0},
      {"t": "act", "u": 1, "to": [4, 3], "punch": 0},
      {"t": "end"},
      {"t": "end"},
      {"t": "act", "u": 1, "to": [1, 3], "punch": 3},
      {"t": "act", "u": 0, "to": [1, 2], "punch": 3},
      {"t": "act", "u": 2, "to": [0, 0], "punch": 2},
      {"t": "end"},
    ],
  },
  {
    size: 6, buildings: [[3,3],[2,1],[0,5],[1,0],[2,3],[4,3],[2,0]], units: [[5,3],[3,4],[2,5]], enemies: [[3,1,2],[0,2,1],[0,4,3],[5,0,1]], turns: 3, keep: 7,
    solution: [
      {"t": "act", "u": 1, "to": [1, 4], "punch": 0},
      {"t": "end"},
      {"t": "act", "u": 0, "to": [4, 1], "punch": 0},
      {"t": "act", "u": 1, "to": [0, 3], "punch": 1},
      {"t": "act", "u": 2, "to": [1, 4], "punch": 0},
      {"t": "end"},
      {"t": "act", "u": 0, "to": [3, 0], "punch": 1},
      {"t": "act", "u": 1, "to": [0, 1], "punch": 1},
      {"t": "act", "u": 2, "to": [0, 2], "punch": 1},
      {"t": "end"},
    ],
  },
  {
    size: 6, buildings: [[0,5],[1,3],[1,0],[3,1],[4,0],[2,0],[2,2]], units: [[4,4],[1,4],[0,4]], enemies: [[4,2,1],[5,4,0],[2,1,2],[1,5,2]], turns: 3, keep: 6,
    solution: [
      {"t": "act", "u": 0, "to": [4, 1], "punch": 1},
      {"t": "act", "u": 1, "to": [1, 1], "punch": 2},
      {"t": "act", "u": 2, "to": [1, 4], "punch": 1},
      {"t": "end"},
      {"t": "act", "u": 0, "to": [5, 3], "punch": 0},
      {"t": "act", "u": 1, "to": [3, 2], "punch": 1},
      {"t": "act", "u": 2, "to": [1, 1], "punch": 2},
      {"t": "end"},
      {"t": "act", "u": 0, "to": [4, 4], "punch": 0},
      {"t": "act", "u": 2, "to": [2, 3], "punch": 1},
      {"t": "act", "u": 1, "to": [3, 5], "punch": 0},
      {"t": "end"},
    ],
  },
];

export const makeLevel = (n) => clone(LEVELS[Math.min(n, LEVELS.length) - 1]);
export const initialState = (level) => ({ ...clone(level), acted: level.units.map(() => false), turn: 0, moves: 0 });

const D = [[-1, 0], [0, 1], [1, 0], [0, -1]];
const same = (p, r, c) => p[0] === r && p[1] === c;
const inside = (s, r, c) => r >= 0 && c >= 0 && r < s.size && c < s.size;
const blocked = (s, r, c) => [...s.buildings, ...s.units, ...s.enemies].some((p) => same(p, r, c));
const failed = (s) => s.buildings.length < s.keep || !s.units.length;

export const isSolved = (s) => s.turn >= s.turns && s.buildings.length >= s.keep;

function legal(s, m) {
  if (isSolved(s) || failed(s) || !m) return false;
  if (m.t === 'end') return true;
  if (m.t !== 'act' || !s.units[m.u] || s.acted[m.u] || !Array.isArray(m.to)) return false;
  const [r, c] = s.units[m.u], [tr, tc] = m.to;
  if (!inside(s, tr, tc) || Math.abs(tr - r) + Math.abs(tc - c) > 3) return false;
  if ((tr !== r || tc !== c) && blocked(s, tr, tc)) return false;
  if (m.punch === -1) return true;
  return m.punch >= 0 && m.punch < 4 && s.enemies.some((e) => same(e, tr + D[m.punch][0], tc + D[m.punch][1]));
}

export function legalMoves(s) {
  if (isSolved(s) || failed(s)) return [];
  const out = [{ t: 'end' }];
  s.units.forEach(([r, c], u) => {
    if (s.acted[u]) return;
    for (let tr = r - 3; tr <= r + 3; tr++)
      for (let tc = c - 3; tc <= c + 3; tc++)
        for (let punch = -1; punch < 4; punch++) {
          const m = { t: 'act', u, to: [tr, tc], punch };
          if (legal(s, m)) out.push(m);
        }
  });
  return out;
}

export function applyMove(s, m) {
  if (!legal(s, m)) return null;
  const t = clone(s);
  t.moves++;
  if (m.t === 'act') {
    t.units[m.u] = [...m.to];
    t.acted[m.u] = true;
    if (m.punch >= 0) {
      const [er, ec] = [m.to[0] + D[m.punch][0], m.to[1] + D[m.punch][1]];
      const i = t.enemies.findIndex((e) => same(e, er, ec));
      const [nr, nc] = [er + D[m.punch][0], ec + D[m.punch][1]];
      const j = t.enemies.findIndex((e) => same(e, nr, nc));
      if (inside(t, nr, nc) && j >= 0) t.enemies = t.enemies.filter((_, k) => k !== i && k !== j);
      else if (inside(t, nr, nc) && !blocked(t, nr, nc)) { t.enemies[i][0] = nr; t.enemies[i][1] = nc; }
    }
    return t;
  }
  // End of turn: each enemy hits the cell it faces, then turns clockwise.
  const order = t.enemies.map((e) => e);
  for (const e of order) {
    if (!t.enemies.includes(e)) continue;
    const [r, c] = [e[0] + D[e[2]][0], e[1] + D[e[2]][1]];
    t.buildings = t.buildings.filter((p) => !same(p, r, c));
    t.units = t.units.filter((p) => !same(p, r, c));
    t.enemies = t.enemies.filter((p) => !same(p, r, c));
    e[2] = (e[2] + 1) % 4;
  }
  t.acted = t.units.map(() => false);
  t.turn++;
  return t;
}

export const bestScore = (level) => level.solution.length;
export const score = (s) => s.moves;
export const maxTries = () => Infinity;
