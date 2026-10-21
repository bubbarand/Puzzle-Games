// Plays the pentomino-5x5 tutorial with real mouse input. Usage: node tools/tut/pentomino-5x5.mjs [dark] [reduced] [outdir]
import { launch, sleep } from './lib.mjs';
import { makeLevel } from '../../product/logic/pentomino-5x5.js';
const [, , a1, a2, out = '/tmp'] = process.argv;
const ID = 'pentomino-5x5', P = 'pe', GOAL = /Fill the square/, RULE = /Turn, never flip/;
const t = await launch({ dark: a1 === 'dark', reduced: a2 === 'reduced' });
const fail = (m) => { console.log('FAIL', m, t.logs); process.exitCode = 1; };
await t.open(ID);
await t.waitTitle(GOAL);
await t.shot(`${out}/${P}-1.png`);
await t.tapSel('.tut-btn.go'); await t.waitTitle(/Place a block/);
// geometry copied from the game: S = min(floor(344/cols),56), bx = (400-cols*S)/2, by = 30, viewBox width 400
const level = makeLevel(1), cols = level.board[0].length;
const S = Math.min(Math.floor(344 / cols), 56), bx = (400 - cols * S) / 2, by = 30;
const norm = (c) => { const r0 = Math.min(...c.map((p) => p[0])), c0 = Math.min(...c.map((p) => p[1])); return c.map(([r, q]) => [r - r0, q - c0]).sort((a, b) => a[0] - b[0] || a[1] - b[1]); };
const spin = (c, k) => { for (let i = 0; i < k; i++) c = norm(c.map(([r, q]) => [q, -r])); return c; };
const rot = {}; // the game keeps a block's turn after it is placed
const place = async (m) => {
  const shape = norm(level.tiling[m.i]), want = JSON.stringify(norm(m.cells));
  const k = [0, 1, 2, 3].find((q) => JSON.stringify(spin(shape, q)) === want);
  for (let n = (k - (rot[m.i] ?? (m.i * 5 + 1) % 4) + 4) % 4; n > 0; n--) await t.tapSel(`.${P}-rot`);
  rot[m.i] = k;
  const svg = await t.rect(`.${P}-main`), sc = svg.w / 400, g = await t.rect(`.${P}-pc[data-i="${m.i}"]`);
  const rs = m.cells.map((c) => c[0]), cs = m.cells.map((c) => c[1]);
  const x = svg.x + (bx + ((Math.min(...cs) + Math.max(...cs) + 1) / 2) * S) * sc, y = svg.y + (by + ((Math.min(...rs) + Math.max(...rs) + 1) / 2) * S) * sc;
  await t.drag(g.cx, g.cy, x, y); await sleep(250);
};
const moves = level.solution; // test only: stored answer used here, never by the tutorial
await place(moves[0]); await t.waitTitle(RULE);
await t.tapSel('.tut-btn.go'); await t.waitTitle(/Take it back/);
await t.tapSel('[data-a=undo]'); await t.waitTitle(/Your turn/);
await sleep(800); await t.shot(`${out}/${P}-5.png`);
for (const m of moves) await place(m);
await t.waitTitle(/complete/, 6000);
await t.shot(`${out}/${P}-done.png`);
if (await t.ev(`localStorage.getItem('puzzle-app-v1')`)) fail('progress changed');
await t.tapSel('.tut-btn.go'); await sleep(500);
if (await t.coach()) fail('coach still open');
if (await t.ev(`localStorage.getItem('puzzle-app-tutorial-v1')`) !== `{"${ID}":true}`) fail('seen flag');
if (t.logs.length) fail('console errors');
console.log(process.exitCode ? 'RESULT FAIL' : `RESULT PASS ${ID}`);
await t.close();
