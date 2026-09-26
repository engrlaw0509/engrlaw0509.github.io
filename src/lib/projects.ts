import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;

export interface Feature {
  date: Date;
  title: string;
  body: string;
  project: { id: string; name: string; status: Project['data']['status'] };
}

/** Every project, in the order the `order` field sets. */
export async function getProjects(): Promise<Project[]> {
  return (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
}

/**
 * Each project's single newest feature, newest project first — the homepage
 * "What's new" row. One per product, so a busy product cannot crowd out the
 * rest, and never a history: see `latest` in content.config.ts.
 */
export function newestPerProject(projects: Project[]): Feature[] {
  return projects
    .filter((p) => p.data.latest.length > 0)
    .map((p) => ({
      ...p.data.latest[0],
      project: { id: p.id, name: p.data.name, status: p.data.status },
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime() || a.project.name.localeCompare(b.project.name));
}

/*
 * Dates in frontmatter are bare days (2026-09-24), which parse as UTC midnight,
 * so they are read in UTC — or a reader west of Greenwich sees the day before.
 * Formatted by hand because ICU versions disagree on short months ("Sep" vs
 * "Sept"), and a build machine should not change what the page says.
 */
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const fmtDay = (d: Date) => `${d.getUTCDate()} ${MON[d.getUTCMonth()]}`;
export const fmtDayYear = (d: Date) => `${fmtDay(d)} ${d.getUTCFullYear()}`;
export const fmtMonYear = (d: Date) => `${MON[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
export const isoDay = (d: Date) => d.toISOString().slice(0, 10);
