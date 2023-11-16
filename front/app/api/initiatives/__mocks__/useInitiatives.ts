import { initiativesData, links } from './_mockServer';

export default jest.fn(() => {
  return { data: { data: initiativesData, links } };
});
