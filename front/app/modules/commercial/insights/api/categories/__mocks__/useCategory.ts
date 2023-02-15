import categories from 'modules/commercial/insights/fixtures/categories';

export default jest.fn(() => {
  return { data: { data: categories[0] } };
});
