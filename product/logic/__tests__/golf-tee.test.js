import test from 'node:test';
import assert from 'node:assert/strict';
import * as g from '../golf-tee.js';
import { contractTests } from '../testkit.js';

contractTests(g, 5, { solve: (level) => g.solve(level) });

test('golf-tee: a jump removes the jumped peg and fills the target hole', () => {
  const s = g.initialState({ dirs: [[0, 1], [0, -1], [1, 0], [-1, 0]], board: [[1, 1, 2, 1, 2]] });
  const t = g.applyMove(s, { from: [0, 0], dir: [0, 1] });
  assert.deepEqual(t.board[0], [2, 2, 1, 1, 2]);
  assert.equal(g.applyMove(s, { from: [0, 1], dir: [0, 1] }), null);
});

test('golf-tee: jumps needed rise from 10 to 31 (pegs - 1)', () => {
  assert.deepEqual([1, 2, 3, 4, 5].map((n) => g.bestScore(g.makeLevel(n))), [10, 18, 19, 22, 31]);
});
