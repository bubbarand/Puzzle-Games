import test from 'node:test';
import assert from 'node:assert/strict';
import * as g from '../lemmings-tools.js';
import { contractTests } from '../testkit.js';

contractTests(g, 5);

const play = (n, moves) => moves.reduce((s, m) => g.applyMove(s, m), g.initialState(g.makeLevel(n)));

test('lemmings-tools: running with no tools on a pit level saves nobody', () => {
  assert.equal(play(1, [{ t: 'run' }]).saved, 0);
});

test('lemmings-tools: the stored tool sets solve their levels and one tool fewer does not', () => {
  const sets = [
    [[5, 0], [6, 2]],
    [[2, 0], [3, 1], [5, 0]],
    [[5, 1], [7, 0], [9, 0], [10, 2]],
    [[3, 0], [4, 0], [6, 1], [8, 0], [9, 2]],
    [[3, 0], [4, 1], [7, 0], [10, 0], [12, 1], [15, 2]],
  ];
  sets.forEach((set, i) => {
    const place = ([cell, tool]) => ({ t: 'place', cell, tool });
    assert.equal(g.isSolved(play(i + 1, [...set.map(place), { t: 'run' }])), true, `level ${i + 1}`);
    assert.equal(g.isSolved(play(i + 1, [...set.slice(1).map(place), { t: 'run' }])), false, `level ${i + 1} short`);
    assert.equal(g.bestScore(g.makeLevel(i + 1)), set.length + 1, `level ${i + 1} best`);
  });
});

test('lemmings-tools: a blocker holds the first creature and turns it into a wall', () => {
  const lv = { cells: [3, 0, 0, 0, 0], spawn: 2, k: 3, need: 2, avail: [0, 0, 0, 1] };
  const b = [{ t: 'place', cell: 4, tool: 3 }, { t: 'run' }].reduce((s, m) => g.applyMove(s, m), g.initialState(lv));
  assert.equal(b.saved, 2);
});

test('lemmings-tools: tools only go on matching cells and within the limit', () => {
  const s = g.initialState(g.makeLevel(1));
  assert.equal(g.applyMove(s, { t: 'place', cell: 1, tool: 0 }), null);
  assert.equal(g.applyMove(s, { t: 'place', cell: 0, tool: 2 }), null);
  const t = g.applyMove(s, { t: 'place', cell: 1, tool: 2 });
  assert.equal(g.applyMove(t, { t: 'place', cell: 3, tool: 2 }), null);
});
