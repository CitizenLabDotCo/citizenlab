import { reportLayout } from './_mockServer';

export default jest.fn(() => {
  return { data: reportLayout };
});
