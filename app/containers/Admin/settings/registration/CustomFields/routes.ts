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
        loader: () => import('./RegistrationCustomFieldNew'),
        loading: LoadableLoadingAdmin,
        delay: 500,
      }),
    },
    {
      path: ':userCustomFieldId',
      component: Loadable({
        loader: () => import('./RegistrationCustomFieldEdit'),
        loading: LoadableLoadingAdmin,
        delay: 500,
      }),
      childRoutes: [
        {
          path: 'field-settings',
          component: Loadable({
            loader: () =>
              import(
                './RegistrationCustomFieldEdit/RegistrationCustomFieldSettings'
              ),
            loading: () => null,
          }),
        },
        {
          path: 'options',
          component: Loadable({
            loader: () =>
              import(
                './RegistrationCustomFieldEdit/RegistrationCustomFieldOptions'
              ),
            loading: () => null,
          }),
        },
        {
          path: 'options/new',
          component: Loadable({
            loader: () =>
              import(
                './RegistrationCustomFieldEdit/RegistrationCustomFieldOptionsNew'
              ),
            loading: () => null,
          }),
        },
        {
          path: 'options/:userCustomFieldOptionId',
          component: Loadable({
            loader: () =>
              import(
                './RegistrationCustomFieldEdit/RegistrationCustomFieldOptionsEdit'
              ),
            loading: () => null,
          }),
        },
      ],
    },
  ],
});
