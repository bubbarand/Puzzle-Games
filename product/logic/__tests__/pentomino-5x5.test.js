import test from 'node:test';
import assert from 'node:assert/strict';
import * as g from '../pentomino-5x5.js';
import { contractTests } from '../testkit.js';

contractTests(g, 5);

test('pentomino-5x5: pieces cannot overlap, leave the board, or be placed twice', () => {
  const s = g.initialState(g.makeLevel(1));
  const free = s.placed.findIndex((p) => p === null);
  const good = g.makeLevel(1).solution[0];
  assert.equal(good.i, free);
  assert.equal(g.applyMove(s, { t: 'place', i: free, cells: good.cells.map(([r, c]) => [r - 9, c]) }), null);
  const taken = s.placed.findIndex((p) => p !== null);
  assert.equal(g.applyMove(s, { t: 'place', i: free, cells: s.placed[taken] }), null);
  const t = g.applyMove(s, good);
  assert.equal(g.applyMove(t, good), null);
});

test('pentomino-5x5: fixed pieces cannot be removed, placed pieces can', () => {
  const s = g.initialState(g.makeLevel(1));
  const fixedIdx = s.fixed.indexOf(true);
  assert.equal(g.applyMove(s, { t: 'remove', i: fixedIdx }), null);
  const good = g.makeLevel(1).solution[0];
  const t = g.applyMove(s, good);
  assert.equal(g.applyMove(t, { t: 'remove', i: good.i }).placed[good.i], null);
});
