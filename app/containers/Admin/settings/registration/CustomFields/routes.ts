import Loadable from 'react-loadable';
import { FullPageCenteredSpinner } from 'components/UI/Spinner';

export default () => ({
  component: Loadable({
    loader: () => import('./'),
    loading: FullPageCenteredSpinner
  }),
  indexRoute: {
    component: Loadable({
      loader: () => import('./All'),
      loading: FullPageCenteredSpinner
    }),
  },
  childRoutes: [
    {
      path: 'new',
      component: Loadable({
        loader: () => import('./New'),
        loading: FullPageCenteredSpinner
      }),
    },
    {
      path: ':customFieldId',
      component: Loadable({
        loader: () => import('./Edit'),
        loading: FullPageCenteredSpinner
      }),
      childRoutes: [
        {
          path: 'general',
          component: Loadable({
            loader: () => import('./Edit/General'),
            loading: FullPageCenteredSpinner
          }),
        },
        {
          path: 'options',
          component: Loadable({
            loader: () => import('./Edit/Options'),
            loading: FullPageCenteredSpinner
          }),
        },
      ],
    },
  ],
});
