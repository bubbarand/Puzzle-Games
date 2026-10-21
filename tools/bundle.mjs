// Bundles product/ (ES modules, no build step in the app) into ONE html file for phone preview as an artifact.
// Usage: node tools/bundle.mjs   -> dist/puzzles-artifact.html
// Handles the import/export forms used in product/: named imports, `import * as`, export function/const/destructuring.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';

const root = new URL('../product/', import.meta.url).pathname;
const seen = new Map(); // key -> transformed source
const order = [];

function visit(key) {
  if (seen.has(key)) return;
  seen.set(key, null);
  let src = readFileSync(join(root, key), 'utf8');
  const names = [];
  const rel = (p) => normalize(join(dirname(key), p)).replace(/\\/g, '/');
  src = src.replace(/import\s*\*\s*as\s+(\w+)\s+from\s+'([^']+)';?/g, (_, ns, p) => { visit(rel(p)); return `const ${ns} = __req('${rel(p)}');`; });
  src = src.replace(/import\s*\{([^}]*)\}\s*from\s+'([^']+)';?/g, (_, list, p) => {
    visit(rel(p));
    return `const {${list.split(',').map((x) => x.trim()).filter(Boolean).map((x) => x.replace(/\s+as\s+/, ': ')).join(', ')}} = __req('${rel(p)}');`;
  });
  src = src.replace(/export\s+const\s*\{([^}]*)\}\s*=/g, (_, list) => { list.split(',').forEach((n) => names.push(n.trim())); return `const {${list}} =`; });
  src = src.replace(/export\s+(?:async\s+)?function\s+(\w+)/g, (m, n) => { names.push(n); return m.replace('export ', ''); });
  src = src.replace(/export\s+(const|let|var)\s+(\w+)/g, (_, k, n) => { names.push(n); return `${k} ${n}`; });
  if (/\bexport\b\s*[{d]/.test(src)) throw new Error('unsupported export form in ' + key);
  seen.set(key, `__defs['${key}'] = () => {\n${src}\nreturn { ${names.join(', ')} };\n};`);
  order.push(key);
}
visit('ui/shell.js');

const body = order.map((k) => seen.get(k)).join('\n');
const out = `<title>Daily Puzzles</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@600;800&family=JetBrains+Mono:wght@500&display=swap">
<div id="app"></div>
<script>
(function () {
const __defs = {}, __cache = {};
const __req = (k) => (__cache[k] ??= __defs[k]());
${body}
__req('ui/shell.js');
})();
</script>
`;
mkdirSync(new URL('../dist/', import.meta.url).pathname, { recursive: true });
writeFileSync(new URL('../dist/puzzles-artifact.html', import.meta.url).pathname, out);
console.log('modules:', order.length, 'bytes:', out.length);
