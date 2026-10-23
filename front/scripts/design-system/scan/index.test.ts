import fs from 'fs';
import os from 'os';
import path from 'path';

import { isAccepted, loadAllow, loadTokens, summaryMergeBase } from './index';
import { Finding } from './schema';

const finding: Finding = {
  file: 'app/x.tsx',
  line: 10,
  col: 1,
  raw: '13px',
  category: 'px',
  confidence: 'low',
};

describe('isAccepted', () => {
  it('matches file and raw value with the line within 3', () => {
    expect(
      isAccepted(finding, [{ file: 'app/x.tsx', raw: '13px', line: 13 }])
    ).toBe(true);
    expect(
      isAccepted(finding, [{ file: 'app/x.tsx', value: '13px', line: 7 }])
    ).toBe(true);
    expect(isAccepted(finding, [{ file: 'app/x.tsx', raw: '13px' }])).toBe(
      true
    );
  });

  it('rejects another line, value or file', () => {
    expect(
      isAccepted(finding, [{ file: 'app/x.tsx', raw: '13px', line: 14 }])
    ).toBe(false);
    expect(
      isAccepted(finding, [{ file: 'app/x.tsx', raw: '12px', line: 10 }])
    ).toBe(false);
    expect(
      isAccepted(finding, [{ file: 'app/y.tsx', raw: '13px', line: 10 }])
    ).toBe(false);
  });
});

describe('loadTokens and loadAllow', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ds-scan-'));
  const write = (name: string, body: string) => {
    const file = path.join(dir, name);
    fs.writeFileSync(file, body);
    return file;
  };
  let warn: jest.SpyInstance;
  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => warn.mockRestore());

  it('warns and falls back to [] on malformed JSON', () => {
    expect(loadTokens(write('bad-tokens.json', '{ nope'))).toEqual([]);
    expect(loadAllow(write('bad-allow.json', '{"accepted": [}'))).toEqual([]);
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it('falls back to [] when the files are missing', () => {
    expect(loadTokens(path.join(dir, 'none.json'))).toEqual([]);
    expect(loadAllow(path.join(dir, 'none.json'))).toEqual([]);
  });

  it('reads a token list or {tokens: [...]} and the accepted list', () => {
    const tok = {
      name: '--gv-space-1',
      category: 'space',
      tier: 1,
      values: { today: '4px', redesign: '4px' },
      legacy: [],
    };
    expect(loadTokens(write('t1.json', JSON.stringify([tok])))).toEqual([tok]);
    expect(
      loadTokens(write('t2.json', JSON.stringify({ tokens: [tok] })))
    ).toEqual([tok]);
    expect(
      loadAllow(write('a.json', '{"accepted": [{"file": "x", "raw": "1px"}]}'))
    ).toEqual([{ file: 'x', raw: '1px' }]);
  });
});

describe('summaryMergeBase', () => {
  // The summary caches the merge-base so ds:changes can use it in a clone
  // without a master ref.
  const git =
    (refs: Record<string, string>) =>
    (args: string[]): string | undefined =>
      args[0] === 'merge-base' ? refs[args[2]] : undefined;

  it('uses master, then origin/master', () => {
    expect(summaryMergeBase(git({ master: 'a\n', 'origin/master': 'b' }))).toBe(
      'a'
    );
    expect(summaryMergeBase(git({ 'origin/master': 'b\n' }))).toBe('b');
  });

  it('keeps the previous summary value when neither ref exists', () => {
    expect(summaryMergeBase(git({}), { mergeBase: 'old' })).toBe('old');
    expect(summaryMergeBase(git({}), { mergeBase: 3 })).toBeUndefined();
    expect(summaryMergeBase(git({}))).toBeUndefined();
  });
});
