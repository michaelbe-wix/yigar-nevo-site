import { defineMiddleware } from 'astro:middleware';

// 301 the old Hebrew blog URL to its ASCII equivalent, preserving SEO equity from the
// previously-indexed /בלוג. Done in middleware (not a page file) so /בלוג is NOT registered
// as a Wix "main page" — a non-ASCII page path breaks the SEO dashboard's name derivation.
export const onRequest = defineMiddleware((context, next) => {
  let path = context.url.pathname;
  try {
    path = decodeURIComponent(path);
  } catch {
    /* keep */
  }
  path = path.replace(/\/+$/, '') || '/';
  // Old Hebrew blog URLs → /blog. Covers the index (/בלוג) and any sub-paths that were
  // indexed under it (e.g. /בלוג/categories/רעפי-מרסיי), so none of them 404 after the move.
  if (path === '/בלוג' || path.startsWith('/בלוג/')) {
    return context.redirect('/blog', 301);
  }
  return next();
});
