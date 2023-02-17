import views from 'modules/commercial/insights/fixtures/views';

export default jest.fn(() => {
  return { data: { data: views[0] } };
});
