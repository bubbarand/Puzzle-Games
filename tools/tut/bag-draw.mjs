// Plays the bag-draw tutorial with real mouse input. Usage: node tools/tut/bag-draw.mjs [dark] [reduced] [outdir]
import { launch, sleep } from './lib.mjs';
import { makeLevel, initialState, applyMove, isSolved } from '../../product/logic/bag-draw.js';
const [, , a1, a2, out = '/tmp'] = process.argv;
const t = await launch({ dark: a1 === 'dark', reduced: a2 === 'reduced' });
const fail = (m) => { console.log('FAIL', m, t.logs); process.exitCode = 1; };
await t.open('bag-draw');
await t.waitTitle(/Reach the target sum/);
await t.shot(`${out}/bd-1.png`);
await t.tapSel('.tut-btn.go'); await t.waitTitle(/Put a tile in/);
await t.tapSel('.b-s[data-i="5"]'); await t.waitTitle(/Fill the ring/);
await t.tapSel('.tut-btn.go'); await t.waitTitle(/Three draws only/);
if ((await t.ev(`document.querySelectorAll('.hud .dots i').length`)) !== 3) fail('dots missing');
await t.tapSel('.tut-btn.go'); await t.waitTitle(/Your turn/);
await sleep(800); await t.shot(`${out}/bd-5.png`);
// solver (test only): the tiles to put in the bag so that one draw solves level 1, found with the game's own logic
const L = makeLevel(1);
const best = [...L.tiles.keys()].sort((a, b) => L.tiles[b] - L.tiles[a]).slice(0, L.n);
let s = initialState(L); for (const i of best) s = applyMove(s, { t: 'add', i }); s = applyMove(s, { t: 'draw' });
if (!isSolved(s)) fail('test solver does not solve');
await t.tapSel('.b-s[data-i="5"]'); await sleep(400); // take the first tile back out
for (const i of best) { await t.tapSel(`.b-s[data-i="${i}"]`); await sleep(400); }
await t.tapSel('.b-go');
await t.waitTitle(/complete/, 8000);
await t.shot(`${out}/bd-done.png`);
const prog = await t.ev(`localStorage.getItem('puzzle-app-v1')`);
if (prog) fail('progress changed: ' + prog);
await t.tapSel('.tut-btn.go'); await sleep(500);
if (await t.coach()) fail('coach still open');
if (!(await t.ev(`!!document.querySelector('.stage .b-s')`))) fail('game gone');
if (await t.ev(`localStorage.getItem('puzzle-app-tutorial-v1')`) !== '{"bag-draw":true}') fail('seen flag');
if (t.logs.length) fail('console errors');
console.log(process.exitCode ? 'RESULT FAIL' : 'RESULT PASS bag-draw');
await t.close();
