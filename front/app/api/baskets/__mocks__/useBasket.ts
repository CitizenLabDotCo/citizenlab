import { basketData } from './_mockServer';

export default jest.fn(() => {
  return { data: { data: basketData } };
});
