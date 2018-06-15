import loadAndRender from 'utils/loadAndRender';

export default () => ({
  path: '/admin/invitations',
  name: 'admin invitations',
  getComponent: loadAndRender(import('containers/Admin/invitations')),
});
