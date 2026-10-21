import test from 'node:test';
import assert from 'node:assert/strict';
import { stars } from '../rating.js';
import { newHistory, play, undo, reset } from '../history.js';

const counter = { applyMove: (s, m) => (m === 'bad' ? null : { n: s.n + m }) };

test('stars: 0 unsolved, 3 at best, 2 within 20 percent, 1 otherwise', () => {
  assert.equal(stars(5, 5, false), 0);
  assert.equal(stars(5, 5, true), 3);
  assert.equal(stars(6, 5, true), 2);
  assert.equal(stars(7, 5, true), 1);
  assert.equal(stars(9, null, true), 1);
});

test('history: play, undo, reset count tries, never mutate', () => {
  let h = newHistory({ n: 0 });
  h = play(h, counter, 2);
  h = play(h, counter, 3);
  assert.equal(h.present.n, 5);
  assert.equal(play(h, counter, 'bad'), h);
  h = undo(h);
  assert.equal(h.present.n, 2);
  assert.equal(undo(newHistory({ n: 0 })).past.length, 0);
  h = reset(h);
  assert.deepEqual([h.present.n, h.past.length, h.tries], [0, 0, 2]);
});

test('history: undo and reset are disabled when maxTries is finite', () => {
  let h = play(newHistory({ n: 0 }), counter, 1);
  assert.equal(undo(h, 3), h);
  assert.equal(reset(h, 3), h);
});
