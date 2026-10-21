import test from 'node:test';
import assert from 'node:assert/strict';
import * as g from '../network-flow.js';
import { contractTests } from '../testkit.js';
import { bfs, rng } from '../solve.js';

// Levels 3 to 5 are too big for BFS in a test, so the solver g.bestFlow gives the stored solution; BFS checks it on small graphs below.
const solve = (level) => g.bestFlow(level).flatMap((f, e) => Array.from({ length: f }, () => ({ e, d: 1 })));
contractTests(g, 5, { solve });

test('network-flow: capacity is respected', () => {
  let s = g.initialState(g.makeLevel(1));
  for (let i = 0; i < 3; i++) s = g.applyMove(s, { e: 0, d: 1 });
  assert.equal(g.applyMove(s, { e: 0, d: 1 }), null);
  assert.equal(g.applyMove(g.initialState(g.makeLevel(1)), { e: 0, d: -1 }), null);
});

test('network-flow: leaking flow (not passed on) is not solved', () => {
  let s = g.initialState(g.makeLevel(1));
  s = g.applyMove(g.applyMove(s, { e: 0, d: 1 }), { e: 0, d: 1 });
  assert.equal(g.isSolved(s), false);
});

test('network-flow: level 1 best is 8 unit moves', () => {
  assert.equal(g.bestScore(g.makeLevel(1)), 8);
});

test('network-flow: the min-cost-flow bestScore equals BFS on levels 1-2 and on 10 small random graphs', () => {
  for (const n of [1, 2]) assert.equal(g.bestScore(g.makeLevel(n)), bfs(g, g.makeLevel(n), { limit: 3e6 }).depth);
  const r = rng(7);
  const ri = (a, b) => a + Math.floor(r() * (b - a + 1));
  let checked = 0;
  while (checked < 10) {
    const edges = [[0, 1, ri(1, 3)], [0, 2, ri(1, 3)], [1, 3, ri(1, 2)], [2, 3, ri(1, 2)], [1, 2, ri(1, 2)], [2, 4, ri(1, 3)], [3, 4, ri(1, 3)]];
    const level = { nodes: 5, edges, demands: [[3, ri(1, 2)], [4, ri(1, 2)]] };
    const best = g.bestScore(level), b = bfs(g, level);
    assert.equal(best, b ? b.depth : null);
    if (best !== null) checked++;
  }
});
