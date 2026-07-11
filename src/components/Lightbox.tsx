import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { GalleryItem } from '../lib/gallery';
import { copyLink, shareWa, WhatsAppIcon } from './helpers';

export default function Lightbox({
  item,
  pos,
  total,
  swipeHint,
  onClose,
  onPrev,
  onNext,
}: {
  item: GalleryItem;
  pos: number; // 1-based
  total: number;
  swipeHint: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const multiTouch = useRef(false);
  const [full, setFull] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  // Focus the close button on open, and return focus to whatever opened the
  // lightbox (e.g. the gallery card) once it closes.
  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    try {
      closeRef.current?.focus({ preventScroll: true });
    } catch {
      closeRef.current?.focus();
    }
    return () => {
      prevFocus?.focus?.();
    };
  }, []);

  // iOS-safe background scroll-lock: fix the body in place while the overlay
  // is open (position:fixed avoids the iOS Safari rubber-band/scroll-through
  // bug that `overflow:hidden` alone doesn't fully prevent), then restore the
  // scroll position on close.
  useEffect(() => {
    const body = document.body;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    const y = window.scrollY;
    body.style.position = 'fixed';
    body.style.top = `-${y}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      window.scrollTo(0, y);
    };
  }, []);

  const itemUrl = (typeof location !== 'undefined' ? location.origin : '') + `/gallery/${item.num}`;

  return createPortal(
    <div
      ref={dialogRef}
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key !== 'Tab') return;
        const root = dialogRef.current;
        if (!root) return;
        const focusable = Array.from(root.querySelectorAll<HTMLElement>('button, a[href]')).filter(
          (el) => !el.hasAttribute('disabled') && el.tabIndex !== -1
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const activeEl = document.activeElement as HTMLElement | null;
        if (e.shiftKey) {
          if (activeEl === first || !root.contains(activeEl)) {
            e.preventDefault();
            last.focus();
          }
        } else if (activeEl === last || !root.contains(activeEl)) {
          e.preventDefault();
          first.focus();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label="תצוגת פריט מהאוסף"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: full ? 'rgba(18,15,11,.97)' : 'rgba(24,21,16,.9)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'safe center',
        overflowY: 'auto',
        padding: full ? 12 : 24,
        animation: 'overlayIn .22s ease-out',
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        ref={closeRef}
        aria-label="סגור"
        className="yn-close"
        style={{
          position: 'absolute',
          top: 18,
          left: 18,
          width: 46,
          height: 46,
          borderRadius: '50%',
          border: '1px solid rgba(252,247,239,.25)',
          background: 'rgba(252,247,239,.08)',
          color: '#FCF7EF',
          fontSize: 22,
          cursor: 'pointer',
          transition: 'background .2s ease',
          zIndex: 4,
        }}
      >
        ✕
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setFull((f) => !f);
        }}
        aria-label={full ? 'יציאה ממסך מלא' : 'תצוגת מסך מלא'}
        title={full ? 'יציאה ממסך מלא' : 'תצוגת מסך מלא'}
        className="yn-close"
        style={{
          position: 'absolute',
          top: 18,
          left: 74,
          width: 46,
          height: 46,
          borderRadius: '50%',
          border: '1px solid rgba(252,247,239,.25)',
          background: full ? 'rgba(252,247,239,.2)' : 'rgba(252,247,239,.08)',
          color: '#FCF7EF',
          fontSize: 20,
          cursor: 'pointer',
          transition: 'background .2s ease',
          zIndex: 4,
        }}
      >
        {full ? (
          // exit fullscreen — arrows point inward
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3" />
          </svg>
        ) : (
          // enter fullscreen — arrows point outward
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
          </svg>
        )}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        aria-label="הבא"
        className="yn-lbnav yn-lbbtn"
        style={{
          position: 'absolute',
          top: '50%',
          right: 18,
          transform: 'translateY(-50%)',
          direction: 'ltr',
          width: 52,
          height: 52,
          borderRadius: '50%',
          border: '1px solid rgba(252,247,239,.5)',
          background: 'rgba(20,17,12,.6)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          color: '#FCF7EF',
          fontSize: 24,
          cursor: 'pointer',
          zIndex: 3,
        }}
      >
        ›
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        aria-label="הקודם"
        className="yn-lbnav yn-lbbtn"
        style={{
          position: 'absolute',
          top: '50%',
          left: 18,
          transform: 'translateY(-50%)',
          direction: 'ltr',
          width: 52,
          height: 52,
          borderRadius: '50%',
          border: '1px solid rgba(252,247,239,.5)',
          background: 'rgba(20,17,12,.6)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          color: '#FCF7EF',
          fontSize: 24,
          cursor: 'pointer',
          zIndex: 3,
        }}
      >
        ‹
      </button>
      <div
        className="yn-lbrow"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => {
          multiTouch.current = e.touches.length > 1;
          if (e.touches.length > 1) return;
          const t = e.changedTouches[0];
          touch.current = { x: t.clientX, y: t.clientY };
        }}
        onTouchEnd={(e) => {
          if (!touch.current) return;
          const t = e.changedTouches[0];
          const dx = t.clientX - touch.current.x;
          const dy = t.clientY - touch.current.y;
          touch.current = null;
          // Never navigate mid-pinch/pan: a multi-touch gesture, or any drag
          // while the image is zoomed in, must not also trigger prev/next.
          if (multiTouch.current || zoomed) return;
          if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) {
            if (dx < 0) onNext();
            else onPrev();
          }
        }}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: full ? 0 : '24px 34px',
          maxWidth: full ? '100%' : 1200,
          width: '100%',
          touchAction: 'pan-y',
        }}
      >
        <div
          style={{
            flex: full ? '1 1 100%' : '1 1 440px',
            minWidth: 'min(100%,300px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LbImage
            key={item.num}
            src={item.full}
            alt={item.title}
            maxH={full ? '96vh' : '74vh'}
            full={full}
            onZoomChange={setZoomed}
          />
        </div>
        <div
          style={{
            display: full ? 'none' : 'block',
            flex: '0 1 340px',
            minWidth: 'min(100%,260px)',
            maxHeight: '74vh',
            overflow: 'auto',
            color: '#FCF7EF',
            fontFamily: 'var(--sans)',
            textAlign: 'right',
          }}
        >
          <h3 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.3, margin: '0 0 6px' }}>{item.title}</h3>
          <span style={{ display: 'block', fontSize: 13, color: '#B7AF9F', letterSpacing: '.03em', margin: '0 0 16px' }}>
            {pos} / {total}
          </span>
          {item.desc ? (
            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#DED5C7', margin: 0 }}>{item.desc}</p>
          ) : null}
          <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
            <button
              className="yn-share-wa"
              onClick={() => shareWa(item.title + (item.desc ? ' — ' + item.desc : ''), itemUrl)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 15px',
                borderRadius: 999,
                border: '1px solid rgba(252,247,239,.4)',
                background: 'transparent',
                color: '#EDE6D8',
                fontFamily: 'var(--sans)',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              <WhatsAppIcon size={16} />
              שיתוף בוואטסאפ
            </button>
            <button
              className="yn-share-copy"
              onClick={(e) => copyLink(e, itemUrl)}
              style={{
                padding: '9px 15px',
                borderRadius: 999,
                border: '1px solid rgba(252,247,239,.4)',
                background: 'transparent',
                color: '#EDE6D8',
                fontFamily: 'var(--sans)',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              העתקת קישור
            </button>
          </div>
        </div>
        {swipeHint ? (
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(20,17,12,.75)',
              color: '#FCF7EF',
              fontFamily: 'var(--sans)',
              fontSize: 14,
              padding: '9px 18px',
              borderRadius: 999,
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              animation: 'overlayIn .3s ease',
            }}
          >
            ← החליקו למעבר בין הפריטים →
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}

function LbImage({
  src,
  alt,
  maxH = '74vh',
  full = false,
  onZoomChange,
}: {
  src: string;
  alt: string;
  maxH?: string;
  full?: boolean;
  onZoomChange?: (zoomed: boolean) => void;
}) {
  const spinnerRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  // True while a pinch/pan gesture is actively being tracked — disables the
  // transform transition so the image follows the fingers directly.
  const isGesturing = useRef(false);
  const pinch = useRef<{ dist: number; scale: number } | null>(null);
  const pan = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const lastTap = useRef(0);
  const zoomedRef = useRef(false);
  // Higher-resolution source used once zoomed in past 1x.
  const zoomSrc = src.replace(/(\/v1\/(?:fit|fill)\/)w_\d+,h_\d+/, '$1w_4000,h_4000');

  useEffect(() => {
    const isZoomed = scale > 1.02;
    if (isZoomed !== zoomedRef.current) {
      zoomedRef.current = isZoomed;
      onZoomChange?.(isZoomed);
    }
  }, [scale, onZoomChange]);

  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

  const touchDistance = (t1: React.Touch, t2: React.Touch) =>
    Math.max(Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY), 1);

  // Reasonable pan bound so the zoomed image can't be dragged fully off-screen.
  const maxPan = (forScale: number) => {
    const el = containerRef.current;
    const w = el?.clientWidth ?? 300;
    const h = el?.clientHeight ?? 300;
    return { x: ((forScale - 1) * w) / 2, y: ((forScale - 1) * h) / 2 };
  };

  const resetZoom = () => {
    setScale(1);
    setTx(0);
    setTy(0);
  };

  const toggleZoom = (clientX?: number, clientY?: number) => {
    if (scale > 1) {
      resetZoom();
      return;
    }
    const target = 2.5;
    setScale(target);
    if (clientX != null && clientY != null && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const offsetX = clientX - (rect.left + rect.width / 2);
      const offsetY = clientY - (rect.top + rect.height / 2);
      const bound = maxPan(target);
      setTx(clamp(-offsetX * (target - 1), -bound.x, bound.x));
      setTy(clamp(-offsetY * (target - 1), -bound.y, bound.y));
    } else {
      setTx(0);
      setTy(0);
    }
  };

  return (
    <div
      ref={containerRef}
      onDoubleClick={(e) => {
        e.stopPropagation();
        toggleZoom(e.clientX, e.clientY);
      }}
      onTouchStart={(e) => {
        if (e.touches.length === 2) {
          isGesturing.current = true;
          pinch.current = { dist: touchDistance(e.touches[0], e.touches[1]), scale };
          pan.current = null;
          return;
        }
        if (e.touches.length === 1) {
          const now = Date.now();
          const t = e.touches[0];
          const isDoubleTap = now - lastTap.current < 300;
          lastTap.current = isDoubleTap ? 0 : now;
          if (isDoubleTap) {
            // Double-tap toggles zoom; don't also arm a pan for this touch —
            // tx/ty are about to change (or reset) as part of the toggle.
            toggleZoom(t.clientX, t.clientY);
            isGesturing.current = false;
            pan.current = null;
            return;
          }
          if (scale > 1) {
            isGesturing.current = true;
            pan.current = { x: t.clientX, y: t.clientY, tx, ty };
          } else {
            isGesturing.current = false;
            pan.current = null;
          }
        }
      }}
      onTouchMove={(e) => {
        if (e.touches.length === 2 && pinch.current) {
          e.preventDefault();
          const d = touchDistance(e.touches[0], e.touches[1]);
          const next = clamp((pinch.current.scale * d) / pinch.current.dist, 1, 4);
          setScale(next);
          return;
        }
        if (e.touches.length === 1 && scale > 1 && pan.current) {
          e.preventDefault();
          const t = e.touches[0];
          const dx = t.clientX - pan.current.x;
          const dy = t.clientY - pan.current.y;
          const bound = maxPan(scale);
          setTx(clamp(pan.current.tx + dx, -bound.x, bound.x));
          setTy(clamp(pan.current.ty + dy, -bound.y, bound.y));
        }
        // scale===1 with a single finger: do nothing and let the touch bubble
        // up so the parent .yn-lbrow swipe-to-navigate still works.
      }}
      onTouchEnd={() => {
        isGesturing.current = false;
        pinch.current = null;
        pan.current = null;
        if (scale <= 1.02) resetZoom();
      }}
      onWheel={(e) => {
        if (!full) return;
        e.preventDefault();
        setScale((s) => clamp(s - e.deltaY * 0.0015, 1, 4));
      }}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 220,
        minWidth: 220,
        maxHeight: full ? '96vh' : undefined,
        maxWidth: full ? '100%' : undefined,
        overflow: 'hidden',
        touchAction: 'none',
        cursor: full ? (scale > 1 ? 'zoom-out' : 'zoom-in') : 'default',
        animation: 'lbFade .28s ease-out both',
      }}
    >
      <div
        ref={spinnerRef}
        style={{
          position: 'absolute',
          width: 52,
          height: 52,
          borderRadius: '50%',
          border: '3px solid rgba(252,247,239,.25)',
          borderTopColor: '#FCF7EF',
          animation: 'spin .8s linear infinite',
          transition: 'opacity .3s ease',
        }}
      />
      <img
        src={scale > 1 ? zoomSrc : src}
        alt={alt}
        ref={(el) => {
          if (el && el.complete) {
            el.style.opacity = '1';
            if (spinnerRef.current) spinnerRef.current.style.opacity = '0';
          }
        }}
        onLoad={(e) => {
          (e.currentTarget as HTMLImageElement).style.opacity = '1';
          if (spinnerRef.current) spinnerRef.current.style.opacity = '0';
        }}
        style={{
          opacity: 0,
          transition: isGesturing.current ? 'none' : 'opacity .35s ease, transform .18s ease',
          transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
          transformOrigin: 'center',
          maxWidth: '100%',
          maxHeight: maxH,
          objectFit: 'contain',
          borderRadius: 4,
          boxShadow: '0 30px 90px rgba(0,0,0,.55)',
        }}
      />
    </div>
  );
}
