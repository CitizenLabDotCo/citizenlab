import views from '../../../fixtures/views';

export default jest.fn(() => {
  return { data: { data: views } };
});
