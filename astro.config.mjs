// @ts-check
import { defineConfig } from 'astro/config';
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
});
