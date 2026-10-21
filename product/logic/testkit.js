// Shared contract tests. Each game test file calls contractTests(game, levels, opts).
// A level is proven solvable by replaying level.solution (hand or scratch verified),
// or opts.solve(level) (returns a move list), or, when there is neither, by BFS. bestScore must equal the solution length / BFS depth
// when opts.exact is true (default), otherwise it must be >= that length.
import test from 'node:test';
import assert from 'node:assert/strict';
import { bfs, clone } from './solve.js';
import { stars } from './rating.js';
import { newHistory, play, undo, reset } from './history.js';

export function contractTests(game, levels = 3, opts = {}) {
  const { exact = true, bfsKey, bfsLimit } = opts;
  test(`${game.meta.id}: meta and exports`, () => {
    for (const f of ['makeLevel', 'initialState', 'legalMoves', 'applyMove', 'isSolved', 'bestScore', 'score', 'maxTries'])
      assert.equal(typeof game[f], 'function', f);
    assert.ok(['space', 'quantity', 'direction', 'sequence'].includes(game.meta.cls));
    assert.equal(typeof game.meta.title, 'string');
  });
  test(`${game.meta.id}: levels are deterministic and plain JSON`, () => {
    for (let n = 1; n <= levels; n++) {
      assert.deepEqual(game.makeLevel(n), game.makeLevel(n));
      const s = game.initialState(game.makeLevel(n));
      assert.deepEqual(clone(s), s);
      assert.equal(game.isSolved(s), false);
      assert.equal(game.score(s), 0);
    }
  });
  test(`${game.meta.id}: applyMove never mutates, illegal move gives null`, () => {
    for (let n = 1; n <= levels; n++) {
      const s = game.initialState(game.makeLevel(n));
      const before = clone(s);
      for (const m of game.legalMoves(s).slice(0, 200)) {
        const t = game.applyMove(s, m);
        assert.ok(t, 'legal move must apply');
        assert.deepEqual(s, before);
        assert.notEqual(t, s);
      }
      assert.equal(game.applyMove(s, { bad: 'move' }), null);
    }
  });
  test(`${game.meta.id}: every level is solvable and bestScore is right`, () => {
    for (let n = 1; n <= levels; n++) {
      const level = game.makeLevel(n);
      let depth;
      const solution = level.solution || (opts.solve && opts.solve(level));
      if (solution) {
        let s = game.initialState(level);
        for (const m of solution) {
          s = game.applyMove(s, m);
          assert.ok(s, `level ${n}: solution move illegal`);
        }
        assert.ok(game.isSolved(s), `level ${n}: solution does not solve`);
        depth = solution.length;
        assert.equal(game.score(s), depth);
        if (opts.bfsCheck) {
          const r = bfs(game, level, { key: bfsKey, limit: bfsLimit });
          assert.ok(r, `level ${n}: bfs found nothing`);
          assert.ok(r.depth <= depth);
          depth = r.depth;
        }
      } else {
        const r = bfs(game, level, { key: bfsKey, limit: bfsLimit });
        assert.ok(r, `level ${n}: not solvable by bfs`);
        depth = r.depth;
      }
      const best = game.bestScore(level);
      if (best !== null) exact ? assert.equal(best, depth, `level ${n}`) : assert.ok(best >= depth);
    }
  });
  test(`${game.meta.id}: maxTries, rating and history`, () => {
    const lv = game.makeLevel(1);
    assert.ok(game.maxTries(lv) === Infinity || Number.isInteger(game.maxTries(lv)));
    assert.equal(stars(3, 3, true), 3);
    assert.equal(stars(4, 3, false), 0);
    const m = game.legalMoves(game.initialState(lv))[0];
    let h = newHistory(game.initialState(lv));
    h = play(h, game, m);
    assert.equal(h.past.length, 1);
    const max = game.maxTries(lv);
    assert.equal(undo(h, max).past.length, max === Infinity ? 0 : 1);
    assert.equal(reset(h, max).tries, max === Infinity ? 2 : 1);
  });
}
