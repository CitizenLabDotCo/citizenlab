import inputs from '../../fixtures/inputs';
const links = {
  self: 'http://localhost:3000/web_api/v1/insights/views/1b34e2bf-9e43-4f4d-a026-a9e8846ddbd9/inputs?page%5Bnumber%5D=1&page%5Bsize%5D=20',
  last: 'http://localhost:3000/web_api/v1/insights/views/1b34e2bf-9e43-4f4d-a026-a9e8846ddbd9/inputs?page%5Bnumber%5D=1&page%5Bsize%5D=20',
};

export const useInputs = jest.fn(() => {
  return { data: { data: inputs, links } };
});

export const useInfiniteInputs = jest.fn(() => {
  return {
    data: {
      pages: [
        {
          data: inputs,
          links,
        },
      ],
    },
    pageParams: [],
  };
});

export const useInput = jest.fn(() => {
  return { data: { data: inputs[0] } };
});
