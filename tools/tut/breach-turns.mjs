// Plays the breach-turns tutorial with real mouse input. Usage: node tools/tut/breach-turns.mjs [dark] [reduced] [outdir]
import { launch, sleep } from './lib.mjs';
import * as logic from '../../product/logic/breach-turns.js';
const [, , a1, a2, out = '/tmp'] = process.argv;
const t = await launch({ dark: a1 === 'dark', reduced: a2 === 'reduced' });
const fail = (m) => { console.log('FAIL', m, t.logs); process.exitCode = 1; };
await t.open('breach-turns');
await t.waitTitle(/Save the houses/);
await t.shot(`${out}/br-1.png`);
const level = logic.makeLevel(1);
let s = logic.initialState(level);
// cells carry aria-label "row,col" (1-based): find them by label, not by DOM order
const cell = async (r, c) => { const p = await t.ev(`(()=>{const e=document.querySelector('.br-cell[aria-label="${r + 1},${c + 1}"]'),b=e.getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+b.height/2}})()`); await t.tap(p.x, p.y); await sleep(250); };
const D = [[-1, 0], [0, 1], [1, 0], [0, -1]];
const play = async (m) => {
  if (m.t === 'end') { await t.tapSel('.br-end'); await sleep(1800); }
  else {
    await cell(...s.units[m.u]); await cell(...m.to);
    if (s.enemies.some((e) => D.some(([a, b]) => e[0] === m.to[0] + a && e[1] === m.to[1] + b))) await cell(...(m.punch >= 0 ? [m.to[0] + D[m.punch][0], m.to[1] + D[m.punch][1]] : m.to)); // punch mode
    await sleep(250);
  }
  s = logic.applyMove(s, m);
};
await t.tapSel('.tut-btn.go'); await t.waitTitle(/Move a unit/);
await play(level.solution[0]); await t.waitTitle(/Red crosses/);
await t.tapSel('.tut-btn.go'); await t.waitTitle(/Take it back/);
await t.tapSel('[data-a=undo]'); await t.waitTitle(/Your turn/);
s = logic.initialState(level);
await sleep(800); await t.shot(`${out}/br-5.png`);
for (const m of level.solution) await play(m);
await t.waitTitle(/complete/, 8000);
await t.shot(`${out}/br-done.png`);
if (await t.ev(`localStorage.getItem('puzzle-app-v1')`)) fail('progress changed');
await t.tapSel('.tut-btn.go'); await sleep(500);
if (await t.coach()) fail('coach still open');
if (!(await t.ev(`!!document.querySelector('.stage .br-cell')`))) fail('game gone');
if (await t.ev(`localStorage.getItem('puzzle-app-tutorial-v1')`) !== '{"breach-turns":true}') fail('seen flag');
if (t.logs.length) fail('console errors');
console.log(process.exitCode ? 'RESULT FAIL' : 'RESULT PASS breach-turns');
await t.close();
