const getSelectedCategoryFilter = (
  categoryQuery?: string,
  processedQuery?: string
) =>
  processedQuery === 'false'
    ? 'recentlyPosted'
    : categoryQuery
    ? 'category'
    : categoryQuery === ''
    ? 'notCategorized'
    : 'allInput';

export default getSelectedCategoryFilter;
