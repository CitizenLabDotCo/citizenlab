import { project2 } from './_mockServer';

export default jest.fn(() => {
  return { data: { data: project2 } };
});
