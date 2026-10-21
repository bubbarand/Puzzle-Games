import test from 'node:test';
import assert from 'node:assert/strict';
import * as g from '../bag-draw.js';
import { contractTests } from '../testkit.js';

const key = (s) => JSON.stringify([[...s.bag].sort(), s.draws, s.solved]);
contractTests(g, 5, { bfsKey: key });

test('bag-draw: same bag and same draw number give the same draw (luck repeats)', () => {
  const run = () => {
    let s = g.initialState(g.makeLevel(2));
    for (const i of [0, 1, 2, 3, 4, 5]) s = g.applyMove(s, { t: 'add', i });
    return g.applyMove(s, { t: 'draw' }).drawn;
  };
  assert.deepEqual(run(), run());
});

test('bag-draw: bag size limit and 3 draws limit', () => {
  let s = g.initialState(g.makeLevel(1));
  for (let i = 0; i < 6; i++) s = g.applyMove(s, { t: 'add', i });
  assert.equal(g.applyMove(s, { t: 'add', i: 6 }), null);
  assert.equal(g.maxTries(g.makeLevel(1)), 3);
  let bad = g.initialState({ tiles: [-1, -1], cap: 2, n: 2, target: 5, seed: 1 });
  for (const i of [0, 1]) bad = g.applyMove(bad, { t: 'add', i });
  for (let k = 0; k < 3; k++) bad = g.applyMove(bad, { t: 'draw' });
  assert.equal(g.applyMove(bad, { t: 'draw' }), null);
  assert.equal(g.isSolved(bad), false);
});

test('bag-draw: n rises 4 to 8, cap = n + 2, min moves 5 to 9', () => {
  const lv = [1, 2, 3, 4, 5].map((n) => g.makeLevel(n));
  assert.deepEqual(lv.map((l) => l.n), [4, 5, 6, 7, 8]);
  assert.ok(lv.every((l) => l.cap === l.n + 2));
  assert.deepEqual(lv.map((l) => g.bestScore(l)), [5, 6, 7, 8, 9]);
});
