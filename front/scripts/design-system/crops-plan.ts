// What ds:crops pictures, and where: the components the platform uses that
// have no story, each on the routes the scan found it on. Pure, for tests;
// crops.ts runs it.

export type ScanComponent = {
  component: string;
  file: string;
  usageCount: number;
  routes: string[];
};

export type Crop = {
  file: string;
  route: string;
  width: number;
  height: number;
};

// "UI-Error" for "UI/Error": the picture's file name.
export const cropSlug = (name: string) =>
  name.replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');

// A route the run can open: no `$param` (the fixture's ids are the epic's,
// not the local back end's), and outside the admin without a session.
export const openable = (route: string, session: boolean) =>
  !route.includes('$') && (session || !/^admin(\/|$)/.test(route));

export type CropPlan = {
  // Route to the components to look for on it, most used first.
  routes: Map<string, string[]>;
  // Components with no route the run can open.
  unreachable: string[];
};

// Each component on at most `perComponent` routes; routes shared by many
// components first, so one page load pictures several.
export const planCrops = (
  components: ScanComponent[],
  storyFiles: Set<string>,
  opts: { session: boolean; only?: string[]; perComponent?: number }
): CropPlan => {
  const per = opts.perComponent ?? 3;
  const wanted = components
    .filter((c) => !storyFiles.has(c.file) && c.usageCount > 0)
    .filter((c) => !opts.only || opts.only.includes(c.component))
    .sort((a, b) => b.usageCount - a.usageCount);
  const reach = new Map<string, number>();
  for (const c of wanted) {
    for (const r of c.routes) {
      if (openable(r, opts.session)) reach.set(r, (reach.get(r) ?? 0) + 1);
    }
  }
  const routes = new Map<string, string[]>();
  const unreachable: string[] = [];
  for (const c of wanted) {
    const mine = c.routes
      .filter((r) => openable(r, opts.session))
      .sort(
        (a, b) =>
          (reach.get(b) ?? 0) - (reach.get(a) ?? 0) || a.length - b.length
      )
      .slice(0, per);
    if (!mine.length) unreachable.push(c.component);
    for (const r of mine)
      routes.set(r, [...(routes.get(r) ?? []), c.component]);
  }
  return { routes, unreachable };
};
