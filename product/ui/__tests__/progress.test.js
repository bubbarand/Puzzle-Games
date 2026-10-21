import test from 'node:test';
import assert from 'node:assert/strict';
import { initState, reconcile, onSolved, rowState } from '../progress.js';

const ORDER = Array.from({ length: 20 }, (_, i) => 't' + (i + 1));
const D1 = '2026-10-20', D2 = '2026-10-21', D3 = '2026-10-22';
const day = (n) => new Date(Date.UTC(2026, 9, 20 + n)).toISOString().slice(0, 10);
const open = (s, d) => reconcile(s, d);
const solveAll = (s, d) => s.owned.filter((id) => !(s.availableFrom[id] > d)).reduce((a, id) => onSolved(a, id, d), s);

test('first open: 4 owned, 16 queued, rows available/locked', () => {
  const s = open(initState(ORDER), D1);
  assert.deepEqual(s.owned, ['t1', 't2', 't3', 't4']);
  assert.equal(s.queue.length, 16);
  assert.equal(s.lastDay, D1);
  assert.equal(rowState(s, 't1', D1, ORDER), 'available');
  assert.equal(rowState(s, 't5', D1, ORDER), 'locked');
});

test('solve all 4 earns type 5, playable next day only', () => {
  let s = open(initState(ORDER), D1);
  s = onSolved(s, 't1', D1); s = onSolved(s, 't2', D1); s = onSolved(s, 't3', D1);
  assert.equal(s.owned.length, 4);
  s = onSolved(s, 't4', D1);
  assert.deepEqual(s.owned, ['t1', 't2', 't3', 't4', 't5']);
  assert.equal(s.streak, 1);
  assert.equal(rowState(s, 't5', D1, ORDER), 'locked');
  assert.equal(rowState(s, 't1', D1, ORDER), 'done');
  s = open(s, D2);
  assert.equal(rowState(s, 't5', D2, ORDER), 'available');
  assert.equal(rowState(s, 't1', D2, ORDER), 'available');
});

test('re-solving does not earn twice on the same day', () => {
  let s = solveAll(open(initState(ORDER), D1), D1);
  s = onSolved(s, 't1', D1);
  assert.equal(s.owned.length, 5); assert.equal(s.streak, 1);
});

test('miss without freeze removes the newest type, to front of queue, streak 0', () => {
  let s = solveAll(open(initState(ORDER), D1), D1);
  s = open(s, D2); s = solveAll(s, D2); // owned 6, streak 2
  assert.equal(s.streak, 2);
  s = open(s, day(3)); // missed D3 and D4... lastDay D2 earned; missed day(2) only
  assert.deepEqual(s.owned, ['t1', 't2', 't3', 't4', 't5']);
  assert.equal(s.queue[0], 't6');
  assert.equal(s.streak, 0);
});

test('7 earning days gives a freeze and resets the streak', () => {
  let s = initState(ORDER);
  for (let i = 0; i < 7; i++) { s = open(s, day(i)); s = solveAll(s, day(i)); }
  assert.equal(s.freezes, 1); assert.equal(s.streak, 0); assert.equal(s.owned.length, 11);
});

test('a freeze absorbs a miss: nothing removed, streak kept, frozen row yesterday', () => {
  let s = initState(ORDER);
  for (let i = 0; i < 8; i++) { s = open(s, day(i)); s = solveAll(s, day(i)); } // freeze at day 6, streak 1 at day 7
  assert.equal(s.freezes, 1); assert.equal(s.streak, 1);
  const owned = s.owned.length;
  s = open(s, day(9)); // missed day 8
  assert.equal(s.freezes, 0); assert.equal(s.streak, 1); assert.equal(s.owned.length, owned);
  assert.equal(s.frozenDay, day(8));
  assert.equal(rowState(s, 't1', day(9), ORDER), 'frozen');
  assert.equal(rowState(s, 't1', day(10), ORDER), 'available'); // frozenDay no longer yesterday
});

test('two opens in one day change nothing', () => {
  const a = open(initState(ORDER), D1);
  assert.deepEqual(open(a, D1), a);
  const b = open(solveAll(a, D1), D2);
  assert.deepEqual(open(b, D2), b);
  const c = open(a, day(3)); // after a miss
  assert.deepEqual(open(c, day(3)), c);
});

test('removed type is re-earned first', () => {
  let s = solveAll(open(initState(ORDER), D1), D1); // owns t5
  s = open(s, D3);                                  // missed D2: t5 removed
  assert.deepEqual(s.owned, ['t1', 't2', 't3', 't4']);
  assert.equal(s.queue[0], 't5');
  s = solveAll(s, D3);
  assert.equal(s.owned[4], 't5');
});

test('never fewer than 4 owned', () => {
  let s = open(initState(ORDER), D1);
  s = open(s, day(30));
  assert.equal(s.owned.length, 4); assert.equal(s.streak, 0);
});

test('multiple missed days remove one type each', () => {
  let s = initState(ORDER);
  for (let i = 0; i < 3; i++) { s = open(s, day(i)); s = solveAll(s, day(i)); } // owned 7
  s = open(s, day(5)); // missed day 3 and 4
  assert.equal(s.owned.length, 5);
});

test('pure: inputs are not mutated', () => {
  const a = open(initState(ORDER), D1);
  const snap = JSON.stringify(a);
  solveAll(a, D1); open(a, day(5));
  assert.equal(JSON.stringify(a), snap);
});
