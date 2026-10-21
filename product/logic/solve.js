// Shared helpers for games and tests. No game rules here.
export const clone = (x) => JSON.parse(JSON.stringify(x));

// Seeded random number generator (mulberry32). Returns a function giving [0,1).
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Breadth-first search over a game. Returns { depth, path } for the fewest moves, or null.
// key: state -> string (default ignores the `moves` counter). limit: max states visited.
export function bfs(game, level, { key, limit = 400000 } = {}) {
  const k = key || ((s) => JSON.stringify(s, (n, v) => (n === 'moves' ? undefined : v)));
  const start = game.initialState(level);
  if (game.isSolved(start)) return { depth: 0, path: [] };
  const seen = new Set([k(start)]);
  let frontier = [{ s: start, path: [] }];
  while (frontier.length && seen.size < limit) {
    const next = [];
    for (const { s, path } of frontier) {
      for (const m of game.legalMoves(s)) {
        const t = game.applyMove(s, m);
        if (!t) continue;
        const id = k(t);
        if (seen.has(id)) continue;
        seen.add(id);
        const p = [...path, m];
        if (game.isSolved(t)) return { depth: p.length, path: p };
        next.push({ s: t, path: p });
      }
    }
    frontier = next;
  }
  return null;
}
