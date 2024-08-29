import { phasesData } from './_mockServer';

export default jest.fn(() => {
  return { data: { data: phasesData } };
});
