import { createClient, OAuthStrategy } from '@wix/sdk';
import { items } from '@wix/data';
import { posts } from '@wix/blog';

// Visitor OAuth client created on the consolidated Yigar Nevo site (5bd31b23…),
// the same site that hosts the frontend — CMS, Blog, and hosting live together.
// Client-id only (safe to expose); the SDK mints/refreshes anonymous visitor tokens in the browser.
export const CLIENT_ID = 'face20be-5a34-40b7-9339-5a6861c15ea4';

export const wixClient = createClient({
  modules: { items, posts },
  auth: OAuthStrategy({ clientId: CLIENT_ID }),
});
