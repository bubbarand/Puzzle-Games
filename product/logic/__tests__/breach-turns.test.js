import test from 'node:test';
import assert from 'node:assert/strict';
import * as g from '../breach-turns.js';
import { contractTests } from '../testkit.js';

// Search space is large, so levels are proven by their stored solutions (found by exhaustive search of punch plans).
contractTests(g, 5);

const base = { size: 6, buildings: [[0, 0]], units: [[5, 5]], enemies: [], turns: 1, keep: 1 };

test('breach-turns: doing nothing loses a building on every level', () => {
  for (let n = 1; n <= 5; n++) {
    let s = g.initialState(g.makeLevel(n));
    while (g.legalMoves(s).length) s = g.applyMove(s, { t: 'end' });
    assert.equal(g.isSolved(s), false, `level ${n}`);
  }
});

test('breach-turns: pushing an enemy into another kills both', () => {
  const s = g.initialState({ ...base, units: [[2, 0]], enemies: [[2, 2, 0], [2, 3, 0]] });
  const t = g.applyMove(s, { t: 'act', u: 0, to: [2, 1], punch: 1 });
  assert.deepEqual(t.enemies, []);
});

test('breach-turns: a push moves the enemy 1 cell, so its attack changes', () => {
  const s = g.initialState({ ...base, units: [[1, 2]], enemies: [[1, 1, 0]], buildings: [[0, 1]], keep: 1 });
  const t = g.applyMove(s, { t: 'act', u: 0, to: [1, 2], punch: 3 });
  assert.equal(g.applyMove(s, { t: 'end' }).buildings.length, 0);
  assert.deepEqual(t.enemies[0].slice(0, 2), [1, 0]);
  assert.equal(g.isSolved(g.applyMove(t, { t: 'end' })), true);
});

test('breach-turns: each unit acts once per turn; far or occupied cells are illegal', () => {
  const s = g.initialState({ ...base, buildings: [[0, 0], [3, 3]], units: [[2, 0], [4, 4]], enemies: [] });
  const t = g.applyMove(s, { t: 'act', u: 0, to: [2, 1], punch: -1 });
  assert.equal(g.applyMove(t, { t: 'act', u: 0, to: [2, 2], punch: -1 }), null);
  assert.equal(g.applyMove(s, { t: 'act', u: 0, to: [5, 5], punch: -1 }), null);
  assert.equal(g.applyMove(s, { t: 'act', u: 0, to: [3, 3], punch: -1 }), null);
});
