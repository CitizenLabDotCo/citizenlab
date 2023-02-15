import inputs from '../../../fixtures/inputs';
import links from '../../../fixtures/links';

export default jest.fn(() => {
  return { data: { data: inputs, links } };
});
