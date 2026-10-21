import { launch } from './lib.mjs';
const t = await launch();
await t.open('traffic-jam');
console.log(await t.coach(), await t.spot());
await t.shot(process.argv[2] || '/tmp/smoke.png');
console.log(t.logs);
await t.close();
