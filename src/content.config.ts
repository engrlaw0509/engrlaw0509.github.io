import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * One project = one folder under src/content/projects/:
 *
 *   src/content/projects/kaha/
 *     index.md          <- the copy and metadata below
 *     cover.png         <- card and hero image
 *     01-something.png  <- gallery images, referenced from `gallery`
 *
 * Drop a folder in and the project appears on /work/ and gets its own page.
 * Nothing else needs editing.
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
