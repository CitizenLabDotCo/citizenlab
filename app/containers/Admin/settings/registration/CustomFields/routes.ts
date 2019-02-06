import Loadable from 'react-loadable';
import Spinner from 'components/UI/Spinner';

export default () => ({
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
      path: ':customFieldId',
      component: Loadable({
        loader: () => import('./Edit'),
        loading: Spinner
      }),
      childRoutes: [
        {
          path: 'general',
          component: Loadable({
            loader: () => import('./Edit/General'),
            loading: Spinner
          }),
        },
        {
          path: 'options',
          component: Loadable({
            loader: () => import('./Edit/Options'),
            loading: Spinner
          }),
        },
      ],
    },
  ],
});
