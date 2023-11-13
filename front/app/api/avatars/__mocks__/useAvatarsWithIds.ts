import { avatarsData } from './_mockServer';

export default jest.fn(() => {
  return [{ data: { data: avatarsData[0] } }];
});
