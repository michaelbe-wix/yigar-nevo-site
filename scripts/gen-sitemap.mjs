// Regenerate public/gallery-urls.xml (home + gallery + blog + post + every gallery item).
// Run manually when the gallery collection changes:  node scripts/gen-sitemap.mjs
// (Wix `release` doesn't run npm hooks, and the Wix runtime only serves static files from
// public/, so the sitemap is shipped as a committed static asset.)
import { writeFileSync } from 'node:fs';

const CLIENT_ID = 'face20be-5a34-40b7-9339-5a6861c15ea4';
const BASE_URL = 'https://www.yigarnevo.com';
const abs = (p) => BASE_URL + (p === '/' ? '' : p);

const tok = (await (await fetch('https://www.wixapis.com/oauth2/token', {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ clientId: CLIENT_ID, grantType: 'anonymous' }),
})).json()).access_token;

const rows = (await (await fetch('https://www.wixapis.com/wix-data/v2/items/query', {
  method: 'POST', headers: { authorization: tok, 'content-type': 'application/json' },
  body: JSON.stringify({ dataCollectionId: 'GardenCollectionImages', query: { sort: [{ fieldName: 'sort', order: 'ASC' }], paging: { limit: 100 } } }),
})).json()).dataItems || [];

// Every published blog post (so new posts appear in the sitemap too).
const posts = (await (await fetch('https://www.wixapis.com/blog/v3/posts/query', {
  method: 'POST', headers: { authorization: tok, 'content-type': 'application/json' },
  body: JSON.stringify({ paging: { limit: 100 } }),
})).json()).posts || [];
const postSlugs = posts.map((p) => p.slug).filter(Boolean);

const nums = rows.map((r) => Number((r.data || r).slugId)).filter(Number.isFinite).sort((a, b) => a - b);
const urls = [BASE_URL, abs('/gallery'), abs('/blog'), ...postSlugs.map((s) => abs('/post/' + s)), ...nums.map((n) => abs('/gallery/' + n))];
const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map((u) => `  <url><loc>${encodeURI(u)}</loc></url>`).join('\n') +
  '\n</urlset>\n';
writeFileSync(new URL('../public/gallery-urls.xml', import.meta.url), xml);
console.log('wrote public/gallery-urls.xml with', urls.length, 'urls');
