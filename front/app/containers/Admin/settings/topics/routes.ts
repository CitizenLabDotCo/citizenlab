import Loadable from 'react-loadable';

export default () => ({
  path: 'topics',
  name: 'admin topics',
  indexRoute: {
    name: 'admin topics index',
    component: Loadable({
      loader: () => import('./all'),
      loading: () => null,
    }),
  },
  childRoutes: [
    {
      path: 'new',
      name: 'admin topics new',
      component: Loadable({
        loader: () => import('./New'),
        loading: () => null,
      }),
    },
    {
      path: ':topicId/edit',
      name: 'admin topic edit',
      component: Loadable({
        loader: () => import('./Edit'),
        loading: () => null,
      }),
    },
  ],
});
