import { CLIENT_ID } from './wix';

// Server-safe (no browser SDK): list published post slugs via REST + anonymous visitor token,
// so the /post/[slug] route can validate ANY real post (not just one hardcoded slug).
let _cache: string[] | null = null;

export async function fetchPublishedSlugsServer(): Promise<string[]> {
  if (_cache) return _cache;
  try {
    const tok = (
      await (
        await fetch('https://www.wixapis.com/oauth2/token', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ clientId: CLIENT_ID, grantType: 'anonymous' }),
        })
      ).json()
    ).access_token as string;
    const res = await (
      await fetch('https://www.wixapis.com/blog/v3/posts/query', {
        method: 'POST',
        headers: { authorization: tok, 'content-type': 'application/json' },
        body: JSON.stringify({ paging: { limit: 100 } }),
      })
    ).json();
    _cache = ((res.posts || []) as any[]).map((p) => p.slug).filter(Boolean);
  } catch {
    _cache = [];
  }
  return _cache;
}
