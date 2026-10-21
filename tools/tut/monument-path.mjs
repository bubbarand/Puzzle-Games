// Plays the monument-path tutorial with real mouse input. Usage: node tools/tut/monument-path.mjs [dark] [reduced] [outdir]
import { launch, sleep } from './lib.mjs';
import * as logic from '../../product/logic/monument-path.js';
import { bfs } from '../../product/logic/solve.js';
const [, , a1, a2, out = '/tmp'] = process.argv;
const t = await launch({ dark: a1 === 'dark', reduced: a2 === 'reduced' });
const fail = (m) => { console.log('FAIL', m, t.logs); process.exitCode = 1; };
await t.open('monument-path');
await t.waitTitle(/Reach the lantern/);
await t.shot(`${out}/mp-1.png`);
let s = logic.initialState(logic.makeLevel(1));
const ring = (i) => t.ev(`(()=>{const r=document.querySelectorAll('.mp-ring')[${i}].getBoundingClientRect();return {cx:r.left+r.width/2,cy:r.top+r.height/2}})()`);
const step = async (m) => { // a real tap or button press; keeps a mirror of the game state
  if (m.t === 'rot') await t.tapSel(`.mp-bt:nth-of-type(${m.d > 0 ? 2 : 1})`);
  else { const c = await ring(m.to); await t.tap(c.cx, c.cy); }
  s = logic.applyMove(s, m); await sleep(700);
};
await t.tapSel('.tut-btn.go'); await t.waitTitle(/Turn the world/);
await step({ t: 'rot', d: 1 }); await t.waitTitle(/Walk a step/);
await t.shot(`${out}/mp-3.png`);
await step(logic.legalMoves(s).find((m) => m.t === 'walk')); await t.waitTitle(/Looks joined/);
await t.tapSel('.tut-btn.go'); await t.waitTitle(/Take it back/);
await t.tapSel('[data-a=undo]'); await t.waitTitle(/Your turn/);
s = { ...s, at: logic.makeLevel(1).start }; // undo put the traveler back on the start block
await sleep(800); await t.shot(`${out}/mp-6.png`);
const path = bfs({ initialState: () => s, legalMoves: logic.legalMoves, applyMove: logic.applyMove, isSolved: logic.isSolved }, null).path;
for (const m of path) await step(m);
await t.waitTitle(/complete/, 6000);
await t.shot(`${out}/mp-done.png`);
if (await t.ev(`localStorage.getItem('puzzle-app-v1')`)) fail('progress changed');
await t.tapSel('.tut-btn.go'); await sleep(500);
if (await t.coach()) fail('coach still open');
if (await t.ev(`localStorage.getItem('puzzle-app-tutorial-v1')`) !== '{"monument-path":true}') fail('seen flag');
if (t.logs.length) fail('console errors');
console.log(process.exitCode ? 'RESULT FAIL' : 'RESULT PASS monument-path');
await t.close();
