import React, { useEffect, useState } from 'react';
import { Reveal, copyLink, shareWa, WhatsAppIcon } from './helpers';
import { fetchPostContent, POST, type PostContent } from '../lib/blog';
import { BLOG_PATH } from '../lib/routes';

function currentSlug(): string {
  const p = (typeof location !== 'undefined' ? location.pathname : '') || '';
  const m = p.match(/^\/post\/(.+)$/);
  if (!m) return '';
  try {
    return decodeURIComponent(m[1].replace(/\/+$/, ''));
  } catch {
    return m[1].replace(/\/+$/, '');
  }
}

export default function BlogPost() {
  const [post, setPost] = useState<PostContent | null>(null);
  const [loading, setLoading] = useState(true);
  const slug = typeof location !== 'undefined' ? currentSlug() : '';

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchPostContent(slug)
      .then((p) => {
        if (!alive) return;
        setPost(p);
        // Wix's headless SEO injects a generic "<Page> | <Site>" title for this route;
        // set the real post title client-side so the browser tab and JS-rendered title are correct.
        if (p?.title) {
          try {
            document.title = p.title;
          } catch {
            /* ignore */
          }
        }
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [slug]);

  // Manufacturer / section jump targets, derived from the post's real level-2 headings
  // (skip the "רשימת מפעלים" intro heading).
  const title = post?.title || POST.title;
  // Short breadcrumb tail from the current post's title (text before the "— …" subtitle).
  const crumb = (post?.title || '').split(/\s[—–-]\s/)[0].trim();
  const dateLabel = post?.dateLabel || POST.dateLabel;
  const postUrl = (typeof location !== 'undefined' ? location.origin : '') + '/post/' + slug;

  return (
    <article style={{ background: 'var(--paper)' }}>
      <div style={{ maxWidth: 'var(--narrow)', margin: '0 auto', padding: 'var(--s4) 24px var(--s6)' }}>
        <Reveal style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink-soft)', marginBottom: 18 }}>
          <a href={BLOG_PATH} style={{ color: 'var(--ink-soft)' }}>בלוג</a> <span style={{ opacity: 0.5 }}>/</span> {crumb}
        </Reveal>
        <Reveal as="header" style={{ marginBottom: 'var(--s4)' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--terra)', letterSpacing: '.03em' }}>{dateLabel}</span>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 'clamp(30px,4.6vw,46px)', lineHeight: 1.18, margin: '10px 0 0' }}>{title}</h1>
        </Reveal>

        <Reveal style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 'var(--s4)' }}>
          <button className="yn-post-wa" onClick={() => shareWa(title, postUrl)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 999, border: '1px solid var(--olive)', background: 'transparent', color: 'var(--olive)', fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            <WhatsAppIcon size={16} />
            שיתוף בוואטסאפ
          </button>
          <button className="yn-post-copy" onClick={(e) => copyLink(e, postUrl)} style={{ padding: '9px 16px', borderRadius: 999, border: '1px solid var(--line)', background: 'transparent', color: 'var(--ink-soft)', fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>העתקת קישור</button>
        </Reveal>

        {loading && !post && <div style={{ color: 'var(--ink-soft)', fontFamily: 'var(--sans)', padding: 'var(--s4) 0' }}>טוען…</div>}

        {post?.richContent && (
          <Reveal>
            <div className="yn-ricos" dir="rtl">
              <RicosBody content={post.richContent} />
            </div>
          </Reveal>
        )}

        <Reveal style={{ marginTop: 'var(--s5)', paddingTop: 'var(--s3)', borderTop: '1px solid var(--line)' }}>
          <a href={BLOG_PATH} style={{ fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 17 }}>חזרה לבלוג →</a>
        </Reveal>
      </div>
    </article>
  );
}

// Lazy-load the heavy Ricos viewer only on the post page.
const RichContentViewer = React.lazy(() => import('./RichContentViewer'));
function RicosBody({ content }: { content: any }) {
  return (
    <React.Suspense fallback={<div style={{ color: 'var(--ink-soft)', fontFamily: 'var(--sans)' }}>טוען תוכן…</div>}>
      <RichContentViewer content={content} />
    </React.Suspense>
  );
}
