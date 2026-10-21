// Plays the shape-sudoku tutorial with real mouse input. Usage: node tools/tut/shape-sudoku.mjs [dark] [reduced] [outdir]
import { launch, sleep } from './lib.mjs';
import { makeLevel } from '../../product/logic/shape-sudoku.js';
const [, , a1, a2, out = '/tmp'] = process.argv;
const t = await launch({ dark: a1 === 'dark', reduced: a2 === 'reduced' });
const fail = (m) => { console.log('FAIL', m, t.logs); process.exitCode = 1; };
await t.open('shape-sudoku');
await t.waitTitle(/Fill the grid/);
await t.shot(`${out}/ss-1.png`);
await t.tapSel('.tut-btn.go'); await t.waitTitle(/Place a shape/);
const place = async ({ r, c, v }) => { // select the shape (never toggle it off), then tap the tile
  if (await t.ev(`document.querySelector('.s-tr.on')?.dataset.v`) !== String(v)) await t.tapSel(`.s-tr[data-v="${v}"]`);
  await t.tapSel(`.s-c[data-r="${r}"][data-c="${c}"]`); await sleep(150);
};
const sol = makeLevel(1).solution;
await place(sol[0]); await t.waitTitle(/No repeats/);
await t.tapSel('.tut-btn.go'); await t.waitTitle(/Take it back/);
await t.tapSel('[data-a=undo]'); await t.waitTitle(/Your turn/);
await sleep(800); await t.shot(`${out}/ss-5.png`);
for (const m of sol) await place(m);
await t.waitTitle(/complete/, 6000);
await t.shot(`${out}/ss-done.png`);
if (await t.ev(`localStorage.getItem('puzzle-app-v1')`)) fail('progress changed');
await t.tapSel('.tut-btn.go'); await sleep(500);
if (await t.coach()) fail('coach still open');
if (await t.ev(`localStorage.getItem('puzzle-app-tutorial-v1')`) !== '{"shape-sudoku":true}') fail('seen flag');
if (t.logs.length) fail('console errors');
console.log(process.exitCode ? 'RESULT FAIL' : 'RESULT PASS shape-sudoku');
await t.close();
