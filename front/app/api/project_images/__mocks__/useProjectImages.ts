import { projectImagesData } from './_mockServer';

export default jest.fn(() => {
  return { data: { data: projectImagesData } };
});
