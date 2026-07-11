import React, { useEffect, useState } from 'react';
import { Reveal } from './helpers';
import { fetchPosts, POST, type PostListItem } from '../lib/blog';

export default function BlogIndex() {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchPosts()
      .then((p) => {
        if (alive) setPosts(p);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section style={{ background: 'var(--paper)' }}>
      <div style={{ maxWidth: 'var(--wrap)', margin: '0 auto', padding: 'var(--s5) 24px var(--s6)' }}>
        <Reveal style={{ borderBottom: '1px solid var(--line)', paddingBottom: 26, marginBottom: 'var(--s4)' }}>
          <span style={{ fontFamily: 'var(--sans)', fontWeight: 600, letterSpacing: '.2em', fontSize: 12, color: 'var(--terra)' }}>
            כתבות וסיפורים
          </span>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 'clamp(32px,5vw,52px)', margin: '6px 0 12px' }}>בלוג</h1>
          <p style={{ maxWidth: '60ch', color: 'var(--ink-soft)', fontSize: 18, margin: 0 }}>
            סיפורים על הפריטים שבאוסף, מקורם והשימוש בהם בארץ ישראל של פעם.
          </p>
        </Reveal>

        {loading && posts.length === 0 && (
          <div style={{ color: 'var(--ink-soft)', fontFamily: 'var(--sans)', padding: 'var(--s4) 0' }}>טוען…</div>
        )}

        <div style={{ display: 'grid', gap: 'var(--s4)' }}>
          {posts.map((post) => (
            <Reveal
              key={post.slug}
              as="a"
              {...({ href: '/post/' + post.slug } as any)}
              className="yn-feature"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))',
                gap: 0,
                background: 'var(--card)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                color: 'var(--ink)',
                boxShadow: '0 1px 2px rgba(43,38,32,.04)',
              }}
            >
              <div style={{ position: 'relative', minHeight: 300, background: 'var(--paper-deep)' }}>
                <img src={post.cover} alt={post.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '38px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--ink-soft)', letterSpacing: '.02em' }}>{post.dateLabel}</span>
                <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 'clamp(24px,3vw,32px)', lineHeight: 1.25, margin: '10px 0 14px' }}>
                  {post.title}
                </h2>
                <p style={{ color: 'var(--ink-soft)', fontSize: 17, lineHeight: 1.65, margin: '0 0 18px' }}>{post.excerpt || POST.excerpt}</p>
                <span style={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--terra)', fontSize: 17 }}>קרא עוד ←</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
