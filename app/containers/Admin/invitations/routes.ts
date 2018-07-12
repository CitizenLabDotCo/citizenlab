import loadAndRender from 'utils/loadAndRender';

export default () => ({
  path: 'invitations',
  name: 'admin invitations',
  getComponent: loadAndRender(import('containers/Admin/invitations')),
});
