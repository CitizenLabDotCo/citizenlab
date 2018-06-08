import loadAndRender from 'utils/loadAndRender';

export default () => ({
  path: 'cluster-viewer',
  getComponent: loadAndRender(import('./')),
});
