import test from 'node:test';
import assert from 'node:assert/strict';
import * as g from '../balance-scale.js';
import { contractTests } from '../testkit.js';

contractTests(g, 5);

test('balance-scale: every shown equality is true for the hidden weights', () => {
  for (let n = 1; n <= 5; n++) assert.ok(g.equalitiesHold(g.makeLevel(n)));
});

test('balance-scale: cannot use more shapes than the stock', () => {
  let s = g.initialState(g.makeLevel(1));
  for (let i = 0; i < 4; i++) s = g.applyMove(s, { shape: 0, d: 1 });
  assert.equal(g.applyMove(s, { shape: 0, d: 1 }), null);
  assert.equal(g.applyMove(g.initialState(g.makeLevel(1)), { shape: 0, d: -1 }), null);
});
