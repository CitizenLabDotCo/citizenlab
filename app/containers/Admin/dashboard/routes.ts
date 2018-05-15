import loadAndRender from 'utils/loadAndRender';

export default () => ({
  // path: '/admin/dashboard',
  name: 'Admin dashboard',
  getComponent: loadAndRender(import('containers/Admin/dashboard')),
});
