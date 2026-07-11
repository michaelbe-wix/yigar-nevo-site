import React from 'react';
import { Reveal, SkeletonImg } from './helpers';
import type { GalleryItem } from '../lib/gallery';
import { type PostListItem } from '../lib/blog';
import { BLOG_PATH } from '../lib/routes';

const HERO =
  'https://static.wixstatic.com/media/3d441f_472a03087faa4484a7718dfe9f01837a~mv2.jpg/v1/fill/w_1900,h_1080,al_c,q_82,enc_auto/file.jpg';

const diamond = (mb = 0): React.CSSProperties => ({
  width: 8,
  height: 8,
  background: 'var(--terra)',
  transform: 'rotate(45deg)',
  display: 'inline-block',
  marginBottom: mb,
});

export default function Home({ items, posts }: { items: GalleryItem[]; posts: PostListItem[] }) {
  const wantNums = [6, 121, 112, 155];
  const highlights = wantNums
    .map((n) => items.find((x) => x.num === n))
    .filter(Boolean) as GalleryItem[];

  return (
    <>
      {/* Hero */}
      <section
        className="yn-hero"
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '74vh',
          display: 'flex',
          alignItems: 'flex-end',
          overflow: 'hidden',
          background: '#3a352c',
        }}
      >
        <img
          src={HERO}
          alt="הגינה של יגר נבו, רמת יוחנן"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, rgba(22,18,13,.92) 0%, rgba(22,18,13,.62) 46%, rgba(22,18,13,.3) 100%)',
          }}
        />
        <Reveal style={{ position: 'relative', maxWidth: 'var(--wrap)', width: '100%', margin: '0 auto', padding: '0 24px 58px' }}>
          <h1
            style={{
              fontFamily: 'var(--serif)',
              fontWeight: 700,
              color: '#FCF7EF',
              fontSize: 'clamp(34px,6vw,68px)',
              lineHeight: 1.12,
              margin: '0 0 18px',
              maxWidth: '16ch',
              textShadow: '0 2px 18px rgba(0,0,0,.6), 0 1px 3px rgba(0,0,0,.45)',
            }}
          >
            אספנות עתיקות ודברים יפים מפעם
          </h1>
          <p style={{ color: '#EADFCF', fontSize: 'clamp(17px,2vw,21px)', maxWidth: '52ch', margin: '0 0 26px', lineHeight: 1.6 }}>
            כלי עבודה, רעפים, כדי חרס וחפצי יומיום מארץ ישראל, שנאספו מאז שנות השישים ומוצגים בגינת הבית.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <a
              href="/gallery"
              className="yn-cta-primary"
              style={{
                background: 'var(--terra)',
                color: '#FCF7EF',
                fontFamily: 'var(--sans)',
                fontWeight: 600,
                fontSize: 17,
                padding: '13px 26px',
                borderRadius: 'var(--radius)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 9,
              }}
            >
              לגלריה
              <span className="yn-arrow">←</span>
            </a>
            <a
              href={BLOG_PATH}
              className="yn-cta-ghost"
              style={{
                background: 'rgba(252,247,239,.12)',
                color: '#FCF7EF',
                border: '1px solid rgba(252,247,239,.4)',
                fontFamily: 'var(--sans)',
                fontWeight: 600,
                fontSize: 17,
                padding: '13px 26px',
                borderRadius: 'var(--radius)',
              }}
            >
              לבלוג
            </a>
          </div>
        </Reveal>
      </section>

      {/* Intro */}
      <section style={{ background: 'var(--paper)' }}>
        <div style={{ maxWidth: 'var(--narrow)', margin: '0 auto', padding: 'var(--s6) 24px var(--s5)' }}>
          <Reveal style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 'var(--s4)' }}>
            <span style={{ height: 1, flex: 1, background: 'var(--line)' }} />
            <span style={diamond()} />
            <span style={{ fontFamily: 'var(--sans)', fontWeight: 600, letterSpacing: '.2em', fontSize: 12, color: 'var(--ink-soft)' }}>
              מעט על האוסף
            </span>
            <span style={diamond()} />
            <span style={{ height: 1, flex: 1, background: 'var(--line)' }} />
          </Reveal>
          <Reveal as="p" style={{ fontSize: 20, color: 'var(--ink)' }}>
            <span style={{ float: 'right', fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 66, lineHeight: 0.72, color: 'var(--terra)', margin: '8px 0 0 12px' }}>
              ה
            </span>
            פריטים שכאן נאספו על ידי החל משנות השישים של המאה הקודמת ולאורך שנים רבות. שנים אלו היו שנים בהן השתנו כלים רבים, תעשייתיים וביתיים. את כדי החרס וכלי קיבול אחרים החליף הפלסטיק. כנ״ל בקבוקי זכוכית ענקיים ששמשו לשימור נוזלים יקרים הוחלפו בכלים אחרים הנוחים למילוי וריקון, כדי חלב מברזל הוחלפו בכדי נירוסטה, אבני ריחיים ששימשו לטחינה הוחלפו במכונות חדשות ויעילות, עבודות נפחות הוחלפו מעבודה ידנית לפעולה מכנית ועוד ועוד.
          </Reveal>
          <Reveal as="p" style={{ fontSize: 20 }}>
            כל שהיה צריך בתקופה זו ובעיקר בשנים הראשונות שלה היה להתכופף ולהרים. וכך לאסוף את הכלים/חפצים שננטשו. האנשים לא יכלו להמשיך ולהחזיק בכלי הישן ששימש אותם שנים בכלי חדש מבלי לפנות מקום לכלי המחליף. גם לא היה מקום וגם לא צורך או סיבה.
          </Reveal>
          <Reveal as="p" style={{ fontSize: 20 }}>
            וכך, אספתי את כל הכלים, כלי עבודה (אבני ריחיים, סדנים, קלשוני עץ, משקלות, אנכים ועוד) או רעפים, ברזים, אריחים, צינורות חרס ועוד ועוד.
          </Reveal>
          <Reveal style={{ marginTop: 'var(--s5)', textAlign: 'center' }}>
            <span style={diamond(24)} />
            <p style={{ fontSize: 16, lineHeight: 1.6, fontWeight: 400, fontStyle: 'italic', color: 'var(--ink)', margin: '0 auto', textAlign: 'right' }}>
              כל הפריטים שכאן נמצאים בביתי, בגינתי, אינם למכירה. התצוגה שלהם היא לחוויה אסטטית נוסטלגית בלבד והציבור מוזמן.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Highlights + blog teaser */}
      <section style={{ background: 'var(--paper-deep)', borderTop: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 'var(--wrap)', margin: '0 auto', padding: 'var(--s6) 24px' }}>
          <Reveal style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 'var(--s4)', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontFamily: 'var(--sans)', fontWeight: 600, letterSpacing: '.2em', fontSize: 12, color: 'var(--terra)' }}>מן האוסף</span>
              <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 'clamp(28px,4vw,40px)', margin: '6px 0 0' }}>פריטים נבחרים</h2>
            </div>
            <a href="/gallery" style={{ fontFamily: 'var(--sans)', fontWeight: 600 }}>
              כל {items.length || 86} הפריטים ←
            </a>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 22 }}>
            {highlights.map((it, i) => (
              <Reveal
                key={it.num}
                as="a"
                delay={i * 70}
                {...({ href: `/gallery/${it.num}` } as any)}
                className="yn-card"
                style={{
                  display: 'block',
                  background: 'var(--card)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius)',
                  overflow: 'hidden',
                  boxShadow: '0 1px 2px rgba(43,38,32,.04)',
                  color: 'var(--ink)',
                }}
              >
                <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: 'var(--paper-deep)' }}>
                  <SkeletonImg
                    src={it.thumb}
                    alt={it.title}
                    imgClassName="yn-card-img"
                    imgStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: '13px 15px 15px', fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 17, lineHeight: 1.35 }}>
                  {it.title}
                </div>
              </Reveal>
            ))}
          </div>

          {posts.length > 0 && (
            <Reveal style={{ marginTop: 'var(--s5)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 14 }}>
                <span style={{ fontFamily: 'var(--sans)', fontWeight: 600, letterSpacing: '.2em', fontSize: 12, color: 'var(--terra)' }}>מן הבלוג</span>
                <a href={BLOG_PATH} style={{ fontFamily: 'var(--sans)', fontWeight: 600 }}>כל הרשומות ←</a>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,320px),1fr))', gap: 22 }}>
                {posts.map((p, i) => (
                  <Reveal
                    key={p.slug}
                    as="a"
                    delay={i * 70}
                    {...({ href: '/post/' + p.slug } as any)}
                    className="yn-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      background: 'var(--card)',
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--radius)',
                      overflow: 'hidden',
                      color: 'var(--ink)',
                      boxShadow: '0 1px 2px rgba(43,38,32,.04)',
                    }}
                  >
                    <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden', background: 'var(--paper-deep)' }}>
                      <img src={p.cover} alt={p.title} className="yn-card-img" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--ink-soft)' }}>{p.dateLabel}</span>
                      <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 'clamp(20px,2.2vw,24px)', lineHeight: 1.28, margin: '8px 0 10px' }}>
                        {p.title}
                      </h3>
                      <p
                        style={{
                          color: 'var(--ink-soft)',
                          fontSize: 16,
                          lineHeight: 1.6,
                          margin: '0 0 16px',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {p.excerpt}
                      </p>
                      <span style={{ marginTop: 'auto', fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--terra)' }}>קרא עוד ←</span>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </section>
    </>
  );
}
