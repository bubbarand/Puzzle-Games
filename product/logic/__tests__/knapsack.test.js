import test from 'node:test';
import assert from 'node:assert/strict';
import * as g from '../knapsack.js';
import { contractTests } from '../testkit.js';

contractTests(g, 5);

test('knapsack: cannot exceed the weight limit', () => {
  const s = { ...g.initialState({ items: [[3, 5], [3, 5]], cap: 4, target: 5 }) };
  const t = g.applyMove(s, { i: 0 });
  assert.equal(g.applyMove(t, { i: 1 }), null);
  assert.equal(g.isSolved(t), true);
});

test('knapsack: 8-14 items, near-tie bags, and a greedy bag that misses the target', () => {
  const counts = [1, 2, 3, 4, 5].map((n) => g.makeLevel(n).items.length);
  assert.deepEqual(counts, [8, 9, 11, 12, 14]);
  for (let n = 1; n <= 5; n++) {
    const lv = g.makeLevel(n);
    assert.ok(lv.items.every(([w]) => w <= 9), 'weights stay small so the tray fits');
    assert.ok(g.nearTies(lv) >= 3, `level ${n}`);
    if (n >= 2) assert.ok(g.greedyValue(lv) < lv.target, `level ${n}`);
  }
  const best = [1, 2, 3, 4, 5].map((n) => g.bestScore(g.makeLevel(n)));
  assert.ok(best[4] > best[0], String(best));
});
