// Plays the hanoi tutorial with real mouse input. Usage: node tools/tut/hanoi.mjs [dark] [reduced] [outdir]
import { launch, sleep } from './lib.mjs';
import * as logic from '../../product/logic/hanoi.js';
import { bfs } from '../../product/logic/solve.js';
const [, , a1, a2, out = '/tmp'] = process.argv;
const t = await launch({ dark: a1 === 'dark', reduced: a2 === 'reduced' });
const fail = (m) => { console.log('FAIL', m, t.logs); process.exitCode = 1; };
await t.open('hanoi');
await t.waitTitle(/Move the tower/);
await t.shot(`${out}/hn-1.png`);
const peg = async (i) => { const r = await t.ev(`(()=>{const r=document.querySelectorAll('.hn-peg')[${i}].getBoundingClientRect();return {cx:r.left+r.width/2,cy:r.top+r.height/2}})()`); await t.tap(r.cx, r.cy); await sleep(250); };
await t.tapSel('.tut-btn.go'); await t.waitTitle(/Move one disc/);
await peg(0); await peg(1); await t.waitTitle(/Big never/);
await t.tapSel('.tut-btn.go'); await t.waitTitle(/Take it back/);
await t.tapSel('[data-a=undo]'); await t.waitTitle(/Your turn/);
await sleep(800); await t.shot(`${out}/hn-5.png`);
for (const m of bfs(logic, logic.makeLevel(1)).path) { await peg(m.from); await peg(m.to); }
await t.waitTitle(/complete/, 8000);
await t.shot(`${out}/hn-done.png`);
if (await t.ev(`localStorage.getItem('puzzle-app-v1')`)) fail('progress changed');
await t.tapSel('.tut-btn.go'); await sleep(500);
if (await t.coach()) fail('coach still open');
if (!(await t.ev(`!!document.querySelector('.stage .hn-peg')`))) fail('game gone');
if (await t.ev(`localStorage.getItem('puzzle-app-tutorial-v1')`) !== '{"hanoi":true}') fail('seen flag');
if (t.logs.length) fail('console errors');
console.log(process.exitCode ? 'RESULT FAIL' : 'RESULT PASS hanoi');
await t.close();
