import { CLIENT_ID } from './wix';
import { POST_SLUG } from './seo';

const COVER_BASE = 'https://static.wixstatic.com/media/7ceb9a_e38633a6de174a6cbfc636292f8c1576~mv2.png';

export function coverUrl(w: number, h: number, q = 82) {
  return `${COVER_BASE}/v1/fill/w_${w},h_${h},al_c,q_${q},enc_auto/file.png`;
}

export interface FeaturedPost {
  title: string;
  dateLabel: string;
  excerpt: string;
}

export interface PostListItem {
  title: string;
  slug: string;
  dateLabel: string;
  excerpt: string;
  cover: string;
}

export interface PostContent {
  title: string;
  dateLabel: string;
  richContent: any;
}

// Canonical metadata for the flagship post (first published 2024-12-28). Kept as fallback.
export const POST: FeaturedPost = {
  title: 'רעפי מרסיי — רעפים שהובאו לארץ בין השנים 1890–1935',
  dateLabel: '28.12.2024',
  excerpt:
    '״רעפי מרסיי״ הוא השם שניתן לרעפים שיובאו לארץ מצרפת ממפעלים שהוקמו במחצית המאה התשע־עשרה בסביבות העיר מרסיי. הסיפור של רעפי מרסיי מתחיל...',
};

function formatDate(iso?: string, slug?: string): string {
  // The flagship post's true publish date is 28.12.2024; its stored firstPublishedDate is the
  // re-publish date, so pin the known post to its real date. Other posts use their real date.
  if (slug === POST_SLUG) return POST.dateLabel;
  if (!iso) return POST.dateLabel;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return POST.dateLabel;
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

/** Build a transformed cover URL from a post's own media (falls back to the flagship cover). */
function coverFrom(p: any): string {
  const img = p?.media?.wixMedia?.image;
  if (img?.url && /^https?:/.test(img.url)) {
    const ext = ((img.url.split('?')[0].split('.').pop() as string) || 'jpg').toLowerCase();
    return `${img.url}/v1/fill/w_1000,h_780,al_c,q_82,enc_auto/file.${ext}`;
  }
  return coverUrl(1000, 780);
}

// --- REST access (browser, anonymous visitor token). The Blog SDK query wasn't returning the
//     per-post cover `media`, so query the Blog v3 API directly, which does. ---
let _tokenP: Promise<string> | null = null;
function anonToken(): Promise<string> {
  if (!_tokenP) {
    _tokenP = fetch('https://www.wixapis.com/oauth2/token', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ clientId: CLIENT_ID, grantType: 'anonymous' }),
    })
      .then((r) => r.json())
      .then((j) => j.access_token as string);
  }
  return _tokenP;
}

async function queryPostsRest(fieldsets?: string[]): Promise<any[]> {
  const tok = await anonToken();
  const body: any = { paging: { limit: 100 } };
  if (fieldsets) body.fieldsets = fieldsets;
  const res = await fetch('https://www.wixapis.com/blog/v3/posts/query', {
    method: 'POST',
    headers: { authorization: tok, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return (await res.json()).posts || [];
}

/** Home teaser metadata (single latest post). */
export async function fetchFeaturedPost(): Promise<FeaturedPost> {
  try {
    const p = (await queryPostsRest())[0];
    if (p) return { title: p.title || POST.title, dateLabel: formatDate(p.firstPublishedDate, p.slug), excerpt: p.excerpt || POST.excerpt };
  } catch {
    /* fall through */
  }
  return POST;
}

/** Blog index — the full published-post list, each with its own cover. */
export async function fetchPosts(): Promise<PostListItem[]> {
  try {
    const posts = await queryPostsRest();
    return posts.map((p) => ({
      title: p.title || POST.title,
      slug: p.slug || POST_SLUG,
      dateLabel: formatDate(p.firstPublishedDate, p.slug),
      excerpt: p.excerpt || '',
      cover: coverFrom(p),
    }));
  } catch {
    return [];
  }
}

// (normalizeRichContent unchanged below)
const NUM_PREFIX = /^\s*\d+\.[\s ]+/;
function firstText(n: any): string {
  const t = (n?.nodes || []).find((k: any) => k.type === 'TEXT');
  return t?.textData?.text || '';
}
const isNumbered = (n: any) => n?.type === 'PARAGRAPH' && NUM_PREFIX.test(firstText(n));
const isEmptyPara = (n: any) => n?.type === 'PARAGRAPH' && !firstText(n).trim();
function stripNumber(n: any): any {
  const nodes = (n.nodes || []).map((k: any) => ({ ...k }));
  const i = nodes.findIndex((k: any) => k.type === 'TEXT');
  if (i >= 0) nodes[i] = { ...nodes[i], textData: { ...nodes[i].textData, text: (nodes[i].textData?.text || '').replace(NUM_PREFIX, '') } };
  return { ...n, nodes };
}
export function normalizeRichContent(rc: any): any {
  try {
    const src: any[] = rc?.nodes;
    if (!Array.isArray(src)) return rc;
    const out: any[] = [];
    let i = 0;
    let c = 0;
    const nextNonEmptyIsNumbered = (from: number) => {
      let j = from;
      while (j < src.length && isEmptyPara(src[j])) j++;
      return j < src.length && isNumbered(src[j]);
    };
    while (i < src.length) {
      if (!isNumbered(src[i])) { out.push(src[i]); i++; continue; }
      const items: any[] = [];
      while (i < src.length) {
        if (isNumbered(src[i])) {
          const p = stripNumber(src[i]);
          items.push({ type: 'LIST_ITEM', id: `ynli${c}_${items.length}`, nodes: [{ ...p, id: `ynlip${c}_${items.length}` }] });
          i++;
        } else if (isEmptyPara(src[i]) && nextNonEmptyIsNumbered(i + 1)) {
          i++;
        } else break;
      }
      out.push({ type: 'ORDERED_LIST', id: `ynol${c}`, nodes: items, orderedListData: {} });
      c++;
    }
    return { ...rc, nodes: out };
  } catch {
    return rc;
  }
}

/** Full post (with Ricos rich content) for the post page, resolved by slug. */
export async function fetchPostContent(slug: string): Promise<PostContent | null> {
  try {
    const items = await queryPostsRest(['RICH_CONTENT']);
    const p =
      items.find((x) => x.slug === slug) ||
      items.find((x) => decodeURIComponent(x.slug || '') === decodeURIComponent(slug)) ||
      items[0];
    if (!p) return null;
    return {
      title: p.title || POST.title,
      dateLabel: formatDate(p.firstPublishedDate, p.slug),
      richContent: normalizeRichContent(p.richContent),
    };
  } catch {
    return null;
  }
}
