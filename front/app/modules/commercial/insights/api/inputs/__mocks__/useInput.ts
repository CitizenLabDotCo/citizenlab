import inputs from 'modules/commercial/insights/fixtures/inputs';

export default jest.fn(() => {
  return { data: { data: inputs[0] } };
});
