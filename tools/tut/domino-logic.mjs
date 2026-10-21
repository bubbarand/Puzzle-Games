// Plays the domino-logic tutorial with real mouse input. Usage: node tools/tut/domino-logic.mjs [dark] [reduced] [outdir]
import { launch, sleep } from './lib.mjs';
import { makeLevel } from '../../product/logic/domino-logic.js';
const [, , a1, a2, out = '/tmp'] = process.argv;
const t = await launch({ dark: a1 === 'dark', reduced: a2 === 'reduced' });
const fail = (m) => { console.log('FAIL', m, t.logs); process.exitCode = 1; };
await t.open('domino-logic');
await t.waitTitle(/Finish the chain/);
await t.shot(`${out}/dl-1.png`);
await t.tapSel('.tut-btn.go'); await t.waitTitle(/Find the rule/);
await t.tapSel('.tut-btn.go'); await t.waitTitle(/Pick the dots/);
await sleep(1800); // the keys pop in
const ans = makeLevel(1).solution[0].v, wrong = ans === 0 ? 1 : 0;
await t.tapSel(`.dl-k[data-v="${wrong}"]`); await sleep(250);
await t.shot(`${out}/dl-wrong.png`);
await sleep(1000);
if (await t.ev(`document.querySelectorAll('.dl-tried').length`) !== 1) fail('wrong guess not greyed');
await t.shot(`${out}/dl-5.png`);
await t.tapSel(`.dl-k[data-v="${ans}"]`);
await t.waitTitle(/complete/, 6000);
await t.shot(`${out}/dl-done.png`);
if (await t.ev(`localStorage.getItem('puzzle-app-v1')`)) fail('progress changed');
await t.tapSel('.tut-btn.go'); await sleep(500);
if (await t.coach()) fail('coach still open');
if (await t.ev(`localStorage.getItem('puzzle-app-tutorial-v1')`) !== '{"domino-logic":true}') fail('seen flag');
if (t.logs.length) fail('console errors');
console.log(process.exitCode ? 'RESULT FAIL' : 'RESULT PASS domino-logic');
await t.close();
