import { projectFolderData } from './data';

export { projectFolderData };

export default jest.fn(() => {
  return { data: { data: projectFolderData } };
});
