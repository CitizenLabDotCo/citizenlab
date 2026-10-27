// The code index the build wrote for its own commit (npm run ds:index):
// meta.json, lookup.json and styles.json once per page load, a file's templates
// (files/<fnv1a32 of the path>.json) when a trace first needs them, all
// cached. The source of a file is read from GitHub at the index's commit,
// so the index's offsets apply to it exactly. Missing files give undefined,
// never a stand-in.
import { BLANK_KEY, lookupKeys, reachableIds } from './align';
import { fnv1a32 } from './hash';
import type {
  IndexLookup,
  IndexMeta,
  IndexShard,
  IndexStyles,
  Template,
} from './types';

export const GITHUB = 'https://github.com/CitizenLabDotCo/citizenlab';
const RAW = 'https://raw.githubusercontent.com/CitizenLabDotCo/citizenlab';

// The line on GitHub at the index's commit.
export const githubLink = (commit: string, file: string, line: number) =>
  `${GITHUB}/blob/${commit}/front/${file}#L${line}`;

export const rawSourceUrl = (commit: string, file: string) =>
  `${RAW}/${commit}/front/${file}`;

// 'app/x/index.tsx:548:18' -> 'app/x/index.tsx'
export const fileOfId = (id: string) => id.replace(/:\d+:\d+$/, '');

export type IndexClient = {
  meta(): Promise<IndexMeta | undefined>;
  // Template ids whose quasis hash like the string entries of `rules` (the
  // first 30), in order, each once.
  candidates(rules: unknown[]): Promise<string[]>;
  // The template and every template it reaches (inlined css, helper
  // wrappers and call sites, template reads), loaded.
  load(id: string): Promise<Template | undefined>;
  // A template already loaded.
  get(id: string): Template | undefined;
  // The file's text at the index's commit.
  source(file: string): Promise<string | undefined>;
  // The inline style objects of the story files and the Storybook setup.
  styles(): Promise<IndexStyles | undefined>;
};

type Fetch = (url: string) => Promise<{ ok: boolean; text(): Promise<string> }>;

export type IndexClientOptions = {
  // The index folder's URL, ending in '/'.
  base?: string;
  fetch?: Fetch;
  sourceUrl?: (commit: string, file: string) => string;
};

export const createIndexClient = ({
  base = '../design-index/',
  fetch: get = (url) => fetch(url),
  sourceUrl = rawSourceUrl,
}: IndexClientOptions = {}): IndexClient => {
  const texts = new Map<string, Promise<string | undefined>>();
  const read = (url: string) => {
    if (!texts.has(url)) {
      texts.set(
        url,
        get(url)
          .then((res) => (res.ok ? res.text() : undefined))
          .catch(() => undefined)
      );
    }
    return texts.get(url) as Promise<string | undefined>;
  };
  const json = async <T>(url: string): Promise<T | undefined> => {
    const text = await read(url);
    if (text === undefined) return undefined;
    try {
      return JSON.parse(text) as T;
    } catch {
      return undefined;
    }
  };

  const templates = new Map<string, Template>();
  const shards = new Map<string, Promise<IndexShard | undefined>>();
  const shard = (file: string) => {
    if (!shards.has(file)) {
      shards.set(
        file,
        json<IndexShard>(`${base}files/${fnv1a32(file)}.json`).then((s) => {
          if (s?.file !== file) return undefined;
          for (const t of s.templates) templates.set(t.id, t);
          return s;
        })
      );
    }
    return shards.get(file) as Promise<IndexShard | undefined>;
  };

  const meta = () =>
    json<IndexMeta>(`${base}meta.json`).then((m) =>
      m && m.version === 1 ? m : undefined
    );
  const lookup = () => json<IndexLookup>(`${base}lookup.json`);

  const one = async (id: string) => {
    if (!templates.has(id)) await shard(fileOfId(id));
    return templates.get(id);
  };

  const load = async (id: string) => {
    const seen = new Set<string>();
    const queue = [id];
    while (queue.length) {
      const next = queue.shift() as string;
      if (seen.has(next)) continue;
      seen.add(next);
      const t = await one(next);
      if (t) queue.push(...reachableIds(t));
    }
    return templates.get(id);
  };

  return {
    meta,
    candidates: async (rules) => {
      const table = await lookup();
      if (!table) return [];
      const out: string[] = [];
      const keys = lookupKeys(rules);
      for (const s of keys) {
        for (const id of table[fnv1a32(s)] ?? []) {
          if (!out.includes(id)) out.push(id);
        }
      }
      // Rules with no quasi but blanks: the templates of interpolations only.
      if (keys.every((s) => s.trim() === '')) {
        for (const id of table[BLANK_KEY] ?? []) {
          if (!out.includes(id)) out.push(id);
        }
      }
      return out;
    },
    load,
    get: (id) => templates.get(id),
    source: async (file) => {
      const m = await meta();
      return m?.commit ? read(sourceUrl(m.commit, file)) : undefined;
    },
    styles: () =>
      json<IndexStyles>(`${base}styles.json`).then((s) =>
        Array.isArray(s) ? s : undefined
      ),
  };
};

// The shell's client: the index next to the workbench in the Storybook
// static folder, once per page load.
export const indexClient = createIndexClient();
