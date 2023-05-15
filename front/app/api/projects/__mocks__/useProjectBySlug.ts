import { project2 } from './useProjects';

export default jest.fn(() => {
  return { data: { data: project2 } };
});
