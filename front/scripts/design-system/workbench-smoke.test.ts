import path from 'path';

import {
  overrideNamesOfHash,
  pickButtonStory,
  resolveStaticPath,
} from './workbench-smoke';

describe('resolveStaticPath', () => {
  const root = path.resolve('/srv/static/sb');

  it('resolves paths inside the root', () => {
    expect(resolveStaticPath(root, '/workbench/index.html')).toBe(
      path.join(root, 'workbench/index.html')
    );
    expect(resolveStaticPath(root, '/')).toBe(root);
    expect(resolveStaticPath(root, '/a/../index.json')).toBe(
      path.join(root, 'index.json')
    );
  });

  it('rejects encoded parent segments', () => {
    expect(resolveStaticPath(root, '/..%2f..%2fetc/passwd')).toBeNull();
    expect(resolveStaticPath(root, '/%2e%2e%2f%2e%2e%2fetc')).toBeNull();
  });

  it('rejects sibling folders that share the root prefix', () => {
    expect(resolveStaticPath(root, '/..%2fsb-other/secret')).toBeNull();
  });

  it('rejects malformed escapes', () => {
    expect(resolveStaticPath(root, '/%E0%A4%A')).toBeNull();
  });
});

describe('pickButtonStory', () => {
  const entry = (id: string, type = 'story') => [id, { id, type }];

  it('prefers the primary Button story', () => {
    const index = {
      entries: Object.fromEntries([
        entry('components-actions-button--docs', 'docs'),
        entry('components-actions-iconbutton--default'),
        entry('components-actions-button--delete'),
        entry('components-actions-button--primary'),
      ]),
    };
    expect(pickButtonStory(index)).toBe('components-actions-button--primary');
  });

  it('falls back to any Button story, else null', () => {
    expect(
      pickButtonStory({
        entries: Object.fromEntries([
          entry('components-actions-button--white'),
        ]),
      })
    ).toBe('components-actions-button--white');
    expect(pickButtonStory({ entries: {} })).toBeNull();
    expect(pickButtonStory(null)).toBeNull();
  });
});

describe('overrideNamesOfHash', () => {
  const o = (json: string) => Buffer.from(json, 'utf8').toString('base64url');

  it('reads the token names of a share-link hash', () => {
    expect(
      overrideNamesOfHash(
        `#/foundations/radius?o=${o('{"--gv-radius-control":"12px"}')}`
      )
    ).toEqual(['--gv-radius-control']);
  });

  it('is empty without a payload or with a damaged one', () => {
    expect(overrideNamesOfHash('#/foundations/radius')).toEqual([]);
    expect(overrideNamesOfHash('#/x?o=%%%')).toEqual([]);
  });
});
