import { makeUser } from './useUsers';

export default jest.fn(() => {
  return { data: makeUser() };
});
