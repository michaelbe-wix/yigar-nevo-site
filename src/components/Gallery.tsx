import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { GalleryItem } from '../lib/gallery';
import { CATS } from '../lib/gallery';
import { Reveal, SkeletonImg } from './helpers';
import Lightbox from './Lightbox';

type View = 'large' | 'regular' | 'dense' | 'masonry';

type NavFn = (path: string, opts?: { replace?: boolean; keepScroll?: boolean }) => void;

export default function Gallery({
  items,
  deepNum,
  navigate,
}: {
  items: GalleryItem[];
  deepNum: number | null;
  navigate: NavFn;
}) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [view, setView] = useState<View>('regular');
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [swipeHint, setSwipeHint] = useState(false);
  const hintTimer = useRef<number | null>(null);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return items.filter(
      (it) =>
        (cat === 'all' || it.cat === cat) &&
        (!qq || it.title.toLowerCase().indexOf(qq) !== -1 || String(it.num).indexOf(qq) !== -1)
    );
  }, [items, q, cat]);

  const indexOfNum = (num: number) => {
    const i = filtered.findIndex((x) => x.num === num);
    return i >= 0 ? i : null;
  };

  // Deep-link / browser-nav sync: URL `#/gallery/<num>` drives the open item.
  // Depends on `items` too, so a direct load of `#/gallery/<num>` still opens once the
  // async CMS fetch resolves (the list is empty on the first render).
  useEffect(() => {
    setLightbox(deepNum != null ? indexOfNum(deepNum) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deepNum, items]);

  const preloadAround = (i: number) => {
    [i - 1, i + 1].forEach((k) => {
      const it = filtered[(k + filtered.length) % filtered.length];
      if (it) {
        const im = new Image();
        im.src = it.full;
      }
    });
  };
  const maybeSwipeHint = () => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouch) return;
    try {
      if (localStorage.getItem('yn_swipehint')) return;
    } catch {
      /* ignore */
    }
    setSwipeHint(true);
    try {
      localStorage.setItem('yn_swipehint', '1');
    } catch {
      /* ignore */
    }
    if (hintTimer.current) window.clearTimeout(hintTimer.current);
    hintTimer.current = window.setTimeout(() => setSwipeHint(false), 2600);
  };

  const open = (i: number) => {
    setLightbox(i);
    const it = filtered[i];
    if (it) navigate('/gallery/' + it.num, { keepScroll: true }); // push → Back closes the lightbox
    preloadAround(i);
    maybeSwipeHint();
  };
  const close = () => {
    setLightbox(null);
    setSwipeHint(false);
    navigate('/gallery', { keepScroll: true, replace: true });
  };
  const nav = (d: number) => {
    setLightbox((cur) => {
      if (cur == null) return cur;
      const n = (cur + d + filtered.length) % filtered.length;
      const it = filtered[n];
      if (it) navigate('/gallery/' + it.num, { keepScroll: true, replace: true });
      preloadAround(n);
      return n;
    });
    setSwipeHint(false);
  };

  // keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightbox == null) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') nav(-1);
      else if (e.key === 'ArrowRight') nav(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox, filtered]);

  // chips present in the data
  const chips = useMemo(() => {
    const present: Record<string, number> = {};
    items.forEach((it) => {
      present[it.cat] = (present[it.cat] || 0) + 1;
    });
    const list: { key: string; label: string }[] = [{ key: 'all', label: 'הכל' }];
    CATS.forEach((c) => {
      if (present[c.key]) list.push({ key: c.key, label: c.label });
    });
    if (present['other']) list.push({ key: 'other', label: 'שונות' });
    return list;
  }, [items]);

  const views: [View, string][] = [
    ['large', 'גדול'],
    ['regular', 'רגיל'],
    ['dense', 'צפוף'],
    ['masonry', 'פסיפס'],
  ];

  const sizes: Record<string, number> = { large: 380, regular: 300, dense: 210 };
  const isMason = view === 'masonry';
  const wrapStyle: React.CSSProperties = isMason
    ? { columns: '260px', columnGap: 22 }
    : {
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill,minmax(min(100%,${sizes[view] || 300}px),1fr))`,
        gap: 22,
      };

  const lbItem = lightbox != null ? filtered[lightbox] : null;

  return (
    <>
      <section style={{ background: 'var(--paper)' }}>
        <div style={{ maxWidth: 'var(--wrap)', margin: '0 auto', padding: 'var(--s5) 24px var(--s4)' }}>
          <Reveal>
            <span style={{ fontFamily: 'var(--sans)', fontWeight: 600, letterSpacing: '.2em', fontSize: 12, color: 'var(--terra)' }}>
              האוסף המלא
            </span>
            <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 'clamp(32px,5vw,52px)', margin: '6px 0 18px' }}>גלריה</h1>
            <p style={{ maxWidth: '66ch', color: 'var(--ink-soft)', fontSize: 18, margin: '0 0 26px' }}>
              אספנות עתיקות ודברים יפים מפעם — מרכז תמונות וסיפורים על אודות אוסף העתיקות של יגר נבו: כלי עבודה שנאספו (אבני ריחיים, סדנים, קלשוני עץ, משקולות, אנכים ועוד), רעפי מרסיי, ברזים, אריחים, צינורות חרס ועוד.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', borderTop: '1px solid var(--line)', paddingTop: 20 }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 240, maxWidth: 420 }}>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="חיפוש באוסף — שם או מספר קטלוגי…"
                  className="yn-search"
                  style={{
                    width: '100%',
                    fontFamily: 'var(--sans)',
                    fontSize: 16,
                    color: 'var(--ink)',
                    background: 'var(--card)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius)',
                    padding: '12px 44px 12px 16px',
                    outline: 'none',
                    transition: 'border-color .2s ease,box-shadow .2s ease',
                  }}
                />
                <span style={{ position: 'absolute', top: '50%', right: 15, transform: 'translateY(-50%)', color: 'var(--ink-soft)', fontSize: 16 }}>⌕</span>
              </div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--ink-soft)' }}>
                {filtered.length} / {items.length} פריטים
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
                {chips.map((c) => {
                  const on = c.key === cat;
                  return (
                    <button
                      key={c.key}
                      onClick={() => setCat(c.key)}
                      className="yn-chip"
                      style={{
                        padding: '8px 15px',
                        borderRadius: 999,
                        fontFamily: 'var(--sans)',
                        fontWeight: 600,
                        fontSize: 15,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        border: '1px solid ' + (on ? 'var(--terra)' : 'var(--line)'),
                        background: on ? 'var(--terra)' : 'var(--card)',
                        color: on ? '#FCF7EF' : 'var(--ink-soft)',
                      }}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 4, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 999, padding: 4 }}>
                {views.map(([key, label]) => {
                  const on = key === view;
                  return (
                    <button
                      key={key}
                      onClick={() => setView(key)}
                      className="yn-viewbtn"
                      style={{
                        padding: '6px 13px',
                        borderRadius: 999,
                        border: 'none',
                        background: on ? 'var(--terra)' : 'transparent',
                        color: on ? '#FCF7EF' : 'var(--ink-soft)',
                        fontFamily: 'var(--sans)',
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: 'pointer',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section style={{ background: 'var(--paper)' }}>
        <div style={{ maxWidth: 'var(--wrap)', margin: '0 auto', padding: '0 24px var(--s6)' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--s6) 24px', color: 'var(--ink-soft)' }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--ink)', marginBottom: 10 }}>לא נמצאו פריטים</div>
              <p style={{ margin: '0 0 18px' }}>נסו חיפוש אחר או קטגוריה אחרת.</p>
              <button
                onClick={() => {
                  setQ('');
                  setCat('all');
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: 999,
                  border: '1px solid var(--terra)',
                  background: 'var(--card)',
                  color: 'var(--terra)',
                  fontFamily: 'var(--sans)',
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: 'pointer',
                }}
              >
                ניקוי הסינון
              </button>
            </div>
          ) : (
            <div style={wrapStyle}>
              {filtered.map((it, i) => (
                <Reveal
                  key={it.num}
                  as="a"
                  delay={(i % 9) * 65}
                  {...({ href: `/gallery/${it.num}` } as any)}
                  onClick={(e: any) => {
                    // Real href → crawlable + shareable; intercept the click for the SPA lightbox.
                    e.preventDefault();
                    open(i);
                  }}
                  className="yn-galcard"
                  style={{
                    cursor: 'pointer',
                    color: 'var(--ink)',
                    textDecoration: 'none',
                    background: 'var(--card)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius)',
                    overflow: 'hidden',
                    boxShadow: '0 1px 2px rgba(43,38,32,.04)',
                    ...(isMason ? { breakInside: 'avoid', margin: '0 0 22px', display: 'block' } : {}),
                  }}
                >
                  <div
                    style={
                      isMason
                        ? { position: 'relative', overflow: 'hidden', background: 'var(--paper-deep)', minHeight: 170 }
                        : { position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: 'var(--paper-deep)' }
                    }
                  >
                    <SkeletonImg
                      src={it.thumb}
                      alt={it.title}
                      imgClassName="yn-galimg"
                      imgStyle={
                        isMason
                          ? { width: '100%', height: 'auto', display: 'block' }
                          : { width: '100%', height: '100%', objectFit: 'cover' }
                      }
                    />
                  </div>
                  <div style={{ padding: '13px 15px 16px', fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 17, lineHeight: 1.35, color: 'var(--ink)' }}>
                    {it.title}
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {lbItem ? (
        <Lightbox
          item={lbItem}
          pos={(lightbox as number) + 1}
          total={filtered.length}
          swipeHint={swipeHint}
          onClose={close}
          onPrev={() => nav(-1)}
          onNext={() => nav(1)}
        />
      ) : null}
    </>
  );
}
