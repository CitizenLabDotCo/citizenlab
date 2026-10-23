/**
 * Route fixtures for the Review page: real ids and slugs on the test tenant,
 * so a route such as `admin/projects/$projectId/phases/$phaseId` opens a page
 * that exists.
 *
 *   npm run ds:routes-fixture [-- --host https://<epic host>]
 *
 * Reads the platform's public API without signing in (GET requests only, no
 * credentials) and writes .storybook/static/routes.fixture.json. `params`
 * fill `$param` segments; `paths` override a param for one route where the
 * same name means another record (`ideas/$slug` is an idea slug, not a
 * project slug). Params only an admin can read (groups, campaigns, reports,
 * spaces, analyses, preview tokens) are listed under `missing` and printed;
 * fill them by hand and the next run keeps them. `hosts` and `locale` are
 * kept from the existing file.
 *
 * Refresh after the test tenant is reseeded. It never runs in the build.
 */
import fs from 'fs';
import path from 'path';

export type Get = (apiPath: string) => Promise<any | undefined>;

export type RoutesFixture = {
  hosts: { after: string; before: string };
  params: Record<string, string>;
  paths: Record<string, Record<string, string>>;
  locale: string;
  source?: { host: string; fetchedAt: string };
  missing: string[];
};

const DEFAULT_HOST = 'https://pr-15027.epic.hq.govocal.com';
const OUT = '.storybook/static/routes.fixture.json';

// Every `$param` the scanned routes use (see design-scan.json routeFiles).
export const ROUTE_PARAMS = [
  'analysisId',
  'areaId',
  'campaignId',
  'causeId',
  'customPageId',
  'defaultInputTopicId',
  'eventId',
  'folderId',
  'groupId',
  'id',
  'ideaId',
  'navbarItemId',
  'pageSlug',
  'phaseId',
  'phaseNumber',
  'projectFolderId',
  'projectId',
  'reportId',
  'slug',
  'spaceId',
  'statusId',
  'token',
  'topicId',
  'userCustomFieldId',
  'userCustomFieldOptionId',
  'userId',
];

const first = (body: any) =>
  Array.isArray(body?.data) ? body.data[0] : body?.data;
const rel = (record: any, name: string): string | undefined => {
  const d = record?.relationships?.[name]?.data;
  return Array.isArray(d) ? d[0]?.id : d?.id;
};

/** Fills params from public API reads; what it cannot read stays out. */
export const fillParams = async (
  get: Get
): Promise<Pick<RoutesFixture, 'params' | 'paths'>> => {
  const params: Record<string, string> = {};
  const paths: Record<string, Record<string, string>> = {};
  const set = (key: string, value: unknown) => {
    if (typeof value === 'string' && value) params[key] = value;
  };
  const setPath = (route: string, key: string, value: unknown) => {
    if (typeof value === 'string' && value) {
      paths[route] = { ...(paths[route] ?? {}), [key]: value };
    }
  };

  // An idea anchors the project, phase, author and status, so the nested
  // routes (project > phase, project > idea) point at records that belong
  // together.
  const idea = first(await get('/ideas?page[size]=1'));
  set('ideaId', idea?.id);
  setPath('ideas/$slug', 'slug', idea?.attributes?.slug);
  set('userId', rel(idea, 'author'));
  let projectId = rel(idea, 'project');
  let phaseId = rel(idea, 'phases');
  const project = first(
    await get(projectId ? `/projects/${projectId}` : '/projects?page[size]=1')
  );
  projectId = project?.id ?? projectId;
  set('projectId', projectId);
  set('slug', project?.attributes?.slug);
  if (projectId) {
    const phases = await get(`/projects/${projectId}/phases`);
    const list: any[] = Array.isArray(phases?.data) ? phases.data : [];
    phaseId = phaseId ?? list[0]?.id;
    const index = list.findIndex((p) => p.id === phaseId);
    if (list.length) set('phaseNumber', String(index >= 0 ? index + 1 : 1));
    const volunteering = list.find(
      (p) => p.attributes?.participation_method === 'volunteering'
    );
    if (volunteering) {
      const cause = first(await get(`/phases/${volunteering.id}/causes`));
      if (cause?.id) {
        setPath(
          'admin/projects/$projectId/phases/$phaseId/volunteering/causes/$causeId',
          'phaseId',
          volunteering.id
        );
        set('causeId', cause.id);
      }
    }
    const event = first(
      await get(`/events?project_ids[]=${projectId}&page[size]=1`)
    );
    setPath('admin/projects/$projectId/events/$id', 'id', event?.id);
  }
  set('phaseId', phaseId);
  set('eventId', first(await get('/events?page[size]=1'))?.id);

  const folder = first(await get('/project_folders?page[size]=1'));
  set('folderId', folder?.id);
  set('projectFolderId', folder?.id);
  setPath('folders/$slug', 'slug', folder?.attributes?.slug);

  const page = first(await get('/static_pages'));
  set('customPageId', page?.id);
  setPath('pages/$slug', 'slug', page?.attributes?.slug);

  set('areaId', first(await get('/areas'))?.id);
  set('topicId', first(await get('/global_topics'))?.id);
  set('defaultInputTopicId', first(await get('/default_input_topics'))?.id);

  const statuses = await get('/idea_statuses');
  const statusList: any[] = Array.isArray(statuses?.data) ? statuses.data : [];
  const byMethod = (m: string) =>
    statusList.find((s) => s.attributes?.participation_method === m)?.id;
  set('statusId', byMethod('ideation') ?? statusList[0]?.id);
  setPath(
    'admin/settings/statuses/proposals/$statusId',
    'statusId',
    byMethod('proposals')
  );

  const navItems = await get('/nav_bar_items');
  const navList: any[] = Array.isArray(navItems?.data) ? navItems.data : [];
  set(
    'navbarItemId',
    (navList.find((n) => n.attributes?.code === 'custom') ?? navList[0])?.id
  );

  const field = first(await get('/users/custom_fields'));
  set('userCustomFieldId', field?.id);
  if (field?.id) {
    set(
      'userCustomFieldOptionId',
      first(await get(`/users/custom_fields/${field.id}/custom_field_options`))
        ?.id
    );
  }
  return { params, paths };
};

