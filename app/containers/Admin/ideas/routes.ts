import loadAndRender from 'utils/loadAndRender';

export default () => ({
  path: 'ideas',
  name: 'admin Ideas',
  getComponent: loadAndRender(import('containers/Admin/ideas')),
  indexRoute: {
    name: 'admin ideas index',
    getComponent: loadAndRender(import('containers/Admin/ideas/all')),
  },
});
