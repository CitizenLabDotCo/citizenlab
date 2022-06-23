import { getLocalized, getLocalizedWithFallback } from './i18n';

const multiloc = {
  en: 'english',
  'nl-NL': 'nederlands',
};

const _ = undefined;

describe('getLocalized', () => {
  describe('args: none', () => {
    it('returns empty string', () => {
      expect(getLocalized(_, _, _)).toBe('');
    });
  });

  describe('args: multiloc, locale, tenantLocales', () => {
    it('returns correct string if locale in tenantLocales', () => {
      const result = getLocalized(multiloc, 'en', ['en', 'nl-NL']);
      expect(result).toBe('english');
    });

    it('returns most similar language in multiloc if locale not in multiloc', () => {
      const result = getLocalized(multiloc, 'nl-BE', ['en', 'nl-NL']);
      expect(result).toBe('nederlands');
    });

    it('returns most similar language in multiloc if locale not in multiloc but in tenantLocales', () => {
      const result = getLocalized(multiloc, 'nl-BE', ['en', 'nl-NL', 'nl-BE']);
      expect(result).toBe('nederlands');
    });
  });

  describe('args: multiloc, locale, tenantLocales, maxChar', () => {
    it('correctly truncates string', () => {
      const result = getLocalized(multiloc, 'en', ['en', 'nl-NL'], 6);
      expect(result).toBe('eng...');
    });
  });
});

describe('getLocalizedWithFallback', () => {
  describe('args: none', () => {
    it('returns empty string', () => {
      const result = getLocalizedWithFallback(_, _, _, _, _);
      expect(result).toBe('');
    });
  });

  describe('args: only fallback', () => {
    it('returns fallback', () => {
      const result = getLocalizedWithFallback(_, _, _, _, 'fallback');
      expect(result).toBe('fallback');
    });
  });

  describe('args: all except maxChar', () => {
    it('returns correct string if locale in tenantLocales', () => {
      const result = getLocalizedWithFallback(
        multiloc,
        'en',
        ['en', 'nl-NL'],
        _,
        'fallback'
      );
      expect(result).toBe('english');
    });

    it('returns fallback if locale not in multiloc', () => {
      const result = getLocalizedWithFallback(
        multiloc,
        'nl-BE',
        ['en', 'nl-NL'],
        _,
        'fallback'
      );
      expect(result).toBe('fallback');
    });
  });

  describe('args: all', () => {
    it('returns correct truncated string if locale in tenantLocales', () => {
      const result = getLocalizedWithFallback(
        multiloc,
        'en',
        ['en', 'nl-NL'],
        6,
        'fallback'
      );
      expect(result).toBe('eng...');
    });

    it('returns truncated fallback if locale not in multiloc', () => {
      const result = getLocalizedWithFallback(
        multiloc,
        'nl-BE',
        ['en', 'nl-NL'],
        6,
        'fallback'
      );
      expect(result).toBe('fal...');
    });
  });
});
