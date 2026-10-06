import fs from 'fs';
import path from 'path';

import { SDK_EXPORT_NAMES, SDK_SHIM_URL } from './contract';

const read = (relative: string) =>
  fs.readFileSync(path.join(__dirname, relative), 'utf-8');

// One contract, three artifacts: this list, the type definitions the custom
// block sandbox and the model read, and the shim the browser loads. A name that
// is in one and not the others is a block that typechecks and then throws, or a
// hook the model never learns it has.
describe('custom block SDK v1 contract', () => {
  it('is re-exported by the shim, name for name', () => {
    const shim = read(`../../../../../../public${SDK_SHIM_URL}`);

    const exported = [...shim.matchAll(/^export const (\w+) =/gm)].map(
      (match) => match[1]
    );

    expect(exported.sort()).toEqual([...SDK_EXPORT_NAMES].sort());
  });

  it('is declared by gv-sdk.d.ts, name for name', () => {
    const types = read('gv-sdk.d.ts');

    const declared = [...types.matchAll(/^ {2}export const (\w+)[:;]/gm)].map(
      (match) => match[1]
    );

    expect(declared.sort()).toEqual([...SDK_EXPORT_NAMES].sort());
  });
});
