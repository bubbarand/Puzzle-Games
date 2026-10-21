import test from 'node:test';
import assert from 'node:assert/strict';
import * as g from '../tower-fall.js';
import { contractTests } from '../testkit.js';

contractTests(g, 5);

test('tower-fall: running with no towers leaks every enemy', () => {
  const lv = g.makeLevel(2);
  assert.equal(g.applyMove(g.initialState(lv), { t: 'run' }).leaks, lv.waves.length);
});

test('tower-fall: tower limit, and each level needs every tower it allows', () => {
  for (let n = 1; n <= 5; n++) {
    const lv = g.makeLevel(n);
    assert.equal(g.bestScore(lv), lv.maxTowers + 1, `level ${n}`);
  }
  let s = g.initialState(g.makeLevel(1));
  s = g.applyMove(s, { t: 'place', p: 1 });
  s = g.applyMove(s, { t: 'place', p: 2 });
  assert.equal(g.applyMove(s, { t: 'place', p: 5 }), null);
});

test('tower-fall: the run is deterministic and a change clears the old result', () => {
  let s = g.initialState(g.makeLevel(1));
  s = g.applyMove(s, { t: 'place', p: 5 });
  const a = g.applyMove(s, { t: 'run' }), b = g.applyMove(s, { t: 'run' });
  assert.deepEqual(a, b);
  assert.equal(g.applyMove(a, { t: 'remove', p: 5 }).leaks, null);
});
