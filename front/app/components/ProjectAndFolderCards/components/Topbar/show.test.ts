import { getShowFilters } from './show';

describe('getShowFilters', () => {
  describe('desktop', () => {
    it('shows filters if there are admin publications', () => {
      const result = getShowFilters(
        false,
        true,
        { all: 2, published: 2 },
        [],
        []
      );
      expect(result).toBe(true);
    });

    it('does not show filters if there are no admin publications', () => {
      const result = getShowFilters(false, false, { all: 0 }, [], []);
      expect(result).toBe(false);
    });

    it('always shows filters if any topics or areas selected', () => {
      const result1 = getShowFilters(
        false,
        true,
        { all: 2, published: 2 },
        ['test'],
        []
      );
      expect(result1).toBe(true);

      const result2 = getShowFilters(false, false, { all: 0 }, ['test'], []);
      expect(result2).toBe(true);
    });
  });

  describe('phone', () => {
    it('shows filters if current tab has admin publications', () => {
      const result = getShowFilters(
        true,
        true,
        { all: 2, published: 2 },
        [],
        []
      );
      expect(result).toBe(true);
    });

    it('does not show filters if current tab no admin publications', () => {
      const result = getShowFilters(
        true,
        false,
        { all: 2, published: 2 },
        [],
        []
      );
      expect(result).toBe(false);
    });

    it('always shows filters if any topics or areas selected', () => {
      const result1 = getShowFilters(
        true,
        true,
        { all: 2, published: 2 },
        ['test'],
        []
      );
      expect(result1).toBe(true);

      const result2 = getShowFilters(
        true,
        false,
        { all: 2, published: 2 },
        ['test'],
        []
      );
      expect(result2).toBe(true);
    });
  });
});
