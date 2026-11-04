import type { TokenMeta } from './data';
import { pickerGroups } from './tokenPicker';

const t = (
  name: string,
  tier: 1 | 2,
  value: string,
  extra: Partial<TokenMeta> = {}
): TokenMeta =>
  ({
    name,
    category: 'space',
    tier,
    value,
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
const live = Object.fromEntries(META.map((m) => [m.name, m.value]));
const space = (x: TokenMeta) => x.category === 'space';

describe('pickerGroups', () => {
  it('pins matches, then semantic, then scale; hides deprecated and other categories', () => {
    const groups = pickerGroups(META, space, live, '12px', '');
    expect(groups.map((g) => [g.id, g.tokens.map((x) => x.name)])).toEqual([
      ['match', ['--gv-gutter', '--gv-space-3']],
      ['scale', ['--gv-space-2']],
    ]);
  });

  it('lists what the query finds as one ranked list', () => {
    expect(pickerGroups(META, space, live, '', 'gut')).toEqual([
      { id: 'results', label: 'Results', tokens: [META[2]] },
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

describe('pickerGroups search', () => {
  const colour = (
    name: string,
    tier: 1 | 2,
    value: string,
    legacy: string[] = []
  ) => t(name, tier, value, { category: 'color', legacy });
  const COLOURS = [
    colour('--gv-grey-500', 1, '#BDBDBD'),
    colour('--gv-grey-700', 1, '#767676'),
    colour('--gv-cool-grey-600', 1, '#596B7A'),
    colour('--gv-disabled', 2, '#BDBDBD', ['colors.disabled']),
    colour('--gv-text-secondary', 2, '#596B7A', ['colors.textSecondary']),
    colour('--gv-text-primary', 2, '#333333', ['colors.textPrimary']),
    colour('--gv-border-dark', 2, '#767676'),
  ];
  const values = Object.fromEntries(COLOURS.map((m) => [m.name, m.value]));
  const find = (query: string) =>
    pickerGroups(COLOURS, () => true, values, '#BDBDBD', query).flatMap((g) =>
      g.tokens.map((x) => x.name)
    );

  it('reads the --gv- prefix, var() and a bare --gv as no filter', () => {
    expect(find('--gv')).toHaveLength(COLOURS.length);
    expect(find('var(--gv-')).toHaveLength(COLOURS.length);
    expect(find('--gv-text-secondary')[0]).toBe('--gv-text-secondary');
    expect(find('var(--gv-disabled)')[0]).toBe('--gv-disabled');
  });

  it('puts the closest name on top: exact, then start, then words', () => {
    expect(find('text')).toEqual(['--gv-text-primary', '--gv-text-secondary']);
    expect(find('grey')[0]).toBe('--gv-grey-500');
    expect(find('text secondary')[0]).toBe('--gv-text-secondary');
    expect(find('secondary text')[0]).toBe('--gv-text-secondary');
    expect(find('textSecondary')[0]).toBe('--gv-text-secondary');
  });

  it('finds a token by its value or its legacy name', () => {
    expect(find('#596b')).toEqual([
      '--gv-text-secondary',
      '--gv-cool-grey-600',
    ]);
    expect(find('767676')).toEqual(['--gv-border-dark', '--gv-grey-700']);
    expect(find('colors.disabled')[0]).toBe('--gv-disabled');
  });

  it('forgives letters left out and one typo', () => {
    expect(find('txtsec')[0]).toBe('--gv-text-secondary');
    expect(find('secondery')[0]).toBe('--gv-text-secondary');
    expect(find('disbled')[0]).toBe('--gv-disabled');
  });

  it('finds nothing for nonsense', () => {
    expect(find('zzz')).toEqual([]);
  });
});
