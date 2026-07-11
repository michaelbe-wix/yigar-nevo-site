import React, { useEffect, useRef, useState } from 'react';

type Route = 'home' | 'gallery' | 'blog' | 'post';

export function Header({ route }: { route: Route }) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const onScroll = () => {
      if (ref.current)
        ref.current.style.boxShadow =
          window.scrollY > 8 ? '0 6px 26px rgba(43,38,32,.08)' : 'none';
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links: { href: string; label: string; on: boolean }[] = [
    { href: '/', label: 'דף הבית', on: route === 'home' },
    { href: '/gallery', label: 'גלריה', on: route === 'gallery' },
    { href: '/blog', label: 'בלוג', on: route === 'blog' || route === 'post' },
  ];

  return (
    <header
      ref={ref}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(250,246,240,.82)',
        backdropFilter: 'saturate(1.15) blur(12px)',
        WebkitBackdropFilter: 'saturate(1.15) blur(12px)',
        borderBottom: '1px solid var(--line)',
        transition: 'box-shadow .3s ease',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--wrap)',
          margin: '0 auto',
          padding: '13px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px 20px',
          flexWrap: 'wrap',
        }}
      >
        <a href="/" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05, gap: 3, color: 'var(--ink)' }}>
          <span style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 21, letterSpacing: '.01em' }}>
            האוסף של יגר נבו
          </span>
          <span style={{ fontFamily: 'var(--sans)', fontWeight: 500, fontSize: 11, letterSpacing: '.16em', color: 'var(--ink-soft)' }}>
            אספנות עתיקות ודברים יפים מפעם
          </span>
        </a>
        <nav
          style={{
            display: 'flex',
            gap: 22,
            alignItems: 'center',
            fontFamily: 'var(--sans)',
            fontWeight: 600,
            fontSize: 17,
            whiteSpace: 'nowrap',
          }}
        >
          {links.map((l) => (
            <a key={l.href} href={l.href} className={'yn-nav-link' + (l.on ? ' active' : '')}>
              {l.label}
              <span className="yn-underline" />
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  const linkCol = { color: '#B7AF9F' } as React.CSSProperties;
  return (
    <footer style={{ position: 'relative', zIndex: 2, background: 'var(--ink)', color: '#E9E1D4' }}>
      <div
        style={{
          maxWidth: 'var(--wrap)',
          margin: '0 auto',
          padding: 'var(--s5) 24px var(--s4)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,240px),1fr))',
          gap: '32px 40px',
          alignItems: 'start',
        }}
      >
        <div>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 24, color: '#FCF7EF', marginBottom: 6 }}>
            אספנות עתיקות ודברים יפים מפעם
          </div>
          <div style={{ color: '#B7AF9F', fontSize: 16 }}>יְגַר נבו, רמת יוחנן</div>
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontFamily: 'var(--sans)', fontWeight: 600, letterSpacing: '.15em', fontSize: 11, color: '#8F887A', marginBottom: 6 }}>
            מייל
          </div>
          <a href="mailto:ny4060@gmail.com" style={{ color: '#FCF7EF', fontFamily: 'var(--mono)', fontSize: 16 }}>
            <bdi dir="ltr">ny4060@gmail.com</bdi>
          </a>
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(233,225,212,.14)' }}>
        <div
          style={{
            maxWidth: 'var(--wrap)',
            margin: '0 auto',
            padding: '18px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ color: '#8F887A', fontSize: 14 }}>כל הזכויות שמורות — ליגר נבו ©</span>
          <nav style={{ display: 'flex', gap: 20, fontFamily: 'var(--sans)', fontWeight: 500, fontSize: 14 }}>
            <a href="/" style={linkCol}>דף הבית</a>
            <a href="/gallery" style={linkCol}>גלריה</a>
            <a href="/blog" style={linkCol}>בלוג</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 560);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="חזרה למעלה"
      className="yn-topbtn"
      style={{
        position: 'fixed',
        bottom: 22,
        left: 22,
        zIndex: 45,
        width: 48,
        height: 48,
        borderRadius: '50%',
        border: '1px solid var(--line)',
        background: 'var(--card)',
        color: 'var(--terra)',
        fontSize: 20,
        cursor: 'pointer',
        boxShadow: '0 6px 20px rgba(43,38,32,.15)',
        opacity: show ? 1 : 0,
        pointerEvents: show ? 'auto' : 'none',
        transform: show ? 'none' : 'translateY(8px)',
      }}
    >
      ↑
    </button>
  );
}
