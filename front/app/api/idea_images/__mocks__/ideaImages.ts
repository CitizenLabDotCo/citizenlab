import { ideaImagesData } from './_mockServer';

export default jest.fn(() => {
  return { data: { data: ideaImagesData } };
});
