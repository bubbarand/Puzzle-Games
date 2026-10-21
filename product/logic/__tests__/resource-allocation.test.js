import test from 'node:test';
import assert from 'node:assert/strict';
import * as g from '../resource-allocation.js';
import { contractTests } from '../testkit.js';

contractTests(g, 5);

test('resource-allocation: cannot place more than 10 coins', () => {
  let s = g.initialState(g.makeLevel(1));
  s = g.applyMove(s, { opt: 0, n: 6 });
  assert.equal(g.applyMove(s, { opt: 1, n: 5 }), null);
  assert.ok(g.applyMove(s, { opt: 1, n: 4 }));
});

test('resource-allocation: all-safe fails the target; level needs a mix', () => {
  const s = g.applyMove(g.initialState(g.makeLevel(1)), { opt: 0, n: 10 });
  assert.equal(g.isSolved(s), false);
  assert.ok(g.bestScore(g.makeLevel(1)) >= 2);
});

test('resource-allocation: 4 to 6 options, min moves 3,4,4,5,6', () => {
  const lv = [1, 2, 3, 4, 5].map((n) => g.makeLevel(n));
  assert.deepEqual(lv.map((l) => l.ret.length), [4, 4, 5, 5, 6]);
  assert.deepEqual(lv.map((l) => g.bestScore(l)), [3, 4, 4, 5, 6]);
});
