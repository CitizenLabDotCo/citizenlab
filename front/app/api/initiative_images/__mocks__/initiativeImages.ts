import { initiativeImagesData } from './_mockServer';

export default jest.fn(() => {
  return { data: { data: initiativeImagesData } };
});
