import getInputsCategoryFilter from './getInputsCategoryFilter';

describe('getInputsCategoryFilter', () => {
  it('should return allInput if categoryQuery is undefined', () => {
    expect(getInputsCategoryFilter()).toBe('allInput');
  });
  it('should return notCategorized if categoryQuery is empty string', () => {
    expect(getInputsCategoryFilter('')).toBe('notCategorized');
  });
  it('should return category if categoryQuery is string', () => {
    expect(getInputsCategoryFilter('some category')).toBe('category');
  });
  it('should return recentlyPosted when processed query is false', () => {
    expect(getInputsCategoryFilter('', 'false')).toBe('recentlyPosted');
  });
});
