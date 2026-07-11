import React, { useEffect, useRef, useState } from 'react';
import { Header, Footer, BackToTop } from './chrome';
import Home from './Home';
import Gallery from './Gallery';
import BlogIndex from './BlogIndex';
import BlogPost from './BlogPost';
import { fetchGallery, type GalleryItem } from '../lib/gallery';
import { fetchPosts, type PostListItem } from '../lib/blog';
import { BLOG_PATH } from '../lib/routes';

type Route = 'home' | 'gallery' | 'blog' | 'post';

const GRAIN =
  "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22160%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')";

function decodePath(): string {
  let p = location.pathname || '/';
  try { p = decodeURIComponent(p); } catch { /* keep */ }
  return p.replace(/\/+$/, '') || '/';
}

export function parseLoc(): { route: Route; deepNum: number | null } {
  const p = decodePath();
  if (p === '/') return { route: 'home', deepNum: null };
  const m = p.match(/^\/gallery\/(\d+)$/);
  if (m) return { route: 'gallery', deepNum: parseInt(m[1], 10) };
  if (p === '/gallery') return { route: 'gallery', deepNum: null };
  if (p === BLOG_PATH || p === '/בלוג') return { route: 'blog', deepNum: null };
  if (p.indexOf('/post/') === 0) return { route: 'post', deepNum: null };
  return { route: 'home', deepNum: null };
}

export default function App({ page, num }: { page?: Route; num?: number }) {
  const initial =
    page != null
      ? { route: page, deepNum: typeof num === 'number' ? num : null }
      : parseLoc();
  const [{ route, deepNum }, setNav] = useState(initial);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const prevPath = useRef(decodePath());

  // Navigate to a real path (SPA), keeping URLs crawlable/shareable.
  const go = (path: string, opts: { replace?: boolean; keepScroll?: boolean } = {}) => {
    try {
      if (opts.replace) history.replaceState(null, '', path);
      else history.pushState(null, '', path);
    } catch { location.href = path; return; }
    const next = parseLoc();
    setNav(next);
    const nextPath = decodePath();
    if (!opts.keepScroll && nextPath !== prevPath.current) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
    prevPath.current = nextPath;
  };

  useEffect(() => {
    const onPop = () => {
      const next = parseLoc();
      setNav(next);
      prevPath.current = decodePath();
    };
    window.addEventListener('popstate', onPop);

    // Intercept internal <a> clicks for SPA navigation (real hrefs stay for SEO/accessibility).
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement)?.closest?.('a');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      const target = a.getAttribute('target');
      if (!href || target === '_blank' || a.hasAttribute('download')) return;
      // only same-origin, non-mailto/tel, and not the media links
      if (/^(https?:)?\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return;
      if (!href.startsWith('/')) return;
      e.preventDefault();
      const clean = href.replace(/\/+$/, '') || '/';
      if (decodePath() === clean) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      go(clean);
    };
    document.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('popstate', onPop);
      document.removeEventListener('click', onClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [gi, ps] = await Promise.all([fetchGallery(), fetchPosts()]);
        if (!alive) return;
        setItems(gi);
        setPosts(ps);
      } catch (e) {
        if (alive) setError(true);
        // eslint-disable-next-line no-console
        console.error('Failed to load Wix data', e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          opacity: 0.05,
          mixBlendMode: 'multiply',
          backgroundImage: GRAIN,
        }}
      />
      <Header route={route} />

      <main style={{ flex: 1, position: 'relative', zIndex: 2 }}>
        {route === 'home' && <Home items={items} posts={posts} />}
        {route === 'gallery' && <Gallery items={items} deepNum={deepNum} navigate={go} />}
        {route === 'blog' && <BlogIndex />}
        {route === 'post' && <BlogPost />}

        {loading && (route === 'home' || route === 'gallery') && items.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--s5) 24px', color: 'var(--ink-soft)', fontFamily: 'var(--sans)' }}>
            טוען…
          </div>
        )}
        {error && items.length === 0 && (route === 'home' || route === 'gallery') && (
          <div style={{ textAlign: 'center', padding: 'var(--s5) 24px', color: 'var(--ink-soft)', fontFamily: 'var(--sans)' }}>
            אירעה שגיאה בטעינת האוסף. נסו לרענן את הדף.
          </div>
        )}
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
