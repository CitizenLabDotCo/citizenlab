import fs from 'fs';
import path from 'path';

import { SDK_EXPORT_NAMES } from './sdkContract';

describe('custom block SDK shim', () => {
  it('exports exactly the names in SDK_EXPORT_NAMES', () => {
    const shimPath = path.join(
      __dirname,
      '../../../../../public/custom-block-sdk/v1.js'
    );
    const shim = fs.readFileSync(shimPath, 'utf-8');

    const exported = [...shim.matchAll(/^export const (\w+) =/gm)].map(
      (match) => match[1]
    );

    expect(exported.sort()).toEqual([...SDK_EXPORT_NAMES].sort());
  });
});
