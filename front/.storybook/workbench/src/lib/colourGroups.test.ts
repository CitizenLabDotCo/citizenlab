import tokensMeta from '../../../../app/design-system/tokens/tokens.meta.json';

import { colourGroups, rampOf, stepOf } from './colourGroups';
import type { TokenMeta } from './data';

const colours = (tokensMeta as TokenMeta[]).filter(
  (t) => t.category === 'color'
);

describe('colourGroups', () => {
  it('puts every colour token in exactly one group', () => {
    const groups = colourGroups(colours);
    const names = groups.flatMap((g) => g.tokens.map((t) => t.name));
    expect(names.sort()).toEqual(colours.map((t) => t.name).sort());
  });

  it('groups palette tokens by ramp, roles by where they are used', () => {
    expect(rampOf('--gv-cool-grey-600')).toBe('cool-grey');
    expect(rampOf('--gv-grey-800')).toBe('grey');
    expect(rampOf('--gv-white')).toBe('grey');
    expect(rampOf('--gv-green-mint')).toBe('green');
    expect(rampOf('--gv-primary')).toBeUndefined();
    const ids = colourGroups(colours).map((g) => g.id);
    expect(ids[0]).toBe('grey');
    expect(ids).toContain('bo');
  });

  it('captions a swatch with the step or the role', () => {
    expect(stepOf('--gv-grey-800')).toBe('800');
    expect(stepOf('--gv-white')).toBe('white');
    expect(stepOf('--gv-color-tenant-primary')).toBe('tenant-primary');
  });
});
