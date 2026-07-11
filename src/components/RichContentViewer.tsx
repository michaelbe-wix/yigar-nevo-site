import React from 'react';
import { quickStartViewerPlugins, RicosViewer } from '@wix/ricos';
import '@wix/ricos/css/all-plugins-viewer.css';
import { wixClient } from '../lib/wix';

const plugins = quickStartViewerPlugins();

/** Renders a Wix rich-content (Ricos) document — the real Blog post body from the CMS.
 *  Passing the SDK client lets Ricos authenticate media requests (and silences its warning). */
export default function RichContentViewer({ content }: { content: any }) {
  return <RicosViewer content={content} plugins={plugins} wixClient={wixClient as any} />;
}
