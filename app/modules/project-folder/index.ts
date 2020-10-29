import {
  LoadableLoadingAdmin,
  LoadableLoadingCitizen,
} from 'components/UI/LoadableLoading';

import Loadable from 'react-loadable';

export default {
  routes: {
    citizen: [
      {
        path: 'folders/:slug',
        name: 'Project folder page',
        component: Loadable({
          loader: () => import('./containers/Citizen/ProjectFolderShowPage'),
          loading: LoadableLoadingCitizen,
          delay: 500,
        }),
      },
    ],
    admin: [
      {
        path: 'projects/folders/new',
        name: 'admin projects single project',
        component: Loadable({
          loader: () => import('./containers/Admin/settings'),
          loading: LoadableLoadingAdmin,
          delay: 500,
        }),
      },
      {
        path: 'projects/folders/:projectFolderId',
        name: 'admin projects edit folder',
        component: Loadable({
          loader: () => import('./containers/Admin'),
          loading: LoadableLoadingAdmin,
          delay: 500,
        }),
        indexRoute: {
          name: 'admin projects edit folder projects',
          component: Loadable({
            loader: () => import('./containers/Admin/projects'),
            loading: () => null,
          }),
        },
        childRoutes: [
          {
            path: 'settings',
            name: 'admin projects edit folder settings',
            component: Loadable({
              loader: () => import('./containers/Admin/settings'),
              loading: LoadableLoadingAdmin,
              delay: 500,
            }),
          },
        ],
      },
    ],
  },
};
