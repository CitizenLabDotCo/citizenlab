import path from 'path';

import { pickButtonStory, resolveStaticPath } from './workbench-smoke';

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
        entry('components-button--docs', 'docs'),
        entry('components-button--delete'),
        entry('components-button--primary'),
      ]),
    };
    expect(pickButtonStory(index)).toBe('components-button--primary');
  });

  it('falls back to any Button story, else null', () => {
    expect(
      pickButtonStory({
        entries: Object.fromEntries([entry('components-button--white')]),
      })
    ).toBe('components-button--white');
    expect(pickButtonStory({ entries: {} })).toBeNull();
    expect(pickButtonStory(null)).toBeNull();
  });
});
