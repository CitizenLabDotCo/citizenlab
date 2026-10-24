// The Components page's In use list: every component the scan found the
// platform using, most used first, with its story group when it has one and
// otherwise the picture ds:crops took of it on the running platform. Pure.
import type { ComponentScore } from './data';
import type { Office, StoryGroup } from './stories';
import { officeOf } from './stories';

// What ds:crops writes to crops.json, per component name.
export type Crop = {
  file: string;
  route: string;
  width: number;
  height: number;
};

export type InUseRow = {
  name: string;
  file: string;
  uses: number;
  routes: string[];
  office: Office;
  score: ComponentScore;
  group?: StoryGroup;
  crop?: Crop;
};

// "UI/Error" -> "UI-Error": the picture's file name (as in crops-plan.ts).
export const cropSlug = (name: string) =>
  name.replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');

export const buildInUse = (
  components: ComponentScore[],
  groups: StoryGroup[],
  crops: Record<string, Crop>
): InUseRow[] => {
  const mine = groups.filter((g) => g.section === 'components');
  const byFile = new Map(mine.filter((g) => g.file).map((g) => [g.file, g]));
  const byName = new Map(mine.map((g) => [g.name, g]));
  return components
    .filter((c) => c.usageCount > 0)
    .map((c) => {
      const group = byFile.get(c.file) ?? byName.get(c.component);
      return {
        name: c.component,
        file: c.file,
        uses: c.usageCount,
        routes: c.routes,
        office: group?.office ?? officeOf([], c.routes),
        score: c,
        group,
        crop: group ? undefined : crops[c.component],
      };
    })
    .sort((a, b) => b.uses - a.uses || a.name.localeCompare(b.name));
};

export const filterInUse = (
  rows: InUseRow[],
  f: { office: Office | 'all'; status: string; query: string }
) => {
  const q = f.query.trim().toLowerCase();
  return rows.filter(
    (r) =>
      (f.office === 'all' ||
        r.office === f.office ||
        (r.office === 'shared' && (f.office === 'bo' || f.office === 'fo'))) &&
      (f.status === 'all' || r.score.status === f.status) &&
      (!q || `${r.name} ${r.file}`.toLowerCase().includes(q))
  );
};
