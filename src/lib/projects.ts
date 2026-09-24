import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;

export interface Update {
  date: Date;
  title: string;
  body?: string;
  project: { id: string; name: string; status: Project['data']['status'] };
}

/** Every project, in the order the `order` field sets. */
export async function getProjects(): Promise<Project[]> {
  return (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
}

/** Every project's `updates`, flattened and newest first. */
export function allUpdates(projects: Project[]): Update[] {
  return projects
    .flatMap((p) =>
      p.data.updates.map((u) => ({
        ...u,
        project: { id: p.id, name: p.data.name, status: p.data.status },
      })),
    )
    .sort((a, b) => b.date.getTime() - a.date.getTime() || a.project.name.localeCompare(b.project.name));
}

/**
 * The newest `perProject` updates from each project, merged newest first. The
 * homepage uses this so one busy product cannot fill the whole list.
 */
export function latestPerProject(updates: Update[], perProject = 2): Update[] {
  const seen = new Map<string, number>();
  return updates.filter((u) => {
    const n = (seen.get(u.project.id) ?? 0) + 1;
    seen.set(u.project.id, n);
    return n <= perProject;
  });
}

/*
 * Dates in frontmatter are bare days (2026-09-24), which parse as UTC midnight,
 * so they are read in UTC — or a reader west of Greenwich sees the day before.
 * Formatted by hand because ICU versions disagree on short months ("Sep" vs
 * "Sept"), and a build machine should not change what the page says.
 */
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'];

export const fmtDay = (d: Date) => `${d.getUTCDate()} ${MON[d.getUTCMonth()]}`;
export const fmtDayYear = (d: Date) => `${fmtDay(d)} ${d.getUTCFullYear()}`;
export const fmtMonth = (d: Date) => `${MONTH[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
export const isoDay = (d: Date) => d.toISOString().slice(0, 10);
