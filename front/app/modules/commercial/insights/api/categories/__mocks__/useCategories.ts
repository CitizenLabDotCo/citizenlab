import categories from '../../../fixtures/categories';

export default jest.fn(() => {
  return { data: { data: categories } };
});
