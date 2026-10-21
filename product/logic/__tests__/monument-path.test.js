import test from 'node:test';
import assert from 'node:assert/strict';
import * as g from '../monument-path.js';
import { contractTests } from '../testkit.js';
import { bfs } from '../solve.js';

contractTests(g, 5);

test('monument-path: every level needs at least one turn of the view', () => {
  for (let n = 1; n <= 5; n++) {
    const path = bfs(g, g.makeLevel(n)).path;
    assert.ok(path.some((m) => m.t === 'rot'), `level ${n}`);
  }
});

test('monument-path: four turns come back to the same view; a broken path cannot be walked', () => {
  let s = g.initialState(g.makeLevel(1));
  for (let i = 0; i < 4; i++) s = g.applyMove(s, { t: 'rot', d: 1 });
  assert.equal(s.view, 0);
  assert.equal(g.applyMove(s, { t: 'walk', to: 2 }), null);
});
