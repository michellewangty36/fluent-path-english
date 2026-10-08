// Unlock the published index.html with the access code (the same thing the page does in the browser).
// Used by the "Save course source" workflow to keep src.enc in step with index.html.
// node tools/open.mjs <access-code> index.html app.html
import { webcrypto as c } from 'node:crypto'; import fs from 'node:fs';
const [code, inp, out] = process.argv.slice(2);
if(!code) { console.error('ACCESS_CODE is missing. Add it under Settings > Secrets and variables > Actions.'); process.exit(1); }
const D = JSON.parse(fs.readFileSync(inp, 'utf8').match(/const D=(\{.*?\});/)[1].replace(/(\w):/g, '"$1":'));
const ub = s => Buffer.from(s, 'base64');
const base = await c.subtle.importKey('raw', new TextEncoder().encode(code.trim().toLowerCase()), 'PBKDF2', false, ['deriveKey']);
const key = await c.subtle.deriveKey({name:'PBKDF2', salt:ub(D.s), iterations:D.n, hash:'SHA-256'}, base, {name:'AES-GCM', length:256}, false, ['decrypt']);
let html;
try { html = new TextDecoder().decode(await c.subtle.decrypt({name:'AES-GCM', iv:ub(D.i)}, key, ub(D.c))); }
catch { console.error('ACCESS_CODE does not open index.html. Run "Change access code" so they match.'); process.exit(1); }
// build.mjs adds the icon/manifest tags inside the page; take them out so they aren't added twice next time.
const HEAD = fs.readFileSync(new URL('./build.mjs', import.meta.url), 'utf8').match(/const HEAD = '(.*)';/)[1];
fs.writeFileSync(out, html.replace('<head>' + HEAD, '<head>'));
