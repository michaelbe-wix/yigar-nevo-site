// Site-wide SEO constants. Per-page tags are injected by the Wix integration
// (dashboard for static pages; Wix blog item-page SEO for the post). These
// constants are used by the sitemap and route helpers.

// Final production host — the sitemap emits absolute URLs here so they're correct
// once the domain is connected (matches the old site's www canonical).
export const BASE_URL = 'https://www.yigarnevo.com';
export const SITE_NAME = 'אספנות ודברים יפים';

// The blog post's slug — kept identical to the old indexed URL so /post/<slug> matches
// yigarnevo.com's existing inbound links and search-indexed URL.
export const POST_SLUG = 'רעפי-מרסיי-רעפים-שהובאו-לארץ-בין-השנים-1890-1935-1';

export const abs = (path: string) => BASE_URL + (path === '/' ? '' : path);
