import type { TokenMeta } from './data';
import { pickerGroups } from './tokenPicker';

const t = (
  name: string,
  tier: 1 | 2,
  today: string,
  extra: Partial<TokenMeta> = {}
): TokenMeta =>
  ({
    name,
    category: 'space',
    tier,
    values: { today, redesign: today },
    legacy: [],
    ...extra,
  } as TokenMeta);

const META = [
  t('--gv-space-2', 1, '8px'),
  t('--gv-space-3', 1, '12px'),
  t('--gv-gutter', 2, '12px'),
  t('--gv-old', 2, '12px', { deprecated: true }),
  t('--gv-white', 1, '#fff', { category: 'color' }),
];
const live = Object.fromEntries(META.map((m) => [m.name, m.values.today]));
const space = (x: TokenMeta) => x.category === 'space';

describe('pickerGroups', () => {
  it('pins matches, then semantic, then scale; hides deprecated and other categories', () => {
    const groups = pickerGroups(META, space, live, '12px', '');
    expect(groups.map((g) => [g.id, g.tokens.map((x) => x.name)])).toEqual([
      ['match', ['--gv-gutter', '--gv-space-3']],
      ['scale', ['--gv-space-2']],
    ]);
  });

  it('filters by the query on the short name', () => {
    expect(pickerGroups(META, space, live, '', 'gut')).toEqual([
      { id: 'semantic', label: 'Semantic', tokens: [META[2]] },
    ]);
  });

  it('leaves out empty groups', () => {
    expect(pickerGroups(META, space, live, '', 'zzz')).toEqual([]);
  });
});

describe('pickerGroups colours', () => {
  it('matches a rendered rgb() against a hex token', () => {
    const white = t('--gv-white', 1, '#ffffff', { category: 'color' });
    const groups = pickerGroups(
      [white],
      () => true,
      {},
      'rgb(255, 255, 255)',
      ''
    );
    expect(groups[0]).toMatchObject({ id: 'match', tokens: [white] });
  });
});
