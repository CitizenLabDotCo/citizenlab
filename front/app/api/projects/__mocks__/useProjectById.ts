import { project1 } from './useProjects';

export default jest.fn(() => {
  return { data: { data: project1 } };
});
