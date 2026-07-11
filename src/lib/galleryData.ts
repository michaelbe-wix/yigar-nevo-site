// Framework-agnostic gallery data helpers — safe to import from both the browser
// (React app, via the SDK) and the server (Astro pages, via REST). No browser-only APIs.

export interface GalleryItem {
  num: number;
  title: string;
  cat: string;
  desc: string;
  thumb: string;
  full: string;
}

// Category keyword table — ported verbatim from the design prototype.
export const CATS: { key: string; label: string; kw: string[] }[] = [
  { key: 'tiles', label: 'רעפים ואריחים', kw: ['רעף', 'רעפי', 'אריח', 'רוכב'] },
  { key: 'mill', label: 'אבני ריחיים', kw: ['ריחיים', 'ריחים', 'כתישה', 'גת '] },
  { key: 'anvil', label: 'סדנים ומסגרות', kw: ['סדן', 'פטיש', 'מלחצי', 'מסגר', 'נפח', 'מסרק', 'מנפץ'] },
  { key: 'weights', label: 'משקלות', kw: ['משקל', 'משקול', 'אוקה', 'רוטל', 'מאזנ', 'מדליו'] },
  { key: 'taps', label: 'ברזים', kw: ['ברז'] },
  { key: 'jugs', label: 'כדים וכלי חרס', kw: ['כד', 'צנצנת', 'אדנית', 'ספל', 'אגיר', 'סמובר', 'פרימוס', 'שוקת', 'חלב', 'כלי'] },
  { key: 'garden', label: 'הגינה והבית', kw: ['גינה', 'ריצפ', 'רצפ', 'קיר', 'חומה', 'כניס', 'מבט', 'פינה', 'זית', 'צינור', 'שרשרת', 'מרצפ', 'ריצוף', 'גדר'] },
];

export function parseImageRef(ref: string): { mediaId: string; ext: string; name: string } | null {
  if (!ref) return null;
  let s = ref.trim().replace(/^wix:image:\/\/v1\//, '').split('#')[0];
  const slash = s.indexOf('/');
  const mediaId = slash >= 0 ? s.slice(0, slash) : s;
  const encName = slash >= 0 ? s.slice(slash + 1) : '';
  if (!mediaId) return null;
  const ext = (mediaId.split('.').pop() || 'jpg').toLowerCase();
  let name = '';
  try { name = decodeURIComponent(encName); } catch { name = encName; }
  return { mediaId, ext, name };
}

export const thumbUrl = (mediaId: string, ext: string) =>
  `https://static.wixstatic.com/media/${mediaId}/v1/fill/w_760,h_570,al_c,q_80,enc_auto/file.${ext}`;
export const fullUrl = (mediaId: string, ext: string) =>
  `https://static.wixstatic.com/media/${mediaId}/v1/fit/w_1700,h_1700,q_90,enc_auto/file.${ext}`;

export function parseTitle(fileName: string, slugId: number): string {
  const base = fileName.replace(/\.(jpe?g|png)$/i, '').trim();
  if (!base) return String(slugId || '');
  let m = base.match(/^(\d+)\s+(.+)$/);
  if (m) return m[2].trim();
  m = base.match(/^(.+?)\s+(\d+)$/);
  if (m) return m[1].trim();
  return base;
}

export function categoryOf(title: string): string {
  const c = CATS.find((c) => c.kw.some((k) => title.indexOf(k) !== -1));
  return c ? c.key : 'other';
}

/** Map one raw CMS row (SDK item or REST `data` object) to a GalleryItem. */
export function mapRow(row: any): GalleryItem | null {
  const d = row?.data ?? row ?? {};
  const slugId = Number(d.slugId ?? d.photoName ?? 9999);
  const img = parseImageRef(d.image || '');
  if (!img) return null;
  const parsedTitle = parseTitle(img.name, slugId) || String(d.photoName || slugId);
  // Title & description both come from the CMS (source of truth). Title falls
  // back to the filename-derived name for any row not yet backfilled; a blank
  // description in the CMS simply renders no description. Category & search
  // still derive from the filename (below), so filtering is unaffected.
  const title = (typeof d.title === 'string' && d.title.trim()) ? d.title.trim() : parsedTitle;
  const desc = d.description || '';
  return {
    num: Number.isFinite(slugId) ? slugId : 9999,
    title,
    cat: categoryOf(parsedTitle),
    desc,
    thumb: thumbUrl(img.mediaId, img.ext),
    full: fullUrl(img.mediaId, img.ext),
  };
}

// ---- server-side fetch (Astro pages) via REST + anonymous visitor token ----
import { CLIENT_ID } from './wix';

let _cache: GalleryItem[] | null = null;

export async function fetchGalleryServer(): Promise<GalleryItem[]> {
  if (_cache) return _cache;
  try {
    const tokRes = await fetch('https://www.wixapis.com/oauth2/token', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ clientId: CLIENT_ID, grantType: 'anonymous' }),
    });
    const tok = (await tokRes.json()).access_token as string;
    const qRes = await fetch('https://www.wixapis.com/wix-data/v2/items/query', {
      method: 'POST',
      headers: { authorization: tok, 'content-type': 'application/json' },
      body: JSON.stringify({
        dataCollectionId: 'GardenCollectionImages',
        query: { sort: [{ fieldName: 'sort', order: 'ASC' }], paging: { limit: 100 } },
      }),
    });
    const rows: any[] = (await qRes.json()).dataItems || [];
    _cache = rows.map(mapRow).filter(Boolean).sort((a, b) => (a as GalleryItem).num - (b as GalleryItem).num) as GalleryItem[];
  } catch {
    _cache = [];
  }
  return _cache;
}

export async function getItemServer(num: number): Promise<GalleryItem | null> {
  const items = await fetchGalleryServer();
  return items.find((i) => i.num === num) || null;
}
