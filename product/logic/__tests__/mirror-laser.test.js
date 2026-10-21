import test from 'node:test';
import assert from 'node:assert/strict';
import * as g from '../mirror-laser.js';
import { contractTests } from '../testkit.js';

contractTests(g, 5, { exact: true });

// Fewest mirrors that win. The beam only meets mirrors in order, so each new mirror goes on a cell the beam reaches
// for the first time after the last mirror (complete search).
function minMirrors(level) {
  const base = g.initialState(level);
  const win = (ms) => {
    const seen = new Set(g.beam({ ...base, mirrors: ms }).map(String));
    return [level.target, ...level.checks].every((p) => seen.has(String(p)));
  };
  const dfs = (ms, last, left) => {
    if (win(ms)) return true;
    if (!left) return false;
    const path = g.beam({ ...base, mirrors: ms });
    const first = new Map();
    path.forEach((p, i) => { if (!first.has(String(p))) first.set(String(p), i); });
    for (let i = Math.max(last + 1, 1); i < path.length; i++) {
      const [r, c] = path[i];
      if (first.get(String(path[i])) !== i || [level.target, ...level.checks].some((q) => q[0] === r && q[1] === c)) continue;
      if (ms.some((q) => q[0] === r && q[1] === c)) continue;
      for (const m of [0, 1]) if (dfs([...ms, [r, c, m]], i, left - 1)) return true;
    }
    return false;
  };
  for (let k = 0; k <= level.count; k++) if (dfs([], -1, k)) return k;
  return null;
}

test('mirror-laser: 6x6 to 9x9, 1 to 5 checkpoints, mirror count is the true minimum', () => {
  const sizes = [1, 2, 3, 4, 5].map((n) => g.makeLevel(n).size);
  assert.deepEqual(sizes, [6, 7, 8, 9, 9]);
  assert.deepEqual([1, 2, 3, 4, 5].map((n) => g.makeLevel(n).checks.length), [1, 2, 3, 4, 5]);
  for (let n = 1; n <= 5; n++) {
    const lv = g.makeLevel(n);
    assert.equal(minMirrors(lv), lv.count, `level ${n}`);
    assert.equal(g.bestScore(lv), lv.count + 1);
  }
});

test('mirror-laser: a wrong submit costs a try and 5 tries is the limit', () => {
  let s = g.initialState(g.makeLevel(1));
  for (let i = 0; i < 5; i++) {
    s = g.applyMove(s, { t: 's' });
    assert.equal(g.isSolved(s), false);
    assert.equal(s.submits, i + 1);
  }
  assert.equal(g.applyMove(s, { t: 's' }), null);
  assert.deepEqual(g.legalMoves(s), []);
});

test('mirror-laser: only the allowed number of mirrors, none on the target', () => {
  let s = g.initialState(g.makeLevel(1));
  assert.equal(g.applyMove(s, { t: 'p', cell: [1, 3], m: 0 }), null);
  s = g.applyMove(g.applyMove(s, { t: 'p', cell: [0, 0], m: 1 }), { t: 'p', cell: [0, 1], m: 1 });
  assert.equal(g.applyMove(s, { t: 'p', cell: [0, 3], m: 1 }), null);
  assert.equal(g.applyMove(s, { t: 'r', cell: [0, 0] }).mirrors.length, 1);
});

test('mirror-laser: the wrong mirror direction fails, the right one wins', () => {
  const lv = g.makeLevel(1);
  const wrong = g.applyMove(g.applyMove(g.initialState(lv), { t: 'p', cell: [4, 4], m: 1 }), { t: 's' });
  assert.equal(g.isSolved(wrong), false);
});

test('mirror-laser: beam lists the laser cell, every visited cell and bounce, and stops at a wall or the edge', () => {
  const lv = { size: 5, laser: [4, 0, 1], target: [2, 2], checks: [], walls: [[3, 0]], count: 1, maxTries: 5 };
  const flat = g.beam(g.initialState(lv));
  assert.deepEqual(flat, [[4, 0], [4, 1], [4, 2], [4, 3], [4, 4]]);
  const bent = g.applyMove(g.initialState(lv), { t: 'p', cell: [4, 2], m: 0 });
  assert.deepEqual(g.beam(bent), [[4, 0], [4, 1], [4, 2], [3, 2], [2, 2], [1, 2], [0, 2]]);
  const walled = g.initialState(lv);
  walled.walls.push([4, 3]);
  assert.deepEqual(g.beam(walled), [[4, 0], [4, 1], [4, 2]]);
});
