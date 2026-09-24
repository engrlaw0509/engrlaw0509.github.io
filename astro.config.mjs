// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  integrations: [sitemap()],
  // `www` is the canonical host: it is the one served by Railway. The bare apex
  // cannot point at Railway (a zone apex cannot hold a CNAME, and Namecheap
  // BasicDNS has no ALIAS), so it stays on GitHub Pages serving the same build,
  // with these canonical tags telling search engines which address is official.
  //
  // Changing this value is what moves canonical URLs, the sitemap and every
  // absolute og:image. They are baked at build time, so a stale value here
  // silently points social previews at the wrong host.
  site: 'https://www.lmiautomatalabs.com',
  trailingSlash: 'always',
  build: {
    // Emit /work/kaha/index.html rather than /work/kaha.html so the URLs
    // above stay valid on GitHub Pages' static file server.
    format: 'directory',
  },
  image: {
    // Screenshots are wide; cap the work the build does on each one.
    responsiveStyles: true,
    layout: 'constrained',
  },

  // Fonts are fetched once at BUILD time and served from this origin, with
  // metric-matched fallbacks so text does not jump when they arrive. No request
  // to Google leaves a visitor's browser.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Geist',
      cssVariable: '--font-geist',
      weights: ['400 800'],
      subsets: ['latin'],
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Geist Mono',
      cssVariable: '--font-geist-mono',
      weights: [400, 500],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'monospace'],
    },
  ],

  // Hovering a link fetches the next page before the click. In Chromium the
  // page is fully prerendered through the Speculation Rules API, so the click
  // is instant; elsewhere it falls back to an ordinary prefetch.
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  experimental: { clientPrerender: true },
});
