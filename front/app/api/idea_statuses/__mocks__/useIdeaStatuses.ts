import { ideaStatusesData } from './_mockServer';

export default jest.fn(() => {
  return { data: { data: ideaStatusesData } };
});
