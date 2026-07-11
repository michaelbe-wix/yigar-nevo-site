import React, { useEffect, useRef } from 'react';

function applyReveal(el: HTMLElement, delay: number) {
  el.style.animation = `fadeUp .6s cubic-bezier(.2,.6,.2,1) ${delay}ms both`;
  el.style.opacity = '';
}

type RevealProps = {
  as?: keyof JSX.IntrinsicElements;
  delay?: number;
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>;

/** Reveal-on-scroll: in-view now → reveal immediately; below fold → fadeUp on entry;
 *  honours prefers-reduced-motion and has a dead-observer safety fallback. */
export function Reveal({ as = 'div', delay = 0, children, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce =
      typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof IntersectionObserver === 'undefined') {
      el.style.opacity = '1';
      return;
    }
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || 800;
    if (r.top < vh && r.bottom > -40) {
      applyReveal(el, delay);
      return;
    }
    el.style.opacity = '0';
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            applyReveal(en.target as HTMLElement, delay);
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: '0px 0px -6% 0px' }
    );
    io.observe(el);
    const fb = window.setTimeout(() => {
      if (el.style.opacity === '0') applyReveal(el, delay);
    }, 1800);
    return () => {
      io.disconnect();
      window.clearTimeout(fb);
    };
  }, []);
  return React.createElement(as, { ref: ref as any, 'data-reveal': '', ...rest }, children);
}

/** Image inside a frame with a shimmer skeleton behind it that fades out once the image loads. */
export function SkeletonImg({
  src,
  alt,
  imgClassName,
  imgStyle,
}: {
  src: string;
  alt: string;
  imgClassName?: string;
  imgStyle?: React.CSSProperties;
}) {
  const skelRef = useRef<HTMLDivElement | null>(null);
  return (
    <>
      <div
        ref={skelRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(110deg,var(--paper-deep) 30%,#EBE3D6 50%,var(--paper-deep) 70%)',
          backgroundSize: '220% 100%',
          animation: 'shimmer 1.5s ease-in-out infinite',
          transition: 'opacity .4s ease',
        }}
      />
      <img
        src={src}
        alt={alt}
        decoding="async"
        loading="lazy"
        className={imgClassName}
        onLoad={() => {
          if (skelRef.current) skelRef.current.style.opacity = '0';
        }}
        style={{ position: 'relative', zIndex: 1, ...imgStyle }}
      />
    </>
  );
}

export function copyLink(e: React.MouseEvent<HTMLButtonElement>, url: string) {
  try {
    if (navigator.clipboard) navigator.clipboard.writeText(url);
  } catch {
    /* ignore */
  }
  const b = e && (e.currentTarget as HTMLButtonElement);
  if (b) {
    const old = b.textContent || '';
    b.textContent = 'הקישור הועתק ✓';
    window.setTimeout(() => {
      b.textContent = old;
    }, 1600);
  }
}

export function shareWa(text: string, url: string) {
  window.open('https://wa.me/?text=' + encodeURIComponent(text + '\n' + url), '_blank');
}

/** WhatsApp glyph, inherits the button's text/border color via currentColor. */
export function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export const baseUrl = () =>
  typeof location !== 'undefined' ? location.origin + location.pathname : '';
