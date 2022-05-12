import dashboardRoutes from './dashboard/routes';
import initiativesRoutes from './initiatives/routes';
import usersRoutes from './users/routes';
import invitationsRoutes from './invitations/routes';
import projectsRoutes from './projects/routes';
import settingsRoutes from './settings/routes';
import settingsAreasRoutes from './settings/areas/routes';
import pagesRoutes from './pages/routes';
import messagingsRoutes from './messaging/routes';
import ideasRoutes from './ideas/routes';

import moduleConfiguration from 'modules';

import { hasPermission } from 'services/permissions';
import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';
import { isUUID } from 'utils/helperUtils';

import Loadable from 'react-loadable';
import { LoadableLoadingAdmin } from 'components/UI/LoadableLoading';
import { currentAppConfigurationStream } from 'services/appConfiguration';
import { combineLatest } from 'rxjs';
import { authUserStream } from 'services/auth';
import { isModerator } from 'services/permissions/roles';

const isUserAuthorized = (nextState, replace) => {
  const pathNameWithLocale = nextState.location.pathname;
  const { pathname, urlLocale } = removeLocale(pathNameWithLocale);
  combineLatest([
    hasPermission({
      item: { type: 'route', path: pathname },
      action: 'access',
    }),
    currentAppConfigurationStream().observable,
    authUserStream().observable,
  ]).subscribe(([accessAthorized, tenant, authUser]) => {
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
  // https://stackoverflow.com/questions/62384395/protected-route-with-react-router-v6
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
    settingsRoutes(),
    settingsAreasRoutes(),
    pagesRoutes(),
    invitationsRoutes(),
    messagingsRoutes(),
    ideasRoutes(),
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
    ...moduleConfiguration.routes.admin,
  ],
});
