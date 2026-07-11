import React, { useEffect, useState } from 'react';
import { Reveal, copyLink, shareWa, WhatsAppIcon } from './helpers';
import { fetchPostContent, type PostContent } from '../lib/blog';
import { BLOG_PATH } from '../lib/routes';

// Shimmer skeleton shared with the SkeletonImg idiom (see helpers.tsx / @keyframes shimmer).
const shimmer: React.CSSProperties = {
  background: 'linear-gradient(110deg,var(--paper-deep) 30%,#EBE3D6 50%,var(--paper-deep) 70%)',
  backgroundSize: '220% 100%',
  animation: 'shimmer 1.5s ease-in-out infinite',
  borderRadius: 6,
};

function Bar({ w = '100%', h = 16, style }: { w?: number | string; h?: number; style?: React.CSSProperties }) {
  return <div aria-hidden="true" style={{ ...shimmer, width: w, height: h, ...style }} />;
}

/** Placeholder for the post body — a stack of shimmer text lines. */
function BodySkeleton() {
  const widths = ['100%', '96%', '100%', '58%', '100%', '92%', '100%', '70%'];
  return (
    <div aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 'var(--s3)' }}>
      {widths.map((w, i) => (
        <Bar key={i} w={w} h={18} />
      ))}
    </div>
  );
}

/** Full loading state: title/date/share/body placeholders, so no post ever flashes another post's title. */
function PostSkeleton() {
  return (
    <div>
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>טוען…</span>
      <div style={{ marginBottom: 'var(--s4)' }}>
        <Bar w={92} h={13} style={{ marginBottom: 18 }} />
        <Bar w="88%" h={38} style={{ marginBottom: 12, borderRadius: 8 }} />
        <Bar w="52%" h={38} style={{ borderRadius: 8 }} />
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 'var(--s4)' }}>
        <Bar w={158} h={38} style={{ borderRadius: 999 }} />
        <Bar w={122} h={38} style={{ borderRadius: 999 }} />
      </div>
      <BodySkeleton />
    </div>
  );
}

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
    // Clear the previous post so a slug change shows the skeleton, never the
    // prior post's title/body while the new one loads.
    setPost(null);
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

  const title = post?.title || '';
  // Short breadcrumb tail from the current post's title (text before the "— …" subtitle).
  const crumb = title.split(/\s[—–-]\s/)[0].trim();
  const dateLabel = post?.dateLabel || '';
  const postUrl = (typeof location !== 'undefined' ? location.origin : '') + '/post/' + slug;

  return (
    <article style={{ background: 'var(--paper)' }}>
      <div style={{ maxWidth: 'var(--narrow)', margin: '0 auto', padding: 'var(--s4) 24px var(--s6)' }}>
        <Reveal style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink-soft)', marginBottom: 18 }}>
          <a href={BLOG_PATH} style={{ color: 'var(--ink-soft)' }}>בלוג</a>
          {post ? <> <span style={{ opacity: 0.5 }}>/</span> {crumb}</> : null}
        </Reveal>

        {post ? (
          <>
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

            {post.richContent && (
              <Reveal>
                <div className="yn-ricos" dir="rtl">
                  <RicosBody content={post.richContent} />
                </div>
              </Reveal>
            )}

            <Reveal style={{ marginTop: 'var(--s5)', paddingTop: 'var(--s3)', borderTop: '1px solid var(--line)' }}>
              <a href={BLOG_PATH} style={{ fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 17 }}>חזרה לבלוג →</a>
            </Reveal>
          </>
        ) : loading ? (
          <PostSkeleton />
        ) : (
          <div style={{ color: 'var(--ink-soft)', fontFamily: 'var(--sans)', padding: 'var(--s4) 0' }}>
            אירעה שגיאה בטעינת הכתבה.{' '}
            <a href={BLOG_PATH} style={{ fontWeight: 600 }}>חזרה לבלוג</a>
          </div>
        )}
      </div>
    </article>
  );
}

// Lazy-load the heavy Ricos viewer only on the post page.
const RichContentViewer = React.lazy(() => import('./RichContentViewer'));
function RicosBody({ content }: { content: any }) {
  return (
    <React.Suspense fallback={<BodySkeleton />}>
      <RichContentViewer content={content} />
    </React.Suspense>
  );
}
