// RULE CHOICE: a move slides one car any number of free cells (counts as 1 move); car 0 is the red car and exits at the right edge.
import { clone } from './solve.js';

export const meta = { id: 'traffic-jam', title: 'Traffic Jam', cls: 'space' };

// car = [row, col, length, horizontal 1/0]; car 0 is red.
// Fewest moves (BFS): 9, 14, 20, 27, 35. Boards found by random search plus hill climbing on the BFS depth.
const LEVELS = [
  { size: 6, cars: [[2, 1, 2, 1], [2, 3, 2, 0], [1, 3, 2, 1], [1, 5, 3, 0], [4, 3, 3, 1], [0, 3, 2, 1], [0, 0, 3, 0], [3, 2, 3, 0]] },
  { size: 6, cars: [[2, 1, 2, 1], [1, 4, 2, 0], [4, 4, 2, 1], [0, 5, 3, 0], [5, 3, 3, 1], [1, 3, 2, 0], [3, 2, 3, 0], [3, 3, 2, 0], [1, 0, 2, 0]] },
  { size: 6, cars: [[2, 0, 2, 1], [1, 5, 3, 0], [1, 3, 3, 0], [3, 0, 2, 1], [5, 2, 2, 1], [4, 3, 2, 1], [3, 2, 2, 0], [4, 1, 2, 0], [1, 2, 2, 0]] },
  { size: 6, cars: [[2, 0, 2, 1], [0, 5, 3, 0], [1, 2, 2, 0], [0, 3, 2, 0], [0, 4, 2, 0], [5, 2, 2, 1], [2, 3, 2, 0], [3, 4, 2, 1], [3, 2, 2, 0], [4, 3, 2, 1], [0, 0, 2, 1], [4, 1, 2, 0], [5, 4, 2, 1], [4, 0, 2, 0]] },
  { size: 6, cars: [[2, 2, 2, 1], [3, 0, 2, 0], [1, 4, 3, 0], [1, 5, 2, 0], [4, 3, 2, 1], [4, 2, 2, 0], [1, 0, 2, 0], [5, 0, 2, 1], [3, 1, 3, 1], [0, 1, 2, 1], [4, 5, 2, 0], [0, 3, 2, 0], [1, 1, 2, 0]] },
];

export const makeLevel = (n) => clone(LEVELS[Math.min(n, LEVELS.length) - 1]);

export const initialState = (level) => ({ size: level.size, cars: clone(level.cars), moves: 0 });

const occupied = (s, skip) => {
  const g = new Set();
  s.cars.forEach(([r, c, len, h], i) => {
    if (i !== skip) for (let k = 0; k < len; k++) g.add(h ? r * 10 + c + k : (r + k) * 10 + c);
  });
  return g;
};

export function legalMoves(s) {
  const out = [];
  s.cars.forEach(([r, c, len, h], i) => {
    const g = occupied(s, i);
    for (const sign of [-1, 1]) {
      for (let d = 1; ; d++) {
        const rr = r + (h ? 0 : sign * d), cc = c + (h ? sign * d : 0);
        const front = sign > 0 ? (h ? cc + len - 1 : rr + len - 1) : (h ? cc : rr);
        if (front < 0 || front >= s.size) break;
        const cell = h ? rr * 10 + front : front * 10 + cc;
        if (g.has(cell)) break;
        out.push({ car: i, d: sign * d });
      }
    }
  });
  return out;
}

export function applyMove(s, m) {
  if (!m || !legalMoves(s).some((x) => x.car === m.car && x.d === m.d)) return null;
  const t = clone(s);
  const car = t.cars[m.car];
  car[car[3] ? 1 : 0] += m.d;
  t.moves++;
  return t;
}

export const isSolved = (s) => s.cars[0][1] + s.cars[0][2] === s.size;
export const score = (s) => s.moves;
export const maxTries = () => Infinity;

// Fewest-move solution by breadth-first search over car positions only (compact, so the 35-move level stays fast).
// Returns the move list ({ car, d }), or null. Same rules as legalMoves/applyMove.
export function solve(level) {
  const { size, cars } = level;
  const pos = (cs) => cs.map(([r, c, , h]) => (h ? c : r));
  const key = (p) => String.fromCharCode(...p);
  const start = pos(cars);
  const parent = new Map([[key(start), null]]);
  let frontier = [start];
  while (frontier.length) {
    const next = [];
    for (const p of frontier) {
      if (p[0] + cars[0][2] === size) {
        const out = [];
        for (let k = key(p); parent.get(k); k = parent.get(k).from) out.unshift(parent.get(k).move);
        return out;
      }
      const grid = new Uint8Array(size * size);
      cars.forEach(([r, c, len, h], i) => { for (let k = 0; k < len; k++) grid[h ? r * size + p[i] + k : (p[i] + k) * size + c] = 1; });
      cars.forEach(([r, c, len, h], i) => {
        for (let k = 0; k < len; k++) grid[h ? r * size + p[i] + k : (p[i] + k) * size + c] = 0;
        for (const sign of [-1, 1])
          for (let d = 1; ; d++) {
            const q = p[i] + sign * d, front = sign > 0 ? q + len - 1 : q;
            if (front < 0 || front >= size || grid[h ? r * size + front : front * size + c]) break;
            const np = p.slice(); np[i] = q;
            const nk = key(np);
            if (!parent.has(nk)) { parent.set(nk, { from: key(p), move: { car: i, d: sign * d } }); next.push(np); }
          }
        for (let k = 0; k < len; k++) grid[h ? r * size + p[i] + k : (p[i] + k) * size + c] = 1;
      });
    }
    frontier = next;
  }
  return null;
}
export const bestScore = (level) => solve(level)?.length ?? null;
