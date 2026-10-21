// Shape and word-limit checks for every tutorial step file (spec 005, section 2 item 1).
import test from 'node:test';
import assert from 'node:assert/strict';
import { tutorials } from '../index.js';
import { defaultSteps } from '../../tutorial.js';

const words = (s) => s.trim().split(/\s+/).length;
const all = { ...tutorials, default: defaultSteps };

for (const [id, steps] of Object.entries(all)) {
  test(`${id}: steps are well formed`, () => {
    assert.ok(steps.length >= 3 && steps.length <= 6, 'needs 3 to 6 steps');
    assert.ok(steps.at(-1).done, 'last step must end by solving');
    for (const s of steps) {
      assert.ok(s.ch && s.title && s.body, 'ch, title, body needed');
      assert.ok(words(s.title) <= 4, `title too long: ${s.title}`);
      assert.ok(words(s.body) <= 12, `body too long (${words(s.body)}): ${s.body}`);
      assert.ok(s.lesson ? !s.done : typeof s.done === 'function', `step "${s.title}" needs done() or lesson`);
      assert.ok(!s.target || typeof s.target === 'function');
    }
  });
}
