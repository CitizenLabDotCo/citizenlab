import { projects } from './_mockServer';

export default jest.fn(() => {
  return { data: projects };
});
