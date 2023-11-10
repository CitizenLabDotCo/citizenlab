import { mockAuthUserData } from './_mockServer';

export default jest.fn(() => {
  return { data: { data: mockAuthUserData } };
});
