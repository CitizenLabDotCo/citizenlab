import { ideasData } from './useAddOfflineIdeas';

export default jest.fn(() => {
  return { data: { data: ideasData } };
});
