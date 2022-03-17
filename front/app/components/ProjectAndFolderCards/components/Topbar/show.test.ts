import { getShowFilters } from './show';

describe('getShowFilters', () => {
  describe('desktop', () => {
    it('shows filters if there are admin publications', () => {
      const result = getShowFilters({
        smallerThanXlPhone: false,
        hasPublications: true,
        statusCounts: { all: 2, published: 2 },
        selectedTopics: [],
        selectedAreas: [],
      });

      expect(result).toBe(true);
    });

    it('does not show filters if there are no admin publications', () => {
      const result = getShowFilters({
        smallerThanXlPhone: false,
        hasPublications: false,
        statusCounts: { all: 0 },
        selectedTopics: [],
        selectedAreas: [],
      });

      expect(result).toBe(false);
    });

    it('always shows filters if any topics or areas selected', () => {
      const result1 = getShowFilters({
        smallerThanXlPhone: false,
        hasPublications: true,
        statusCounts: { all: 2, published: 2 },
        selectedTopics: ['test'],
        selectedAreas: [],
      });

      expect(result1).toBe(true);

      const result2 = getShowFilters({
        smallerThanXlPhone: false,
        hasPublications: false,
        statusCounts: { all: 0 },
        selectedTopics: ['test'],
        selectedAreas: [],
      });

      expect(result2).toBe(true);
    });
  });

  describe('phone', () => {
    it('shows filters if current tab has admin publications', () => {
      const result = getShowFilters({
        smallerThanXlPhone: true,
        hasPublications: true,
        statusCounts: { all: 2, published: 2 },
        selectedTopics: [],
        selectedAreas: [],
      });

      expect(result).toBe(true);
    });

    it('does not show filters if current tab no admin publications', () => {
      const result = getShowFilters({
        smallerThanXlPhone: true,
        hasPublications: false,
        statusCounts: { all: 2, published: 2 },
        selectedTopics: [],
        selectedAreas: [],
      });

      expect(result).toBe(false);
    });

    it('always shows filters if any topics or areas selected', () => {
      const result1 = getShowFilters({
        smallerThanXlPhone: true,
        hasPublications: true,
        statusCounts: { all: 2, published: 2 },
        selectedTopics: ['test'],
        selectedAreas: [],
      });

      expect(result1).toBe(true);

      const result2 = getShowFilters({
        smallerThanXlPhone: true,
        hasPublications: false,
        statusCounts: { all: 2, published: 2 },
        selectedTopics: ['test'],
        selectedAreas: [],
      });

      expect(result2).toBe(true);
    });
  });
});
