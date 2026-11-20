import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

import { BASE_PATH } from '@/lib/basePath';

const description = 'Track the AI assistants you run: status, hand-offs, notes, and follow-ups. Works offline on your phone.';

const serviceWorker = `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('${BASE_PATH}/sw.js', { scope: '${BASE_PATH}/' }).catch(function (error) {
      console.warn('Bot Fleet service worker registration failed', error);
    });
  });
}
`;

export default function Root({ children }: PropsWithChildren) {
  const { headNodes, bodyNodes, htmlAttributes, bodyAttributes } = useServerDocumentContext();

  return (
    <html lang="en" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <title>Bot Fleet</title>
        <meta name="description" content={description} />
        <meta name="theme-color" content="#0E1519" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Bot Fleet" />
        <link rel="manifest" href={`${BASE_PATH}/manifest.json`} />
        <link rel="apple-touch-icon" href={`${BASE_PATH}/apple-touch-icon.png`} />
        <link rel="icon" type="image/png" href={`${BASE_PATH}/favicon.png`} />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body, #root { height: 100%; }
              body { margin: 0; background: #0E1519; }
              :root { --focus: #0C6E6A; }
              :focus-visible {
                outline: 3px solid var(--focus);
                outline-offset: 2px;
              }
              @media (prefers-reduced-motion: reduce) {
                *, *::before, *::after {
                  animation-duration: 0.01ms !important;
                  animation-iteration-count: 1 !important;
                  transition-duration: 0.01ms !important;
                  scroll-behavior: auto !important;
                }
              }
            `,
          }}
        />
        <ScrollViewStyleReset />
        <script dangerouslySetInnerHTML={{ __html: serviceWorker }} />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}
