// RULE CHOICE: pipes are one-way (first node to second node); one move adds or removes 1 unit of flow on one pipe; node 0 is the source; solved = every other non-sink node passes on all it gets and every sink keeps exactly its demand.
import { clone } from './solve.js';

export const meta = { id: 'network-flow', title: 'Network Flow', cls: 'direction' };

// edges = [from, to, capacity]; demands = [node, amount].
const LEVELS = [
  { nodes: 4, edges: [[0, 1, 3], [0, 2, 3], [1, 3, 1], [2, 3, 4]], demands: [[3, 4]] },
  { nodes: 7, edges: [[0, 2, 2], [0, 1, 4], [1, 3, 3], [1, 4, 1], [2, 3, 3], [3, 5, 3], [4, 5, 2], [4, 6, 1]], demands: [[5, 3], [6, 1]] },
  { nodes: 7, edges: [[0, 2, 5], [0, 1, 2], [1, 4, 1], [2, 4, 4], [2, 3, 1], [3, 5, 3], [4, 5, 4], [4, 6, 4], [2, 5, 1]], demands: [[5, 2], [6, 4]] },
  { nodes: 9, edges: [[0, 2, 5], [0, 3, 4], [0, 1, 1], [1, 4, 1], [2, 6, 4], [3, 4, 1], [3, 5, 2], [4, 8, 2], [5, 7, 1], [6, 8, 3], [6, 7, 4]], demands: [[7, 2], [8, 5]] },
  { nodes: 12, edges: [[0, 3, 5], [0, 1, 1], [0, 2, 2], [1, 6, 3], [2, 6, 3], [2, 5, 3], [2, 4, 4], [3, 4, 2], [3, 6, 4], [4, 8, 1], [4, 9, 1], [5, 7, 2], [5, 8, 2], [6, 7, 2], [6, 8, 1], [7, 10, 1], [8, 11, 4], [9, 11, 4], [9, 10, 4], [1, 10, 2]], demands: [[10, 2], [11, 5]] },
];

export const makeLevel = (n) => clone(LEVELS[Math.min(n, LEVELS.length) - 1]);
export const initialState = (level) => ({ ...clone(level), flow: level.edges.map(() => 0), moves: 0 });

export function legalMoves(s) {
  const out = [];
  s.edges.forEach(([, , cap], e) => {
    if (s.flow[e] < cap) out.push({ e, d: 1 });
    if (s.flow[e] > 0) out.push({ e, d: -1 });
  });
  return out;
}

export function applyMove(s, m) {
  if (!m || !legalMoves(s).some((x) => x.e === m.e && x.d === m.d)) return null;
  const t = clone(s);
  t.flow[m.e] += m.d;
  t.moves++;
  return t;
}

export function isSolved(s) {
  const net = Array(s.nodes).fill(0); // inflow minus outflow
  s.edges.forEach(([a, b], e) => { net[a] -= s.flow[e]; net[b] += s.flow[e]; });
  return net.every((x, v) => v === 0 || x === (s.demands.find((d) => d[0] === v)?.[1] ?? 0));
}

// Fewest moves = least total flow over all pipes: min-cost flow with cost 1 per unit per pipe (successive shortest paths).
// Returns the flow on each pipe, or null if the demands cannot be met. (Checked against BFS in the tests.)
export function bestFlow(level) {
  const T = level.nodes, arcs = []; // arcs come in pairs: arc i and its reverse i ^ 1
  const add = (a, b, cap, cost) => { arcs.push({ a, b, cap, cost }, { a: b, b: a, cap: 0, cost: -cost }); };
  level.edges.forEach(([a, b, cap]) => add(a, b, cap, 1));
  level.demands.forEach(([v, d]) => add(v, T, d, 0));
  let need = level.demands.reduce((x, [, d]) => x + d, 0);
  while (need > 0) {
    const dist = Array(T + 1).fill(Infinity), via = Array(T + 1).fill(-1);
    dist[0] = 0;
    for (let round = 0; round <= T; round++)
      arcs.forEach((x, i) => { if (x.cap > 0 && dist[x.a] + x.cost < dist[x.b]) { dist[x.b] = dist[x.a] + x.cost; via[x.b] = i; } });
    if (dist[T] === Infinity) return null;
    let push = need;
    for (let v = T; v !== 0; v = arcs[via[v]].a) push = Math.min(push, arcs[via[v]].cap);
    for (let v = T; v !== 0; v = arcs[via[v]].a) { arcs[via[v]].cap -= push; arcs[via[v] ^ 1].cap += push; }
    need -= push;
  }
  return level.edges.map((_, e) => arcs[2 * e + 1].cap);
}

export const bestScore = (level) => bestFlow(level)?.reduce((a, b) => a + b, 0) ?? null;
export const score = (s) => s.moves;
export const maxTries = () => Infinity;
