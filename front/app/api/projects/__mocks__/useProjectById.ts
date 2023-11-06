import { project1 } from './_mockServer';

export default jest.fn(() => {
  return { data: { data: project1 } };
});
