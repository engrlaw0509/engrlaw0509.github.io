// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  integrations: [sitemap()],
  // Served from the domain root, so no `base` is needed. Changing this is what
  // moves canonical URLs, the sitemap, and every absolute og:image — those are
  // built at compile time, so a stale value here silently points social
  // previews at the old github.io address.
  site: 'https://lmiautomatalabs.com',
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