/** Merges a fresh read into the existing fixture; hand-filled values stay. */
export const mergeFixture = (
  existing: Partial<RoutesFixture> | undefined,
  filled: Pick<RoutesFixture, 'params' | 'paths'>,
  host: string,
  now = new Date()
): RoutesFixture => {
  const params = { ...(existing?.params ?? {}), ...filled.params };
  const paths = { ...(existing?.paths ?? {}) };
  Object.entries(filled.paths).forEach(([route, values]) => {
    paths[route] = { ...(paths[route] ?? {}), ...values };
  });
  const sorted = <T>(o: Record<string, T>) =>
    Object.fromEntries(
      Object.keys(o)
        .sort()
        .map((k) => [k, o[k]])
    );
  return {
    hosts: existing?.hosts ?? {
      after: '',
      before: 'https://demo.stg.govocal.com',
    },
    params: sorted(params),
    paths: sorted(paths),
    locale: existing?.locale ?? 'en',
    source: { host, fetchedAt: now.toISOString() },
    // A param set only in a route override still counts as filled.
    missing: ROUTE_PARAMS.filter(
      (p) => !params[p] && !Object.values(paths).some((v) => v[p])
    ),
  };
};

const ROOT = path.resolve(__dirname, '..', '..');

const main = async () => {
  const argv = process.argv.slice(2);
  let host = DEFAULT_HOST;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--host') host = argv[++i].replace(/\/$/, '');
    else throw new Error(`unknown argument ${argv[i]}`);
  }
  const failed: string[] = [];
  const get: Get = async (apiPath) => {
    const url = `${host}/web_api/v1${apiPath}`;
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) {
        failed.push(`${apiPath} (${res.status})`);
        return undefined;
      }
      return await res.json();
    } catch (e: any) {
      failed.push(`${apiPath} (${e?.message ?? e})`);
      return undefined;
    }
  };
  const file = path.join(ROOT, OUT);
  let existing: Partial<RoutesFixture> | undefined;
  try {
    existing = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    existing = undefined;
  }
  const fixture = mergeFixture(existing, await fillParams(get), host);
  fs.writeFileSync(file, `${JSON.stringify(fixture, null, 2)}\n`);
  console.log(
    `ds:routes-fixture: ${Object.keys(fixture.params).length} params and ${
      Object.keys(fixture.paths).length
    } route overrides from ${host}; wrote ${OUT}`
  );
  if (failed.length) {
    console.log(`requests that failed: ${failed.join(', ')}`);
  }
  if (fixture.missing.length) {
    console.log(
      `not filled (needs an admin session or data the tenant lacks; fill by hand): ${fixture.missing.join(
        ', '
      )}`
    );
  }
};

if (require.main === module) {
  main().catch((e) => {
    console.error(`ds:routes-fixture failed: ${e?.message ?? e}`);
    process.exitCode = 1;
  });
}
