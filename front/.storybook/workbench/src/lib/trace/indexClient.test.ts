import { fnv1a32 } from './hash';
import { createIndexClient, githubLink } from './indexClient';
import type { Template } from './types';

const loc = { start: 0, end: 1, line: 1, col: 0, endLine: 1, endCol: 1 };
const t = (id: string, file: string, css?: string): Template => ({
  id,
  file,
  loc,
  kind: 'styled',
  quasis: ['color: red;'],
  exprs: css
    ? [
        {
          loc,
          text: 'x',
          shape: 'css',
          css,
          read: { k: 'unknown', text: 'x', loc },
        },
      ]
    : [],
  decls: [],
});

const serve = (files: Record<string, unknown>) => {
  const calls: string[] = [];
  const fetch = async (url: string) => {
    calls.push(url);
    const v = files[url];
    return {
      ok: v !== undefined,
      text: async () => (typeof v === 'string' ? v : JSON.stringify(v)),
    };
  };
  return { calls, fetch };
};

describe('the index client', () => {
  const a = t('a.tsx:1:0', 'a.tsx', 'b.tsx:2:0');
  const b = t('b.tsx:2:0', 'b.tsx');
  const files = {
    'i/meta.json': { version: 1, commit: 'abc' },
    'i/lookup.json': { [fnv1a32('color: red;')]: ['b.tsx:2:0', 'a.tsx:1:0'] },
    [`i/files/${fnv1a32('a.tsx')}.json`]: { file: 'a.tsx', templates: [a] },
    [`i/files/${fnv1a32('b.tsx')}.json`]: { file: 'b.tsx', templates: [b] },
    'src/abc/a.tsx': 'const a = 1;',
  };

  it('looks up candidates, loads what a template reaches, caches every fetch', async () => {
    const { calls, fetch } = serve(files);
    const c = createIndexClient({
      base: 'i/',
      fetch,
      sourceUrl: (x, f) => `src/${x}/${f}`,
    });
    expect(await c.candidates(['color: red;', () => 1, 'color: red;'])).toEqual(
      ['b.tsx:2:0', 'a.tsx:1:0']
    );
    expect((await c.load('a.tsx:1:0'))?.id).toBe('a.tsx:1:0');
    expect(c.get('b.tsx:2:0')?.id).toBe('b.tsx:2:0');
    expect(await c.source('a.tsx')).toBe('const a = 1;');
    expect(await c.styles()).toBeUndefined();
    await c.load('a.tsx:1:0');
    expect(new Set(calls).size).toBe(calls.length);
  });

  it('tries the blank list for rules with only blank strings', async () => {
    const { fetch } = serve({
      ...files,
      'i/lookup.json': {
        [fnv1a32('color: red;')]: ['a.tsx:1:0'],
        blank: ['b.tsx:2:0'],
      },
    });
    const c = createIndexClient({ base: 'i/', fetch });
    expect(await c.candidates(['\n  ', () => 1, '\n'])).toEqual(['b.tsx:2:0']);
    expect(await c.candidates([() => 1])).toEqual(['b.tsx:2:0']);
    expect(await c.candidates(['color: red;', '\n'])).toEqual(['a.tsx:1:0']);
  });

  it('refuses another index version and a shard of another file', async () => {
    const { fetch } = serve({
      'i/meta.json': { version: 2, commit: 'abc' },
      [`i/files/${fnv1a32('a.tsx')}.json`]: { file: 'z.tsx', templates: [a] },
    });
    const c = createIndexClient({ base: 'i/', fetch });
    expect(await c.meta()).toBeUndefined();
    expect(await c.load('a.tsx:1:0')).toBeUndefined();
  });

  it('links a line at the index commit', () => {
    expect(githubLink('abc', 'app/x.tsx', 3)).toBe(
      'https://github.com/CitizenLabDotCo/citizenlab/blob/abc/front/app/x.tsx#L3'
    );
  });
});
