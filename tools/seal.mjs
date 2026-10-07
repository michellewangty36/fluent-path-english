// Encrypt or decrypt the course source with SOURCE_KEY.
// node tools/seal.mjs lock   <key> app.html src.enc
// node tools/seal.mjs unlock <key> src.enc  app.html
import { webcrypto as c } from 'node:crypto'; import fs from 'node:fs';
const [mode, pass, inp, out] = process.argv.slice(2);
if(!pass) { console.error('SOURCE_KEY is missing. Add it under Settings > Secrets and variables > Actions.'); process.exit(1); }
const key = async salt => c.subtle.deriveKey({name:'PBKDF2', salt, iterations:300000, hash:'SHA-256'},
  await c.subtle.importKey('raw', new TextEncoder().encode(pass.trim()), 'PBKDF2', false, ['deriveKey']), {name:'AES-GCM', length:256}, false, ['encrypt','decrypt']);
if(mode === 'lock'){
  const salt = c.getRandomValues(new Uint8Array(16)), iv = c.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await c.subtle.encrypt({name:'AES-GCM', iv}, await key(salt), fs.readFileSync(inp)));
  fs.writeFileSync(out, Buffer.concat([salt, iv, ct]).toString('base64'));
} else {
  const b = Buffer.from(fs.readFileSync(inp, 'utf8'), 'base64');
  try { fs.writeFileSync(out, Buffer.from(await c.subtle.decrypt({name:'AES-GCM', iv:b.subarray(16,28)}, await key(b.subarray(0,16)), b.subarray(28)))); }
  catch { console.error('SOURCE_KEY is wrong: it does not match the one used to lock the course.'); process.exit(1); }
}
