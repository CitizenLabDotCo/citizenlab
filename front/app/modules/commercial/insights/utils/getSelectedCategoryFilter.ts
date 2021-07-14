const getSelectedCategoryFilter = (categoryQuery?: string) =>
  categoryQuery
    ? 'category'
    : categoryQuery === ''
    ? 'notCategorized'
    : 'allInput';

export default getSelectedCategoryFilter;
