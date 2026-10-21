import test from 'node:test';
import assert from 'node:assert/strict';
import * as g from '../shape-sudoku.js';
import { contractTests } from '../testkit.js';

contractTests(g, 5);

test('shape-sudoku: no repeat in a row or column, cannot overwrite', () => {
  const s = g.initialState({ size: 4, grid: [[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], solution: [] });
  assert.equal(g.applyMove(s, { r: 0, c: 1, v: 1 }), null);
  assert.equal(g.applyMove(s, { r: 2, c: 0, v: 1 }), null);
  assert.equal(g.applyMove(s, { r: 0, c: 0, v: 2 }), null);
  assert.ok(g.applyMove(s, { r: 1, c: 1, v: 1 }));
});

test('shape-sudoku: level sizes are 4 then 6, and every level has one solution', () => {
  assert.deepEqual([1, 2, 3, 4].map((n) => g.makeLevel(n).size), [4, 6, 6, 6]);
  for (let n = 1; n <= 5; n++) {
    const lv = g.makeLevel(n);
    assert.equal(lv.solution.length, [9, 16, 19, 22, 24][n - 1]);
    assert.equal(g.bestScore(lv), lv.solution.length);
  }
});

test('shape-sudoku: each level has exactly one solution', () => {
  const count = (s) => {
    const open = g.legalMoves(s);
    if (!open.length) return g.isSolved(s) ? 1 : 0;
    const first = open[0], cell = open.filter((m) => m.r === first.r && m.c === first.c);
    return cell.reduce((n, m) => n + (n > 1 ? 0 : count(g.applyMove(s, m))), 0);
  };
  for (let n = 1; n <= 5; n++) assert.equal(count(g.initialState(g.makeLevel(n))), 1, `level ${n}`);
});
