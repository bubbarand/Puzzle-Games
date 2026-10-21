// Plays the mirror-laser tutorial with real mouse input. Usage: node tools/tut/mirror-laser.mjs [dark] [reduced] [outdir]
import { launch, sleep } from './lib.mjs';
import { makeLevel } from '../../product/logic/mirror-laser.js';
const [, , a1, a2, out = '/tmp'] = process.argv;
const t = await launch({ dark: a1 === 'dark', reduced: a2 === 'reduced' });
const fail = (m) => { console.log('FAIL', m, t.logs); process.exitCode = 1; };
await t.open('mirror-laser');
await t.waitTitle(/Reach the target/);
await t.shot(`${out}/ml-1.png`);
await t.tapSel('.tut-btn.go'); await t.waitTitle(/Place a mirror/);
const n = makeLevel(1).size; // level 1 is 6x6: a tap on a tile sets a mirror ('/' first, '\' on the second tap)
const order = []; for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) order.push([r, c]);
order.sort((p, q) => p[0] + p[1] - (q[0] + q[1])); // the game draws tiles by diagonal, so .ml-t is not row-major
const tile = (r, c) => t.ev(`(()=>{const r=document.querySelectorAll('.ml-t')[${order.findIndex((o) => o[0] === r && o[1] === c)}].getBoundingClientRect();return {cx:r.left+r.width/2,cy:r.top+r.height/2}})()`);
const tapTile = async (r, c, times = 1) => { for (let k = 0; k < times; k++) { const p = await tile(r, c); await t.tap(p.cx, p.cy); await sleep(500); } };
const sol = makeLevel(1).solution.filter((m) => m.t === 'p');
await tapTile(...sol[0].cell, sol[0].m + 1); await t.waitTitle(/Turn a mirror/);
await t.tapSel('.tut-btn.go'); await t.waitTitle(/Tries are limited/);
await t.shot(`${out}/ml-4.png`);
await t.tapSel('.tut-btn.go'); await t.waitTitle(/Your turn/);
await sleep(800); await t.shot(`${out}/ml-5.png`);
for (const m of sol.slice(1)) await tapTile(...m.cell, m.m + 1);
await t.shot(`${out}/ml-pre.png`); await t.tapSel(".ml-fire"); await sleep(1500); await t.shot(`${out}/ml-post.png`);
await t.waitTitle(/complete/, 8000);
await t.shot(`${out}/ml-done.png`);
if (await t.ev(`localStorage.getItem('puzzle-app-v1')`)) fail('progress changed');
await t.tapSel('.tut-btn.go'); await sleep(500);
if (await t.coach()) fail('coach still open');
if (await t.ev(`localStorage.getItem('puzzle-app-tutorial-v1')`) !== '{"mirror-laser":true}') fail('seen flag');
if (t.logs.length) fail('console errors');
console.log(process.exitCode ? 'RESULT FAIL' : 'RESULT PASS mirror-laser');
await t.close();
