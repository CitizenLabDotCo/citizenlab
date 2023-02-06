import categories from '../../fixtures/categories';

export const useCategories = () => {
  return { data: { data: categories } };
};

export const useCategory = () => {
  return { data: { data: categories[0] } };
};

export const useAddCategory = () => {
  return { mutate: jest.fn() };
};

export const useUpdateCategory = () => {
  return { mutate: jest.fn() };
};

export const useDeleteAllCategories = () => {
  return { mutate: jest.fn() };
};

export const useDeleteCategory = () => {
  return { mutate: jest.fn() };
};
