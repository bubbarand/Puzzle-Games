// Plays the traffic-jam tutorial with real mouse input. Usage: node tools/tut/traffic-jam.mjs [dark] [reduced] [outdir]
import { launch, sleep } from './lib.mjs';
import { solve, makeLevel } from '../../product/logic/traffic-jam.js';
const [, , a1, a2, out = '/tmp'] = process.argv;
const t = await launch({ dark: a1 === 'dark', reduced: a2 === 'reduced' });
const fail = (m) => { console.log('FAIL', m, t.logs); process.exitCode = 1; };
await t.open('traffic-jam');
await t.waitTitle(/Free the red car/);
await t.shot(`${out}/tj-1.png`);
await t.tapSel('.tut-btn.go'); await t.waitTitle(/Slide a car/);
const rects = () => t.ev(`[...document.querySelectorAll('.tj-car')].map(g=>{const r=g.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height,cx:r.left+r.width/2,cy:r.top+r.height/2}})`);
let R = await rects();
const cell = (R[1].y - R[5].y) / 2; // car 1 sits 2 rows below car 5
const dragCar = async (i, d) => { const r = (await rects())[i]; const hz = r.w > r.h; await t.drag(r.cx, r.cy, r.cx + (hz ? d * cell : 0), r.cy + (hz ? 0 : d * cell)); };
await dragCar(5, 1); await t.waitTitle(/cannot pass/);
await t.tapSel('.tut-btn.go'); await t.waitTitle(/Take it back/);
await t.tapSel('[data-a=undo]'); await t.waitTitle(/Your turn/);
await sleep(800); await t.shot(`${out}/tj-5.png`);
for (const m of solve(makeLevel(1))) { await dragCar(m.car, m.d) }
await t.waitTitle(/complete/, 6000);
await t.shot(`${out}/tj-done.png`);
const prog = await t.ev(`localStorage.getItem('puzzle-app-v1')`);
if (prog) fail('progress changed: ' + prog);
await t.tapSel('.tut-btn.go'); await sleep(500);
if (await t.coach()) fail('coach still open');
if (!(await t.ev(`!!document.querySelector('.stage .tj-car')`))) fail('game gone');
if (await t.ev(`localStorage.getItem('puzzle-app-tutorial-v1')`) !== '{"traffic-jam":true}') fail('seen flag');
if (t.logs.length) fail('console errors');
console.log(process.exitCode ? 'RESULT FAIL' : 'RESULT PASS traffic-jam');
await t.close();
