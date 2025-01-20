import { allowMultilinePaste } from './utils';

describe('allowMultilinePaste', () => {
  it('should return true if all options from the given index are empty', () => {
    const options = [
      { title_multiloc: { en: 'Text' } },
      { title_multiloc: { en: '' } },
      { title_multiloc: { en: undefined } },
    ];

    const result = allowMultilinePaste({ options, index: 1, locale: 'en' });
    expect(result).toBe(true);
  });

  it('should return false if not all options from the given index are empty', () => {
    const options = [
      { title_multiloc: { en: 'Text' } },
      { title_multiloc: { en: '' } },
      { title_multiloc: { en: 'Something' } },
    ];

    const result = allowMultilinePaste({ options, index: 1, locale: 'en' });
    expect(result).toBe(false);
  });
});
