import test from 'node:test';
import assert from 'node:assert/strict';
import * as g from '../domino-logic.js';
import { contractTests } from '../testkit.js';

contractTests(g, 6);

test('domino-logic: the rest of the chain follows the rule in all three rule types', () => {
  for (let n = 1; n <= 12; n++) {
    const lv = g.makeLevel(n);
    const s = g.initialState(lv);
    lv.dominoes.slice(0, -1).forEach(([a, b], i) => {
      const [sum, diff, seq] = [a + b === lv.p, b - a === lv.p, a + b === lv.start + i * lv.p];
      assert.ok([sum, diff, seq][lv.rule], `level ${n} domino ${i}`);
    });
    assert.ok(g.isSolved(g.applyMove(s, lv.solution[0])));
  }
});

test('domino-logic: a wrong half is not solved and the half can be set only once', () => {
  const s = g.initialState(g.makeLevel(1));
  const wrong = g.applyMove(s, { v: (g.makeLevel(1).solution[0].v + 1) % 7 });
  assert.equal(g.isSolved(wrong), false);
  assert.equal(g.applyMove(wrong, { v: 0 }), null);
});
