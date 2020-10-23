import Loadable from 'react-loadable';
import { LoadableLoadingAdmin } from 'components/UI/LoadableLoading';

export default () => ({
  component: Loadable({
    loader: () => import('./'),
    loading: LoadableLoadingAdmin,
    delay: 500,
  }),
  indexRoute: {
    component: Loadable({
      loader: () => import('./All'),
      loading: LoadableLoadingAdmin,
      delay: 500,
    }),
  },
  childRoutes: [
    {
      path: 'new',
      component: Loadable({
        loader: () => import('./CustomFieldNew'),
        loading: LoadableLoadingAdmin,
        delay: 500,
      }),
    },
    {
      path: ':userCustomFieldId',
      component: Loadable({
        loader: () => import('./CustomFieldEdit'),
        loading: LoadableLoadingAdmin,
        delay: 500,
      }),
      childRoutes: [
        {
          path: 'general',
          component: Loadable({
            loader: () => import('./CustomFieldEdit/General'),
            loading: () => null,
          }),
        },
        {
          path: 'options',
          component: Loadable({
            loader: () => import('./CustomFieldEdit/Options'),
            loading: () => null,
          }),
        },
        {
          path: 'options/new',
          component: Loadable({
            loader: () => import('./CustomFieldEdit/OptionsNew'),
            loading: () => null,
          }),
        },
        {
          path: 'options/:userCustomFieldOptionId',
          component: Loadable({
            loader: () => import('./CustomFieldEdit/OptionsEdit'),
            loading: () => null,
          }),
        },
      ],
    },
  ],
});
