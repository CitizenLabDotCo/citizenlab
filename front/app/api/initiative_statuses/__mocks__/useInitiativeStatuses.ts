import { initiativeStatusesData } from './_mockServer';

export default jest.fn(() => {
  return { data: { data: initiativeStatusesData } };
});
