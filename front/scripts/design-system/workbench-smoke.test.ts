import path from 'path';

import { resolveStaticPath } from './workbench-smoke';

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
