import { absolutizeShimImports } from './loadBlockModule';
import { SDK_SHIM_URL } from './sdkContract';

describe('absolutizeShimImports', () => {
  const origin = 'https://demo.govocal.com';

  it('rewrites double-quoted shim imports to absolute URLs', () => {
    const code = `import { jsx, Box } from "${SDK_SHIM_URL}";\nexport default () => null;`;

    expect(absolutizeShimImports(code, origin)).toContain(
      `from "https://demo.govocal.com${SDK_SHIM_URL}"`
    );
  });

  it('rewrites single-quoted shim imports to absolute URLs', () => {
    const code = `import { jsx } from '${SDK_SHIM_URL}';`;

    expect(absolutizeShimImports(code, origin)).toBe(
      `import { jsx } from 'https://demo.govocal.com${SDK_SHIM_URL}';`
    );
  });

  it('leaves other code untouched', () => {
    const code = 'const label = "v1.js"; export default () => null;';

    expect(absolutizeShimImports(code, origin)).toBe(code);
  });
});
