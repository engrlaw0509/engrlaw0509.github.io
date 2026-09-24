import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/**
 * One project = one folder under src/content/projects/:
 *
 *   src/content/projects/kaha/
 *     index.md          <- the copy and metadata below
 *     cover.png         <- card and hero image
 *     01-something.png  <- gallery images, referenced from `gallery`
 *
 * Drop a folder in and the project appears on the homepage, on /work/, in the
 * changelog, and at its own page. Nothing else needs editing.
 */
const projects = defineCollection({
  loader: glob({
    pattern: '**/index.md',
    base: './src/content/projects',
    // `kaha/index.md` -> `kaha`, so the URL is /work/kaha/
    generateId: ({ entry }) => entry.replace(/\/index\.md$/, ''),
  }),
  schema: ({ image }) =>
    z.object({
      /** Product name, as a customer would say it. */
      name: z.string(),
      /** Who it is for — shown under the name. e.g. "Coffee shops". */
      sector: z.string(),
      /** One sentence on the card. Say what it does for the owner. */
      summary: z.string(),

      status: z.enum(['production', 'building']),
      /** Lower sorts first on /work/. Featured projects lead the homepage. */
      order: z.number().default(99),
      featured: z.boolean().default(false),
      /**
       * Use this project's cover as the big screenshot in the homepage hero.
       * Set it on exactly one project, and pick one whose cover is an actual
       * product UI — a marketing page there makes the studio look like a web
       * shop. If none is set, the hero runs without a screenshot.
       */
      hero: z.boolean().default(false),

      /** Public website, linked as "Visit site". Leave out if it has none. */
      site: z.string().optional(),
      /**
       * What the address bar of the screenshot frame shows, e.g.
       * "app.mysentroapp.com". Only use a host the screenshots really came from.
       */
      host: z.string().optional(),
      /** The surfaces it ships as — "POS", "Client portal", "Android app". */
      platforms: z.array(z.string()).default([]),

      /** The situation before. Plain language, no jargon. */
      problem: z.string(),
      /** What changed for them afterwards. */
      outcome: z.string(),

      /** Short proof points. Keep to 3-4 or the row wraps awkwardly. */
      highlights: z
        .array(z.object({ value: z.string(), label: z.string() }))
        .default([]),

      /** What the owner can actually do. One plain sentence each. */
      features: z.array(z.object({ title: z.string(), body: z.string() })).default([]),

      /**
       * The terminal-style "system" panel: verifiable engineering facts, one
       * line each. `ok` is shipped and working, `wip` is being built, `info` is
       * neither. Every line must be true today — this is the part a technical
       * reader checks.
       */
      system: z
        .array(
          z.object({
            key: z.string(),
            value: z.string(),
            state: z.enum(['ok', 'wip', 'info']).default('info'),
          }),
        )
        .default([]),

      /**
       * What shipped, newest first. Feeds this project's page, the homepage
       * "Shipping log" and /changelog/. Write it for the owner, not the commit
       * log: what they can now do, not what the code does.
       */
      updates: z
        .array(
          z.object({
            date: z.coerce.date(),
            title: z.string(),
            body: z.string().optional(),
          }),
        )
        .default([]),

      /** Named plainly; the detail page lists these small and last. */
      stack: z.array(z.string()).default([]),

      cover: image().optional(),
      gallery: z
        .array(
          z.object({
            src: image(),
            /** Required — it is the alt text, and it is read aloud. */
            alt: z.string(),
            /** Shown under the image. Explain what the viewer is looking at. */
            caption: z.string().optional(),
          }),
        )
        .default([]),
    }),
});

export const collections = { projects };
