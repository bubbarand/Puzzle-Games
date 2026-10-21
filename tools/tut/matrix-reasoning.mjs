// Plays the matrix-reasoning tutorial with real mouse input. Usage: node tools/tut/matrix-reasoning.mjs [dark] [reduced] [outdir]
import { launch, sleep } from './lib.mjs';
import { makeLevel } from '../../product/logic/matrix-reasoning.js';
const [, , a1, a2, out = '/tmp'] = process.argv;
const t = await launch({ dark: a1 === 'dark', reduced: a2 === 'reduced' });
const fail = (m) => { console.log('FAIL', m, t.logs); process.exitCode = 1; };
await t.open('matrix-reasoning');
await t.waitTitle(/Fill the gap/);
await t.shot(`${out}/mx-1.png`);
await t.tapSel('.tut-btn.go'); await t.waitTitle(/Read the pattern/);
await t.tapSel('.tut-btn.go'); await t.waitTitle(/Pick the square/);
await sleep(1800); // the tray pops in
const pick = [...Array(6).keys()].map((i) => i); const at = makeLevel(1).solution[0].pick;
const wrong = pick.find((i) => i !== at);
await t.tapSel(`.mx-o[data-i="${wrong}"]`); await sleep(250);
await t.shot(`${out}/mx-wrong.png`);
await sleep(1000);
if (await t.ev(`document.querySelectorAll('.mx-tried').length`) !== 1) fail('wrong pick not greyed');
await t.shot(`${out}/mx-5.png`);
await t.tapSel(`.mx-o[data-i="${at}"]`);
await t.waitTitle(/complete/, 6000);
await t.shot(`${out}/mx-done.png`);
if (await t.ev(`localStorage.getItem('puzzle-app-v1')`)) fail('progress changed');
await t.tapSel('.tut-btn.go'); await sleep(500);
if (await t.coach()) fail('coach still open');
if (await t.ev(`localStorage.getItem('puzzle-app-tutorial-v1')`) !== '{"matrix-reasoning":true}') fail('seen flag');
if (t.logs.length) fail('console errors');
console.log(process.exitCode ? 'RESULT FAIL' : 'RESULT PASS matrix-reasoning');
await t.close();
