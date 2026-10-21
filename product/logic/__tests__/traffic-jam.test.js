import test from 'node:test';
import assert from 'node:assert/strict';
import * as g from '../traffic-jam.js';
import { contractTests } from '../testkit.js';
import { bfs } from '../solve.js';

contractTests(g, 5, { solve: (level) => g.solve(level) });

test('traffic-jam: cars cannot overlap or leave the board', () => {
  const s = g.initialState(g.makeLevel(1));
  assert.equal(g.applyMove(s, { car: 0, d: -1 }), null);
  assert.equal(g.applyMove(s, { car: 0, d: 1 }), null);
});

test('traffic-jam: levels get harder, from 8+ moves at level 1 to 25+ at level 5 (checked by the generic BFS)', () => {
  const d = [1, 2, 3, 4, 5].map((n) => g.bestScore(g.makeLevel(n)));
  assert.ok(d[0] >= 8 && d[4] >= 25, String(d));
  assert.ok(d.every((x, i) => i === 0 || x > d[i - 1]), String(d));
  assert.equal(bfs(g, g.makeLevel(1)).depth, d[0]);
  assert.equal(bfs(g, g.makeLevel(3), { limit: 2000000 }).depth, d[2]);
});
