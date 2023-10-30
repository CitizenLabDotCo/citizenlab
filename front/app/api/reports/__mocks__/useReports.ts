import { reportsData } from './_mockServer';

export default jest.fn(() => {
  return { data: { data: reportsData } };
});
