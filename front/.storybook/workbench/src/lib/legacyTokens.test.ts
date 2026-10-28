import tokensMeta from '../../../../app/design-system/tokens/tokens.meta.json';

import type { TokenMeta } from './data';
import { lookWords, suggestionsFor } from './legacyTokens';

const META = tokensMeta as TokenMeta[];
const valueOf = (name: string) =>
  META.find((t) => t.name === name)?.value ?? '';

describe('suggestionsFor', () => {
  it('offers every token listing theme.borderRadius, never one picked silently', () => {
    const s = suggestionsFor('theme.borderRadius', '3px', META, valueOf);
    expect(s.map((x) => x.token)).toEqual([
      '--gv-radius-control',
      '--gv-radius-panel',
    ]);
    expect(s.every((x) => x.sameLook)).toBe(true);
  });

  it('says when the listed token changes the look (bo.borderRadius is 8px)', () => {
    const [s] = suggestionsFor('bo.borderRadius', '8px', META, valueOf);
    expect(s.token).toBe('--gv-radius-control');
    expect(s.sameLook).toBe(false);
    expect(lookWords(s)).toBe('changes the look: 8px → 3px');
  });

  it('reads the font size leaf', () => {
    const s = suggestionsFor('fontSizes.base', '16px', META, valueOf);
    expect(s.map((x) => [x.token, lookWords(x)])).toEqual([
      ['--gv-fs-base', 'same look'],
    ]);
  });

  it('offers nothing without a legacy key or for an unlisted one', () => {
    expect(suggestionsFor(undefined, '3px', META, valueOf)).toEqual([]);
    expect(suggestionsFor('theme.nothing', '3px', META, valueOf)).toEqual([]);
  });
});
