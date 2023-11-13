import { ideaData } from './_mockServer';

export default jest.fn(() => {
  return { data: { data: ideaData[0] } };
});
