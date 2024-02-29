import { makeUser } from './useUsers';

const mockUser = makeUser();

export default jest.fn(() => {
  return { data: mockUser };
});
