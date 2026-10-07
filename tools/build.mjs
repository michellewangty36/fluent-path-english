// Usage: node build.mjs <access-code> <input.html> <out.html>
import { webcrypto as c } from 'node:crypto'; import fs from 'node:fs';
const [code, inp, out] = process.argv.slice(2);
const enc = new TextEncoder(), b64 = u => Buffer.from(u).toString('base64');
const HEAD = '<link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="icon-192.png"><link rel="apple-touch-icon" href="apple-touch-icon.png"><meta name="apple-mobile-web-app-title" content="Fluent Path"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes">';
const salt = c.getRandomValues(new Uint8Array(16)), iv = c.getRandomValues(new Uint8Array(12)), ITER = 300000;
const base = await c.subtle.importKey('raw', enc.encode(code.trim().toLowerCase()), 'PBKDF2', false, ['deriveKey']);
const key = await c.subtle.deriveKey({name:'PBKDF2', salt, iterations:ITER, hash:'SHA-256'}, base, {name:'AES-GCM', length:256}, false, ['encrypt']);
const ct = new Uint8Array(await c.subtle.encrypt({name:'AES-GCM', iv}, key, enc.encode(fs.readFileSync(inp,'utf8').replace(/<head>/i, '<head>'+HEAD))));
const gate = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fluent Path English</title>${HEAD}
<meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#16213B">
<style>:root{--bg:#F2F4F8;--card:#fff;--ink:#16213B;--muted:#5A6378;--line:#D8DDE7;--hl:#FFE45C;--bad:#C23A3A}
@media (prefers-color-scheme:dark){:root{--bg:#0E1424;--card:#161F33;--ink:#E6EBF5;--muted:#9BA6BD;--line:#283450;--bad:#FF7A7A;color-scheme:dark}}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;padding:16px}
form{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:28px;width:100%;max-width:380px;display:grid;gap:14px}
h1{margin:0;font-size:28px;letter-spacing:-.02em}h1 span{background:var(--hl);color:#16213B;padding:0 6px;border-radius:4px}
p{margin:0;color:var(--muted)}input[type=password],input[type=text]{width:100%;font:inherit;padding:12px;border:1.5px solid var(--line);border-radius:8px;background:var(--bg);color:var(--ink)}
button{font:inherit;font-weight:700;padding:12px;border-radius:8px;border:0;background:var(--ink);color:var(--bg);cursor:pointer}
label{display:flex;gap:8px;align-items:center;color:var(--muted);font-size:14px}#err{color:var(--bad);font-size:14px;min-height:1.2em}</style></head>
<body><form id="f"><h1>Fluent <span>Path</span></h1><p>Enter the access code you were given to open the English course.</p>
<input type="password" id="code" autocomplete="current-password" placeholder="Access code" aria-label="Access code" required>
<label><input type="checkbox" id="rem" checked> Remember on this device</label><button type="submit" id="go">Open</button><div id="err" role="alert"></div></form>
<script>
const D={s:"${b64(salt)}",i:"${b64(iv)}",n:${ITER},c:"${b64(ct)}"};
const ub=s=>Uint8Array.from(atob(s),ch=>ch.charCodeAt(0));
async function open(code){
  const base=await crypto.subtle.importKey("raw",new TextEncoder().encode(code.trim().toLowerCase()),"PBKDF2",false,["deriveKey"]);
  const key=await crypto.subtle.deriveKey({name:"PBKDF2",salt:ub(D.s),iterations:D.n,hash:"SHA-256"},base,{name:"AES-GCM",length:256},false,["decrypt"]);
  const html=new TextDecoder().decode(await crypto.subtle.decrypt({name:"AES-GCM",iv:ub(D.i)},key,ub(D.c)));
  document.open();document.write(html);document.close();
}
const K="fluentpath.code";
document.getElementById("f").onsubmit=async e=>{e.preventDefault();const b=document.getElementById("go"),er=document.getElementById("err");b.disabled=true;b.textContent="Opening…";er.textContent="";
  const code=document.getElementById("code").value;
  try{await open(code);try{if(document.getElementById("rem")?.checked!==false)localStorage.setItem(K,code)}catch(_){}}
  catch(_){er.textContent="That code doesn't work. Check it and try again, or ask for a new one.";b.disabled=false;b.textContent="Open";}};
(async()=>{let s=null;try{s=localStorage.getItem(K)}catch(_){} if(s){try{await open(s)}catch(_){try{localStorage.removeItem(K)}catch(__){}}}})();
</script></body></html>`;
fs.writeFileSync(out, gate); console.log('ok', gate.length);
