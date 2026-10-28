import fs from 'fs';
import os from 'os';
import path from 'path';

import { fnv1a32 } from './hash';
import { BLANK_KEY, buildIndex, isIndexedSource, writeIndex } from './index';
import {
  IndexFiles,
  IndexLookup,
  IndexMeta,
  IndexShard,
  IndexStyles,
} from './schema';

const BUTTON = 'app/component-library/components/Button/index.tsx';
const STORY =
  'app/containers/Admin/projects/project/backofficeRedesign/Event/SetupCard.stories.tsx';
const ONLY = [BUTTON, 'app/component-library/utils/styleUtils.ts', STORY];

// Every file under `dir`, relative, sorted, with its bytes.
const snapshot = (dir: string): [string, Buffer][] => {
  const out: [string, Buffer][] = [];
  const walk = (rel: string) =>
    fs
      .readdirSync(path.join(dir, rel), { withFileTypes: true })
      .forEach((e) => {
        const child = rel ? `${rel}/${e.name}` : e.name;
        if (e.isDirectory()) walk(child);
        else out.push([child, fs.readFileSync(path.join(dir, child))]);
      });
  walk('');
  return out.sort(([a], [b]) => (a < b ? -1 : 1));
};

describe('ds:index', () => {
  const dirs = [0, 1].map(() =>
    fs.mkdtempSync(path.join(os.tmpdir(), 'design-index-'))
  );
  // Two separate builds, written to two folders.
  beforeAll(() =>
    dirs.forEach((d) =>
      writeIndex(buildIndex({ only: ONLY, commit: 'abc123' }), d)
    )
  );
  afterAll(() =>
    dirs.forEach((d) => fs.rmSync(d, { recursive: true, force: true }))
  );
  const json = (name: string) =>
    JSON.parse(fs.readFileSync(path.join(dirs[0], name), 'utf8'));

  it('writes the same bytes on every run', () => {
    const [a, b] = dirs.map(snapshot);
    expect(a.map(([f]) => f)).toEqual([
      'files.json',
      ...[BUTTON, 'app/component-library/utils/styleUtils.ts']
        .map((f) => `files/${fnv1a32(f)}.json`)
        .sort(),
      'lookup.json',
      'meta.json',
      'styles.json',
    ]);
    a.forEach(([f, bytes], i) => {
      expect(b[i][0]).toBe(f);
      expect(bytes.equals(b[i][1])).toBe(true);
    });
  });

  it('writes meta.json with totals, the commit and the definition places', () => {
    const meta: IndexMeta = json('meta.json');
    expect(meta).toMatchObject({
      version: 1,
      commit: 'abc123',
      files: 3,
      unknownTags: 0,
    });
    expect(meta.exprsKnown).toBeLessThanOrEqual(meta.exprs);
    expect(meta.themeDefs.borderRadius).toEqual({
      file: 'app/component-library/utils/styleUtils.ts',
      line: 242,
      col: 2,
    });
    expect(meta.themeDefs['fontSizes.base'].line).toBe(153);
    expect(meta.constDefs['bo.borderRadius'].line).toBe(220);
    expect(
      Object.keys(meta.constDefs).some((k) => k.startsWith('theme.'))
    ).toBe(false);
  });

  it('writes a shard per file, named by the hash of its path', () => {
    const shard: IndexShard = json(`files/${fnv1a32(BUTTON)}.json`);
    expect(shard.file).toBe(BUTTON);
    expect(shard.templates.map((t) => t.id)).toContain(`${BUTTON}:400:9`);
  });

  it("keys lookup.json by each template's longest quasi and long quasis", () => {
    const lookup: IndexLookup = json('lookup.json');
    const shard: IndexShard = json(`files/${fnv1a32(BUTTON)}.json`);
    const string = shard.templates.find((t) => t.kind === 'string');
    const longest = string?.quasis.reduce((a, q) =>
      q.length > a.length ? q : a
    );
    expect(lookup[fnv1a32(longest as string)]).toContain(string?.id);
    const { [BLANK_KEY]: blank = [], ...hashed } = lookup;
    Object.values(hashed).forEach((ids) => {
      expect(ids.length).toBeLessThanOrEqual(20);
      expect(ids).toEqual([...ids].sort());
    });
    expect(blank).toEqual([...blank].sort());
    // Sorted in the file (a parsed object lists index-like keys first).
    const text = fs.readFileSync(path.join(dirs[0], 'lookup.json'), 'utf8');
    const keys = [...text.matchAll(/"([0-9a-f]{8})":/g)].map((m) => m[1]);
    expect(keys).toEqual([...keys].sort());
    expect(keys).toHaveLength(Object.keys(hashed).length);
  });

  it('writes files.json with the design counts of Button', () => {
    const files: IndexFiles = json('files.json');
    expect(Object.keys(files)).toEqual([
      BUTTON,
      'app/component-library/utils/styleUtils.ts',
    ]);
    expect(files[BUTTON]).toEqual({
      templates: 9,
      decls: 101,
      design: { token: 0, legacy: 15, literal: 20, prop: 0, unknown: 0 },
    });
  });

  it('writes styles.json with the inline style objects of frame files', () => {
    const styles: IndexStyles = json('styles.json');
    expect(styles.every((o) => o.file === STORY)).toBe(true);
    expect(
      styles.find(
        (o) =>
          o.entries?.width?.value === 560 &&
          o.entries?.padding?.value === 18 &&
          o.entries?.background?.value === 'white'
      )?.loc.line
    ).toBe(32);
  });
});

describe('isIndexedSource', () => {
  it('takes app and Storybook code, stories included, not tests, mocks or the workbench', () => {
    expect(isIndexedSource('app/a/B.tsx')).toBe(true);
    expect(isIndexedSource('app/a/B.stories.tsx')).toBe(true);
    expect(isIndexedSource('.storybook/preview.tsx')).toBe(true);
    expect(isIndexedSource('app/a/B.test.tsx')).toBe(false);
    expect(isIndexedSource('app/a/__mocks__/B.ts')).toBe(false);
    expect(isIndexedSource('.storybook/workbench/src/App.tsx')).toBe(false);
    expect(isIndexedSource('app/a/b.js')).toBe(false);
  });
});
