import test from 'node:test';
import assert from 'node:assert/strict';
import * as g from '../lights-out.js';
import { solutions } from '../lights-out.js';
import { contractTests } from '../testkit.js';

const solve = (level) => solutions(level.grid).sort((a, b) => a.length - b.length)[0].map((cell) => ({ cell }));
contractTests(g, 5, { solve });

test('lights-out: pressing flips a cell and its neighbors; corner flips 3', () => {
  const s = g.initialState({ grid: Array(25).fill(0) });
  assert.equal(g.applyMove(s, { cell: 12 }).grid.filter(Boolean).length, 5);
  assert.equal(g.applyMove(s, { cell: 0 }).grid.filter(Boolean).length, 3);
  assert.equal(g.applyMove(s, { cell: 25 }), null);
});

test('lights-out: levels 1-12 are solvable, replaying the best presses turns all lights off', () => {
  for (let n = 1; n <= 12; n++) {
    const level = g.makeLevel(n);
    assert.deepEqual(g.makeLevel(n), level);
    let s = g.initialState(level);
    assert.equal(g.isSolved(s), false);
    const best = solutions(level.grid).sort((a, b) => a.length - b.length)[0];
    assert.equal(best.length, g.bestScore(level));
    for (const cell of best) s = g.applyMove(s, { cell });
    assert.ok(g.isSolved(s), `level ${n}`);
    assert.equal(g.score(s), g.bestScore(level));
  }
});

test('lights-out: later levels need at least as many presses on average', () => {
  const avg = (a, b) => { let t = 0; for (let n = a; n <= b; n++) t += g.bestScore(g.makeLevel(n)); return t / (b - a + 1); };
  assert.ok(avg(1, 3) <= avg(8, 12));
});

test('lights-out: best solution needs 8+ presses at level 1, rising to 14+ at level 5', () => {
  const d = [1, 2, 3, 4, 5].map((n) => g.bestScore(g.makeLevel(n)));
  assert.ok(d[0] >= 8 && d[4] >= 14, String(d));
  assert.ok(d.every((x, i) => i === 0 || x >= d[i - 1]), String(d));
});
