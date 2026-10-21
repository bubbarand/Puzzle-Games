import test from 'node:test';
import assert from 'node:assert/strict';
import * as g from '../hanoi.js';
import { contractTests } from '../testkit.js';

contractTests(g, 5);

test('hanoi: known minimums (3 pegs is 2^n - 1)', () => {
  assert.equal(g.bestScore(g.makeLevel(1)), 15);
  assert.equal(g.bestScore(g.makeLevel(2)), 31);
  assert.equal(g.bestScore(g.makeLevel(4)), 63);
  assert.equal(g.bestScore(g.makeLevel(5)), 127);
});

test('hanoi: a bigger disc never goes on a smaller one', () => {
  let s = g.initialState(g.makeLevel(1));
  s = g.applyMove(s, { from: 0, to: 1 });
  assert.equal(g.applyMove(s, { from: 0, to: 1 }), null);
  assert.equal(g.applyMove(s, { from: 2, to: 0 }), null);
});
