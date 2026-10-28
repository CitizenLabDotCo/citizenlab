import path from 'path';

import {
  buildAudit,
  clipErrors,
  errorText,
  OUT_PATH,
  parseAuditArgs,
  selectIds,
  StoryAuditEntry,
  summarise,
} from './audit-stories';

const entry = (over: Partial<StoryAuditEntry> = {}): StoryAuditEntry => ({
  rendered: true,
  blank: false,
  consoleErrors: [],
  ms: 100,
  trace: null,
  ...over,
});

describe('parseAuditArgs', () => {
  it('defaults to the local build and the committed file', () => {
    expect(parseAuditArgs([])).toEqual({
      url: 'http://127.0.0.1:8090/storybook/',
      out: OUT_PATH,
      only: undefined,
    });
  });

  it('reads --url with one trailing slash, --out and --only', () => {
    const args = parseAuditArgs([
      '--url',
      'http://localhost:6006',
      '--out',
      'audit.json',
      '--only',
      'a--x, b--y,',
    ]);
    expect(args.url).toBe('http://localhost:6006/');
    expect(args.out).toBe(path.resolve('audit.json'));
    expect(args.only).toEqual(['a--x', 'b--y']);
  });

  it('rejects an unknown flag and a flag without a value', () => {
    expect(() => parseAuditArgs(['--stories', 'x'])).toThrow(
      'Unknown argument --stories'
    );
    expect(() => parseAuditArgs(['--url'])).toThrow('Missing value for --url');
  });
});

describe('selectIds', () => {
  const all = ['a--one', 'b--two', 'c--three'];

  it('keeps every story without --only', () => {
    expect(selectIds(all)).toEqual(all);
  });

  it('keeps the named stories once, sorted', () => {
    expect(selectIds(all, ['c--three', 'a--one', 'c--three'])).toEqual([
      'a--one',
      'c--three',
    ]);
  });

  it('names the ids the index lacks', () => {
    expect(() => selectIds(all, ['a--one', 'z--nope'])).toThrow(
      'Not in the story index: z--nope'
    );
  });
});

describe('errorText', () => {
  it('reads a storyErrored title and description', () => {
    expect(
      errorText('storyErrored', {
        title: 'Missing export',
        description: 'No default\nmore',
      })
    ).toBe('Missing export: No default');
  });

  it('reads a thrown error by its name and message', () => {
    expect(
      errorText('storyThrewException', {
        name: 'TypeError',
        message: 'x is undefined',
        stack: 'at y',
      })
    ).toBe('TypeError: x is undefined');
  });

  it('marks a failed play function', () => {
    expect(
      errorText('playFunctionThrewException', { message: 'no button' })
    ).toBe('play: no button');
  });

  it('falls back to the event name', () => {
    expect(errorText('storyErrored', null)).toBe('storyErrored');
  });
});

describe('clipErrors', () => {
  it('keeps at most 10 errors of 300 characters', () => {
    const out = clipErrors(Array.from({ length: 12 }, () => 'e'.repeat(400)));
    expect(out).toHaveLength(10);
    expect(out[0]).toHaveLength(300);
  });
});

describe('buildAudit', () => {
  it('sorts the stories by id', () => {
    const audit = buildAudit('abc', '2026-10-27T00:00:00.000Z', {
      'b--two': entry(),
      'a--one': entry(),
    });
    expect(audit.commit).toBe('abc');
    expect(Object.keys(audit.stories)).toEqual(['a--one', 'b--two']);
  });

  it('keeps the stories of the previous file a partial run left out', () => {
    const previous = buildAudit('old', '2026-10-26T00:00:00.000Z', {
      'a--one': entry({ ms: 1 }),
      'c--three': entry({ ms: 3 }),
    });
    const audit = buildAudit(
      'new',
      '2026-10-27T00:00:00.000Z',
      { 'a--one': entry({ ms: 9 }), 'b--two': entry() },
      previous
    );
    expect(Object.keys(audit.stories)).toEqual([
      'a--one',
      'b--two',
      'c--three',
    ]);
    expect(audit.stories['a--one'].ms).toBe(9);
    expect(audit.stories['c--three'].ms).toBe(3);
  });
});

describe('summarise', () => {
  it('counts renders, errors and blanks, and lists the slowest', () => {
    const audit = buildAudit('abc', '2026-10-27T00:00:00.000Z', {
      'a--ok': entry({ ms: 50 }),
      'b--blank': entry({ blank: true, ms: 70 }),
      'c--error': entry({
        rendered: false,
        error: 'boom',
        blank: true,
        ms: 900,
      }),
      'd--ok': entry({ ms: 70 }),
    });
    expect(summarise(audit, 3)).toEqual({
      stories: 4,
      rendered: 2,
      errors: ['c--error'],
      blank: ['b--blank'],
      slowest: [
        { id: 'c--error', ms: 900 },
        { id: 'b--blank', ms: 70 },
        { id: 'd--ok', ms: 70 },
      ],
    });
  });
});
