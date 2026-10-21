// Test driver for the tutorials: static server + headless Chrome over CDP (no dependency). Real mouse/touch input.
// Usage in a test: const t = await launch({ dark, reduced }); await t.open('traffic-jam'); await t.tap(x, y); await t.shot('a.png'); await t.close();
import http from 'node:http';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync, existsSync, rmSync } from 'node:fs';
import { join, extname } from 'node:path';
import { tmpdir } from 'node:os';

const ROOT = new URL('../../product/', import.meta.url).pathname;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launch({ dark = false, reduced = false, width = 390, height = 800, port = 8765 + Math.floor(Math.random() * 500) } = {}) {
  const server = http.createServer((req, res) => {
    const p = join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!p.startsWith(ROOT) || !existsSync(p)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': MIME[extname(p)] || 'text/plain' }); res.end(readFileSync(p));
  });
  await new Promise((r) => server.listen(port, r));
  const dbg = port + 1000;
  const profile = mkdtempSync(join(tmpdir(), 'tutchrome-'));
  const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${dbg}`, `--user-data-dir=${profile}`, '--no-first-run', '--disable-gpu', '--window-size=500,900', 'about:blank'], { stdio: 'ignore' });
  let targets;
  for (let k = 0; k < 50; k++) { try { targets = await (await fetch(`http://127.0.0.1:${dbg}/json`)).json(); if (targets.find((x) => x.type === 'page')) break; } catch { /* wait */ } await sleep(200); }
  const ws = new WebSocket(targets.find((x) => x.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0; const pend = new Map(); const logs = [];
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pend.has(d.id)) { const [ok, bad] = pend.get(d.id); pend.delete(d.id); d.error ? bad(new Error(d.error.message)) : ok(d.result); }
    else if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') logs.push(d.params.args.map((a) => a.value ?? a.description).join(' '));
    else if (d.method === 'Runtime.exceptionThrown') logs.push('EXC ' + (d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text));
  };
  const send = (method, params = {}) => new Promise((ok, bad) => { const i = ++id; pend.set(i, [ok, bad]); ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 2, mobile: false });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' }, { name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' }] });
  const ev = async (js) => { const r = await send('Runtime.evaluate', { expression: js, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };
  const mouse = (type, x, y) => send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1 });
  const t = {
    logs, ev, send,
    async open(game) { // fresh storage; the tutorial starts by itself (TUTORIAL_ALWAYS)
      const url = `http://127.0.0.1:${port}/index.html`;
      await send('Page.navigate', { url }); await sleep(500); await ev('localStorage.clear()');
      await send('Page.navigate', { url }); await sleep(700);
      await ev(`document.querySelector('.row[data-id=${game}]').scrollIntoView({block:'center'})`); await sleep(300);
      await t.tapSel(`.row[data-id=${game}]`); await sleep(900);
    },
    rect: (sel) => ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height,cx:r.left+r.width/2,cy:r.top+r.height/2}})()`),
    async tap(x, y) { await mouse('mouseMoved', x, y); await mouse('mousePressed', x, y); await sleep(40); await mouse('mouseReleased', x, y); await sleep(120); },
    async drag(x1, y1, x2, y2, steps = 12) { await mouse('mouseMoved', x1, y1); await mouse('mousePressed', x1, y1); for (let k = 1; k <= steps; k++) { await mouse('mouseMoved', x1 + ((x2 - x1) * k) / steps, y1 + ((y2 - y1) * k) / steps); await sleep(16); } await mouse('mouseReleased', x2, y2); await sleep(200); },
    async tapSel(sel) { const r = await t.rect(sel); if (!r) throw new Error('no element ' + sel); await t.tap(r.cx, r.cy); },
    coach: () => ev(`(()=>{const c=document.querySelector('.tut-coach');return c?{title:c.querySelector('.tut-t')?.textContent,body:c.querySelector('.tut-b')?.textContent,on:c.querySelectorAll('.tut-seg i.on').length,total:c.querySelectorAll('.tut-seg i').length}:null})()`),
    spot: () => ev(`(()=>{const s=document.querySelector('.tut-spot');if(!s||s.hidden)return null;const r=s.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height,cx:r.left+r.width/2,cy:r.top+r.height/2}})()`),
    async waitTitle(re, ms = 4000) { const end = Date.now() + ms; while (Date.now() < end) { const c = await t.coach(); if (c && re.test(c.title || '')) return c; await sleep(100); } throw new Error('coach never showed ' + re + ' last=' + JSON.stringify(await t.coach())); },
    async shot(path) { const r = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(path, Buffer.from(r.data, 'base64')); },
    async close() { try { await send('Browser.close'); } catch { /* gone */ } ws.close(); server.close(); proc.kill(); await sleep(1200); try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 }); } catch { /* next run's cleanup */ } },
  };
  return t;
}
