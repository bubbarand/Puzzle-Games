// Plays the lemmings-tools tutorial with real mouse input. Usage: node tools/tut/lemmings-tools.mjs [dark] [reduced] [outdir]
import { launch, sleep } from './lib.mjs';
import * as logic from '../../product/logic/lemmings-tools.js';
import { bfs } from '../../product/logic/solve.js';
const [, , a1, a2, out = '/tmp'] = process.argv;
const t = await launch({ dark: a1 === 'dark', reduced: a2 === 'reduced' });
const fail = (m) => { console.log('FAIL', m, t.logs); process.exitCode = 1; };
await t.open('lemmings-tools');
await t.waitTitle(/Reach the exit/);
await t.shot(`${out}/lt-1.png`);
const level = logic.makeLevel(1), avail = [0, 1, 2, 3].filter((k) => level.avail[k]);
const pick = async (tool) => { const r = await t.ev(`(()=>{const r=document.querySelectorAll('.lt-tb')[${avail.indexOf(tool)}].getBoundingClientRect();return {cx:r.left+r.width/2,cy:r.top+r.height/2}})()`); await t.tap(r.cx, r.cy); };
// find a point inside the cell's own art: scan the box for a point whose hit-test lands on that cell
const cellPt = (i) => t.ev(`(()=>{const g=document.querySelector('.lt-c[data-i="${i}"]'),r=g.getBoundingClientRect();for(const fy of [.5,.6,.4,.7,.3,.8])for(const fx of [.5,.4,.6,.3,.7]){const x=r.left+r.width*fx,y=r.top+r.height*fy;if(document.elementFromPoint(x,y)?.closest('.lt-c')===g)return {x,y}}return null})()`);
const place = async (m) => { await pick(m.tool); const p = await cellPt(m.cell); if (!p) throw new Error('no hit point cell ' + m.cell); await t.tap(p.x, p.y); await sleep(300); };
const path = bfs(logic, level).path;
await t.tapSel('.tut-btn.go'); await t.waitTitle(/Place a tool/);
await place(path.find((m) => m.t === 'place')); await t.waitTitle(/Right tool/);
await t.tapSel('.tut-btn.go'); await t.waitTitle(/Take it back/);
await t.tapSel('[data-a=undo]'); await t.waitTitle(/Your turn/);
await sleep(800); await t.shot(`${out}/lt-5.png`);
for (const m of path) { if (m.t === 'place') await place(m); else await t.tapSel('.lt-go'); }
await t.waitTitle(/complete/, 15000);
await t.shot(`${out}/lt-done.png`);
if (await t.ev(`localStorage.getItem('puzzle-app-v1')`)) fail('progress changed');
await t.tapSel('.tut-btn.go'); await sleep(500);
if (await t.coach()) fail('coach still open');
if (!(await t.ev(`!!document.querySelector('.stage .lt-c')`))) fail('game gone');
if (await t.ev(`localStorage.getItem('puzzle-app-tutorial-v1')`) !== '{"lemmings-tools":true}') fail('seen flag');
if (t.logs.length) fail('console errors');
console.log(process.exitCode ? 'RESULT FAIL' : 'RESULT PASS lemmings-tools');
await t.close();
