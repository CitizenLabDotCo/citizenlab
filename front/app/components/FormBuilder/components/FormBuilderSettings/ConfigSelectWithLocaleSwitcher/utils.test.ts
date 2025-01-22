import { allowMultilinePaste, updateFormOnMultlinePaste } from './utils';

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

describe('updateFormOnMultlinePaste', () => {
  it('correctly sanitizes line with summarization points', () => {
    const lines = ['• One', '• Two', '• Three'];

    const options = [{ title_multiloc: { en: '' } }];

    const update = jest.fn();
    const append = jest.fn();

    updateFormOnMultlinePaste({
      update,
      append,
      locale: 'en',
      lines,
      index: 0,
      options,
    });

    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith(0, {
      title_multiloc: {
        en: 'One',
      },
      temp_id: expect.any(String),
    });

    expect(append).toHaveBeenCalledTimes(2);
    expect(append).toHaveBeenCalledWith({
      title_multiloc: {
        en: 'Two',
      },
      temp_id: expect.any(String),
    });
  });
});
