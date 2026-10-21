import test from 'node:test';
import assert from 'node:assert/strict';
import * as g from '../sokoban.js';
import { contractTests } from '../testkit.js';

const key = (s) => JSON.stringify([s.player, [...s.crates].sort()]);
contractTests(g, 5, { bfsKey: key, solve: (level) => g.solve(level) });

test('sokoban: push moves the crate, walls and double crates block', () => {
  const s = g.initialState({ rows: ['#####', '#@$.#', '#####'] });
  const t = g.applyMove(s, { d: 1 });
  assert.deepEqual(t.crates, [[1, 3]]);
  assert.equal(g.isSolved(t), true);
  assert.equal(g.applyMove(t, { d: 1 }), null);
  assert.equal(g.applyMove(s, { d: 0 }), null);
});

test('sokoban: there is no pull (stepping back leaves the crate)', () => {
  const s = g.initialState({ rows: ['#####', '#@$ #', '#####'] });
  const t = g.applyMove(g.applyMove(s, { d: 1 }), { d: 3 });
  assert.deepEqual(t.crates, [[1, 3]]);
});

test('sokoban: levels get harder (min moves rise)', () => {
  const best = [1, 2, 3, 4, 5].map((n) => g.bestScore(g.makeLevel(n)));
  assert.deepEqual(best, [23, 41, 47, 67, 87]);
});
