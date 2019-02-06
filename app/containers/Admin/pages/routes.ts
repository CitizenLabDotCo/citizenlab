import Loadable from 'react-loadable';
import Spinner from 'components/UI/Spinner';

export default () => ({
  path: 'pages',
  component: Loadable({
    loader: () => import('./'),
    loading: Spinner
  }),
  indexRoute: {
    component: Loadable({
      loader: () => import('./All'),
      loading: Spinner
    }),
  },
  childRoutes: [
    {
      path: 'new',
      component: Loadable({
        loader: () => import('./New'),
        loading: Spinner
      }),
    },
    {
      path: ':pageId/editor/:locale',
      component: Loadable({
        loader: () => import('./BodyEditor'),
        loading: Spinner
      }),
    },
    {
      path: ':pageId',
      component: Loadable({
        loader: () => import('./Edit'),
        loading: Spinner
      }),
    },
  ],
});
