// Checks every https link in the page's sources and data. Run with: pnpm check:links
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const roots = ['index.html', 'src', 'data'];
const files = [];
const walk = (p) => statSync(p).isDirectory() ? readdirSync(p).forEach((f) => walk(join(p, f))) : files.push(p);
roots.forEach(walk);

// Addresses inside generated code samples, placeholders and API endpoints aren't docs links.
const skip = /localhost|127\.0\.0\.1|example\.(com|org|test)|pay\.example|your-|YOUR|\$\{|\$$|api\.stripe\.com|api-m\.|api\.playground|checkout-test|\/v1\/|\/v2\/checkout|ably\.io\/channels|w3\.org|xmlns|schemas\.|maven\.apache\.org\/(POM|xsd)|ciamlogin|\.auth0\.com\/|realms\/|login\.microsoftonline|start\.openliberty\.io\/api|releases\/download|@@|%s|@$|^https:\/\/[^/]+$/;
const found = new Set();
for (const f of files) {
  for (const m of readFileSync(f, 'utf8').matchAll(/https:\/\/[A-Za-z0-9._~:/?#\[\]@!$&()*+,;=%-]+/g)) {
    const u = m[0].replace(/[)'.,;\\\]]+$/, '');
    if (!skip.test(u) && u.length > 12) found.add(u);
  }
}
const urls = [...found];
const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';
async function check(u) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const r = await fetch(u, { method, redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'user-agent': ua } });
      if (r.status < 400 || method === 'GET') return [u, r.status];
    } catch (e) { if (method === 'GET') return [u, 'ERR ' + String(e.cause?.code || e.message).slice(0, 40)]; }
  }
}
const out = [];
for (let i = 0; i < urls.length; i += 12) out.push(...await Promise.all(urls.slice(i, i + 12).map(check)));
// 403 and 429 usually mean the site blocks automated checks, not that the page is gone.
const bad = out.filter(([, s]) => !(typeof s === 'number' && (s < 400 || s === 403 || s === 429)));
console.log(`links checked: ${out.length}, broken: ${bad.length}`);
for (const [u, s] of bad) console.log(String(s).padEnd(8), u);
process.exitCode = bad.length ? 1 : 0;
