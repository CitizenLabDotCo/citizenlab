import views from '../../fixtures/views';

export const useViews = () => {
  return { data: { data: views } };
};

export const useView = () => {
  return { data: { data: views[0] } };
};

export const useCreateView = () => {
  return { mutate: jest.fn() };
};

export const useUpdateView = () => {
  return { mutate: jest.fn() };
};

export const useDeleteView = () => {
  return { mutate: jest.fn() };
};
