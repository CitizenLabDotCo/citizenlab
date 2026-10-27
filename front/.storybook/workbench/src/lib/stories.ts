// Storybook's index grouped the way the galleries and the component page
// show it: one group per story title, its stories split into states (the
// story names of the conventions) and variants, joined with the scan's
// score for the component file. Pure functions over index.json and the scan.
import type {
  ComponentScore,
  ScanOutput,
  StoryEntry,
  StoryIndex,
} from './data';

export type Section = 'components' | 'patterns' | 'pages';

// Office of a component: back office, front office, both, or not known.
export type Office = 'bo' | 'fo' | 'shared' | 'unknown';

// 'pending': the scan has not loaded yet.
export type Status = ComponentScore['status'] | 'unscanned' | 'pending';

export type StoryRef = {
  id: string;
  name: string;
  exportName: string;
  state: boolean;
};

export type StoryGroup = {
  title: string;
  name: string;
  // Middle segments of the title (`Components/Forms/Input` -> `Forms`).
  category: string;
  // null: the title starts with none of the three sections.
  section: Section | null;
  stories: StoryRef[];
  // The story a thumbnail shows: `Default`, else the first one.
  defaultId: string;
  // Repo-relative component file, when Storybook knows it.
  file?: string;
  office: Office;
  status: Status;
  score?: ComponentScore;
  // Part of the back-office redesign (story tag `redesigned`).
  redesigned: boolean;
  // Where a redesigned piece sits: `Components/Redesigned/Events/Image card`
  // -> `Events`. The category otherwise.
  area: string;
};

// One story per state, in this order (the Task 11 story conventions).
export const STATE_ORDER = [
  'Default',
  'Hover',
  'Focus',
  'Active',
  'Disabled',
  'Loading',
  'Error',
  'Open',
  'Empty',
  'LongContent',
  'RTL',
];

export const STATUS_LABEL: Record<Exclude<Status, 'pending'>, string> = {
  'on-tokens': 'On tokens',
  partly: 'Partly',
  'off-tokens': 'Off tokens',
  unscanned: 'Not scanned',
};

const SECTIONS: Record<string, Section> = {
  Components: 'components',
  Patterns: 'patterns',
  Pages: 'pages',
};

export const sectionOf = (title: string): Section | null =>
  SECTIONS[title.split('/')[0]] ?? null;

