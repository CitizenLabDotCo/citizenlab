// These are the pages you can go to. (within the admin)
// They are all wrapped in the App component, which should contain the navbar etc
// See http://blog.mxstbr.com/2016/01/react-apps-with-pages for more information
// about the code splitting business
import dashboardRoutes from './dashboard/routes';
import initiativesRoutes from './initiatives/routes';
import usersRoutes from './users/routes';
import invitationsRoutes from './invitations/routes';
import projectsRoutes from './projects/routes';
import settingsRoutes from './settings/routes';
import settingsAreasRoutes from './settings/areas/routes';
import customFieldRoutes from './settings/registration/CustomFields/routes';
import pagesRoutes from './pages/routes';
import emailsRoutes from './emails/routes';
import ideasRoutes from './ideas/routes';

import moduleConfiguration from 'modules';

import { hasPermission } from 'services/permissions';
import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';
import { isUUID } from 'utils/helperUtils';

import Loadable from 'react-loadable';
import { LoadableLoadingAdmin } from 'components/UI/LoadableLoading';
import { currentAppConfigurationStream } from 'services/tenant';
import { combineLatest } from 'rxjs';
import { authUserStream } from 'services/auth';
import { isModerator } from 'services/permissions/roles';

const isUserAuthorized = (nextState, replace) => {
  const pathNameWithLocale = nextState.location.pathname;
  const { pathname, urlLocale } = removeLocale(pathNameWithLocale);
  combineLatest(
    hasPermission({
      item: { type: 'route', path: pathname },
      action: 'access',
    }),
    currentAppConfigurationStream().observable,
    authUserStream().observable
  ).subscribe(([accessAthorized, tenant, authUser]) => {
    if (!accessAthorized) {
      if (tenant.data.attributes.settings.core.lifecycle_stage === 'churned') {
        replace(`${urlLocale && `/${urlLocale}`}/subscription-ended`);
      } else if (isModerator(authUser)) {
        replace(`${urlLocale && `/${urlLocale}`}/`);
      } else {
        // get array with url segments (e.g. 'admin/projects/all' becomes ['admin', 'projects', 'all'])
        const urlSegments = pathname
          ? pathname.replace(/^\/+/g, '').split('/')
          : null;

        // check if a unauthorized user is trying to access a template preview page (url pattern: /admin/projects/templates/[id])
        // if so, redirect them to the citizen-facing version of the template preview page (url pattern: /templates/[id])
        // if not, redirect them to the sign-in page
        if (
          urlSegments &&
          urlSegments.length === 4 &&
          urlSegments[0] === 'admin' &&
          urlSegments[1] === 'projects' &&
          urlSegments[2] === 'templates' &&
          isUUID(urlSegments[3])
        ) {
          replace(`/${urlLocale}/templates/${urlSegments[3]}`);
        } else {
          replace(`${urlLocale && `/${urlLocale}`}/sign-in`);
        }
      }
    }
  });
};

export default () => ({
  path: 'admin',
  name: 'Admin page',
  component: Loadable({
    loader: () => import('containers/Admin'),
    loading: () => null,
  }),
  onEnter: isUserAuthorized,
  indexRoute: {
    onEnter: (nextState, replace) => {
      const pathNameWithLocale = nextState.location.pathname;
      const { urlLocale } = removeLocale(pathNameWithLocale);
      replace(`${urlLocale && `/${urlLocale}`}/admin/dashboard`);
    },
  },
  childRoutes: [
    dashboardRoutes(),
    initiativesRoutes(),
    usersRoutes(),
    projectsRoutes(),

    {
      path: 'settings/registration/custom-fields',
      ...customFieldRoutes(),
    },
    settingsRoutes(),
    settingsAreasRoutes(),
    pagesRoutes(),
    invitationsRoutes(),
    emailsRoutes(),
    ideasRoutes(),
    {
      path: 'moderation',
      component: Loadable({
        loader: () => import('containers/Admin/moderation'),
        loading: LoadableLoadingAdmin,
        delay: 500,
      }),
    },
    {
      path: 'workshops',
      component: Loadable({
        loader: () => import('containers/Admin/workshops'),
        loading: LoadableLoadingAdmin,
        delay: 500,
      }),
    },
    {
      path: 'favicon',
      component: Loadable({
        loader: () => import('containers/Admin/favicon'),
        loading: LoadableLoadingAdmin,
        delay: 500,
      }),
    },
    {
      path: 'dashboard/insights/:clusteringId',
      component: Loadable({
        loader: () => import('./dashboard/clusterings/Show'),
        loading: LoadableLoadingAdmin,
        delay: 500,
      }),
    },
    {
      path: 'guide',
      component: Loadable({
        loader: () => import('containers/Admin/guide'),
        loading: LoadableLoadingAdmin,
        delay: 500,
      }),
    },
    {
      path: 'processing',
      component: Loadable({
        loader: () => import('containers/Admin/processing'),
        loading: LoadableLoadingAdmin,
        delay: 500,
      }),
    },
    ...moduleConfiguration.routes.admin,
  ],
});
