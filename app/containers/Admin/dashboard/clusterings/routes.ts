import Loadable from 'react-loadable';
import Spinner from 'components/UI/Spinner';

export default () => ({
  path: 'insights',
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
  ],
});
