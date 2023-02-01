import inputs from '../../fixtures/inputs';

export const useInputs = () => {
  return { data: { data: inputs } };
};

export const useInfinite = () => {
  return { pages: [{ data: inputs, links: {} }], pageParams: [] };
};

export const useInput = () => {
  return { data: { data: inputs[0] } };
};