// `./app/x/index.tsx` and `app/x/index.tsx` -> `app/x/index.tsx`. Storybook
// sometimes writes a bare module path (`containers/...`): kept as given.
const normalisePath = (p?: string) => p?.replace(/^\.\//, '');

const exportNameOf = (e: StoryEntry) =>
  e.exportName ?? e.name.replace(/[^A-Za-z0-9]/g, '');

// The story tags set the office; without one, the routes the scan found
// the component on: admin routes are the back office.
export const officeOf = (tags: string[], routes: string[] = []): Office => {
  for (const t of ['shared', 'bo', 'fo'] as const) {
    if (tags.includes(t)) return t;
  }
  const admin = routes.some((r) => r === 'admin' || r.startsWith('admin/'));
  const pub = routes.some((r) => !(r === 'admin' || r.startsWith('admin/')));
  if (admin && pub) return 'shared';
  if (admin) return 'bo';
  if (pub) return 'fo';
  return 'unknown';
};

export const REDESIGNED_TAG = 'redesigned';

// `Components/Redesigned/Events/Image card` -> `Events`; a redesigned story
// filed elsewhere (a page) takes its section's name.
export const areaOf = (title: string, redesigned: boolean) => {
  const parts = title.split('/');
  const at = parts.indexOf('Redesigned');
  if (redesigned && at >= 0 && parts.length - at > 2) return parts[at + 1];
  if (redesigned && sectionOf(title) === 'pages') return 'Pages';
  return parts.slice(1, -1).join(' / ');
};

// `scan` null: it is still loading, and every status is 'pending'.
export const buildGroups = (
  index: StoryIndex,
  scan: ScanOutput | null
): StoryGroup[] => {
  const components = scan?.components ?? [];
  const byFile = new Map(components.map((c) => [c.file, c]));
  const byName = new Map(components.map((c) => [c.component, c]));
  const byTitle = new Map<string, StoryEntry[]>();
  for (const e of Object.values(index.entries)) {
    if (e.type && e.type !== 'story') continue;
    const list = byTitle.get(e.title) ?? [];
    list.push(e);
    byTitle.set(e.title, list);
  }
  const groups: StoryGroup[] = [];
  for (const [title, entries] of byTitle) {
    const parts = title.split('/');
    const name = parts[parts.length - 1];
    const section = sectionOf(title);
    const middle = section ? parts.slice(1, -1) : parts.slice(0, -1);
    const refs = entries.map((e) => {
      const exportName = exportNameOf(e);
      return {
        id: e.id,
        name: e.name,
        exportName,
        state: STATE_ORDER.includes(exportName),
      };
    });
    const states = STATE_ORDER.flatMap((s) =>
      refs.filter((r) => r.exportName === s)
    );
    const stories = [...states, ...refs.filter((r) => !r.state)];
    const file = normalisePath(
      entries.find((e) => e.componentPath)?.componentPath
    );
    const score =
      (file && byFile.get(file)) ||
      (section === 'components' ? byName.get(name) : undefined);
    const tags = entries.flatMap((e) => e.tags ?? []);
    const redesigned = tags.includes(REDESIGNED_TAG);
    groups.push({
      title,
      name,
      category: middle.join(' / '),
      section,
      stories,
      defaultId:
        stories.find((s) => s.exportName === 'Default')?.id ?? stories[0].id,
      file: file ?? score?.file,
      office: officeOf(tags, score?.routes),
      status: scan ? score?.status ?? 'unscanned' : 'pending',
      score,
      redesigned,
      area: areaOf(title, redesigned),
    });
  }
  return groups.sort((a, b) => a.name.localeCompare(b.name));
};

export const groupOfStory = (groups: StoryGroup[], storyId: string) =>
  groups.find((g) => g.stories.some((s) => s.id === storyId));

// `redesigned`: only the pieces of the back-office redesign.
export type GallerySet = 'all' | 'redesigned';

export type GalleryFilter = {
  office: Office | 'all';
  status: Status | 'all';
  query: string;
  set: GallerySet;
};

export const ALL: GalleryFilter = {
  office: 'all',
  status: 'all',
  query: '',
  set: 'all',
};

// Office `shared` also matches the back and front office filters: a shared
// component is used in both.
export const filterGroups = (groups: StoryGroup[], f: GalleryFilter) => {
  const q = f.query.trim().toLowerCase();
  return groups.filter(
    (g) =>
      (f.office === 'all' ||
        g.office === f.office ||
        (g.office === 'shared' && (f.office === 'bo' || f.office === 'fo'))) &&
      (f.status === 'all' || g.status === f.status) &&
      (f.set === 'all' || g.redesigned) &&
      (!q || `${g.name} ${g.category}`.toLowerCase().includes(q))
  );
};

// The order areas of the redesign show in: the page top to bottom, then
// the shared pieces; an area not listed goes last, by name.
export const AREA_ORDER = [
  'Pages',
  'Project header',
  'Setup panel',
  'Timeline and phases',
  'Input manager',
  'Events',
  'New project',
  'Settings panel',
  'Library variants',
  'Shared pieces',
];

// Groups split by area, in AREA_ORDER, each list keeping its order.
export const byArea = (groups: StoryGroup[]) => {
  const map = new Map<string, StoryGroup[]>();
  for (const g of groups) {
    const list = map.get(g.area) ?? [];
    list.push(g);
    map.set(g.area, list);
  }
  const rank = (a: string) => {
    const i = AREA_ORDER.indexOf(a);
    return i < 0 ? AREA_ORDER.length : i;
  };
  return [...map.entries()]
    .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
    .map(([area, list]) => ({ area, groups: list }));
};
