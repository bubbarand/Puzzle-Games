import test from 'node:test';
import assert from 'node:assert/strict';
import * as g from '../matrix-reasoning.js';
import { contractTests } from '../testkit.js';

contractTests(g, 6);

test('matrix-reasoning: 6 distinct options, exactly one is right', () => {
  for (let n = 1; n <= 8; n++) {
    const lv = g.makeLevel(n);
    assert.equal(new Set(lv.options.map(String)).size, 6);
    const s = g.initialState(lv);
    const wins = lv.options.filter((_, pick) => g.isSolved(g.applyMove(s, { pick })));
    assert.equal(wins.length, 1);
  }
});

test('matrix-reasoning: a wrong pick keeps the puzzle open and counts a move', () => {
  const lv = g.makeLevel(1);
  const s = g.applyMove(g.initialState(lv), { pick: (lv.solution[0].pick + 1) % 6 });
  assert.equal(g.isSolved(s), false);
  assert.equal(s.moves, 1);
});
