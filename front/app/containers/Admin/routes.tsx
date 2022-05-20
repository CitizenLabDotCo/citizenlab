import React, { lazy } from 'react';
import createDashboardRoutes from './dashboard/routes';
import createAdminInitiativesRoutes from './initiatives/routes';
import createAdminUsersRoutes from './users/routes';
import invitationsRoutes from './invitations/routes';
import createAdminProjectsRoutes from './projects/routes';
import settingsRoutes from './settings/routes';
import pagesRoutes from './pages/routes';
import createAdminMessagingRoutes from './messaging/routes';
import ideasRoutes from './ideas/routes';

// import moduleConfiguration from 'modules';
const AdminContainer = lazy(() => import('containers/Admin'));
import { LoadingComponent } from 'routes';
import { hasPermission } from 'services/permissions';
import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';
import { isUUID } from 'utils/helperUtils';

import { currentAppConfigurationStream } from 'services/appConfiguration';
import { combineLatest } from 'rxjs';
import { authUserStream } from 'services/auth';
import { isModerator } from 'services/permissions/roles';
import { Navigate } from 'react-router-dom';

const AdminWorkshopsComponent = lazy(
  () => import('containers/Admin/workshops')
);
const AdminFaviconComponent = lazy(() => import('containers/Admin/favicon'));

export const isUserAuthorized = (nextState, replace) => {
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

const createAdminRoutes = (_isUserAuthorized: boolean) => {
  return {
    path: 'admin',
    element: (
      <LoadingComponent>
        <AdminContainer />
      </LoadingComponent>
    ),
    // https://stackoverflow.com/questions/62384395/protected-route-with-react-router-v6
    // onEnter: isUserAuthorized,
    // indexRoute: {
    //   onEnter: (nextState, replace) => {
    //     const pathNameWithLocale = nextState.location.pathname;
    //     const { urlLocale } = removeLocale(pathNameWithLocale);
    //     replace(`${urlLocale && `/${urlLocale}`}/admin/dashboard`);
    //   },
    // },
    children: [
      {
        path: '',
        element: <Navigate to="dashboard" />,
      },
      createDashboardRoutes(),
      createAdminInitiativesRoutes(),
      createAdminUsersRoutes(),
      createAdminProjectsRoutes(),
      settingsRoutes(),
      pagesRoutes(),
      invitationsRoutes(),
      createAdminMessagingRoutes(),
      ideasRoutes(),
      {
        path: 'workshops',
        element: (
          <LoadingComponent>
            <AdminWorkshopsComponent />
          </LoadingComponent>
        ),
      },
      {
        path: 'favicon',
        element: (
          <LoadingComponent>
            <AdminFaviconComponent />
          </LoadingComponent>
        ),
      },
      // ...moduleConfiguration.routes.admin,
    ],
  };
};

export default createAdminRoutes;
