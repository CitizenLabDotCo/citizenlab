import Loadable from 'react-loadable';
import { FullPageCenteredSpinner } from 'components/UI/Spinner';

export default () => ({
  path: 'pages',
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
      path: ':pageId/editor/:locale',
      component: Loadable({
        loader: () => import('./BodyEditor'),
        loading: FullPageCenteredSpinner
      }),
    },
    {
      path: ':pageId',
      component: Loadable({
        loader: () => import('./Edit'),
        loading: FullPageCenteredSpinner
      }),
    },
  ],
});
