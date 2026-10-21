// Plays the knapsack tutorial with real mouse input. Usage: node tools/tut/knapsack.mjs [dark] [reduced] [outdir]
import { launch, sleep } from './lib.mjs';
import { makeLevel } from '../../product/logic/knapsack.js';
const [, , a1, a2, out = '/tmp'] = process.argv;
const t = await launch({ dark: a1 === 'dark', reduced: a2 === 'reduced' });
const fail = (m) => { console.log('FAIL', m, t.logs); process.exitCode = 1; };
await t.open('knapsack');
await t.waitTitle(/Reach the value goal/);
await t.shot(`${out}/ks-1.png`);
await t.tapSel('.tut-btn.go'); await t.waitTitle(/Pack an item/);
const sz = await t.rect('.k-item[data-i="0"]'); if (sz.w < 44 || sz.h < 44) console.log('NOTE tray item size', sz.w, sz.h);
await t.tapSel('.k-item[data-i="0"]'); await t.waitTitle(/Mind the weight/);
await t.tapSel('.tut-btn.go'); await t.waitTitle(/Take it back/);
await t.tapSel('[data-a=undo]'); await t.waitTitle(/Your turn/);
await sleep(800); await t.shot(`${out}/ks-5.png`);
const { items, cap, target } = makeLevel(1);
let pick = null; // fewest items with value >= target within the weight cap
for (let m = 0; m < 1 << items.length; m++) {
  let w = 0, v = 0, k = 0;
  items.forEach(([iw, iv], i) => { if (m >> i & 1) { w += iw; v += iv; k++; } });
  if (w <= cap && v >= target && (!pick || k < pick.k)) pick = { m, k };
}
for (let i = 0; i < items.length; i++) if (pick.m >> i & 1) { await t.tapSel(`.k-item[data-i="${i}"]`); await sleep(450); }
await t.waitTitle(/complete/, 6000);
await t.shot(`${out}/ks-done.png`);
const prog = await t.ev(`localStorage.getItem('puzzle-app-v1')`);
if (prog) fail('progress changed: ' + prog);
await t.tapSel('.tut-btn.go'); await sleep(500);
if (await t.coach()) fail('coach still open');
if (!(await t.ev(`!!document.querySelector('.stage .k-item')`))) fail('game gone');
if (await t.ev(`localStorage.getItem('puzzle-app-tutorial-v1')`) !== '{"knapsack":true}') fail('seen flag');
if (t.logs.length) fail('console errors');
console.log(process.exitCode ? 'RESULT FAIL' : 'RESULT PASS knapsack');
await t.close();
