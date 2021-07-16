import getSelectedCategoryFilter from './getSelectedCategoryFilter';

describe('getSelectedCategoryFilter', () => {
  it('should return allInput if categoryQuery is undefined', () => {
    expect(getSelectedCategoryFilter()).toBe('allInput');
  });
  it('should return notCategorized if categoryQuery is empty string', () => {
    expect(getSelectedCategoryFilter('')).toBe('notCategorized');
  });
  it('should return category if categoryQuery is string', () => {
    expect(getSelectedCategoryFilter('some category')).toBe('category');
  });
});
