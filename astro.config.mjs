// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  integrations: [sitemap()],
  // User site — served from the domain root, so no `base` is needed.
  site: 'https://engrlaw0509.github.io',
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
