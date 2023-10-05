import React, { lazy } from 'react';
import moduleConfiguration from 'modules';

// routes
import createDashboardRoutes from './dashboard/routes';
import createAdminInitiativesRoutes from './initiatives/routes';
import createAdminUsersRoutes from './users/routes';
import invitationsRoutes from './invitations/routes';
import createAdminProjectsRoutes from './projects/routes';
import settingsRoutes from './settings/routes';
import createAdminMessagingRoutes from './messaging/routes';
import ideasRoutes from './ideas/routes';
import pagesAndMenuRoutes from './pagesAndMenu/routes';
import projectFoldersRoutes from './projectFolders/routes';
import reportingRoutes from './reporting/routes';
import toolsRoutes from './tools/routes';

// components
import PageLoading from 'components/UI/PageLoading';
import { Navigate, useLocation } from 'react-router-dom';
const AdminContainer = lazy(() => import('containers/Admin'));
const AdminFavicon = lazy(() => import('containers/Admin/favicon'));

// hooks
import { usePermission } from 'utils/permissions';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from 'api/me/useAuthUser';
import { IUserData } from 'api/users/types';

// utils
import { isRegularUser } from 'utils/permissions/roles';
import { isNilOrError, isUUID } from 'utils/helperUtils';
import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';

// typings
import { IAppConfigurationData } from 'api/app_configuration/types';

const isTemplatePreviewPage = (urlSegments: string[]) =>
  urlSegments.length === 4 &&
  urlSegments[0] === 'admin' &&
  urlSegments[1] === 'projects' &&
  urlSegments[2] === 'templates' &&
  isUUID(urlSegments[3]);

const getRedirectURL = (
  appConfiguration: IAppConfigurationData,
  authUser: IUserData | undefined,
  pathname: string | undefined,
  urlLocale: string | null
) => {
  const localeSegment = urlLocale ? `/${urlLocale}` : '';

  if (appConfiguration.attributes.settings.core.lifecycle_stage === 'churned') {
    return `${localeSegment}/subscription-ended`;
  }

  if (!isNilOrError(authUser) && !isRegularUser({ data: authUser })) {
    return `${localeSegment}/`;
  }

  // get array with url segments (e.g. 'admin/projects/all' becomes ['admin', 'projects', 'all'])
  const urlSegments = pathname
    ? pathname.replace(/^\/+/g, '').split('/')
    : null;

  // check if the unauthorized user is trying to access a template preview page (url pattern: /admin/projects/templates/[id])
  if (urlSegments && isTemplatePreviewPage(urlSegments)) {
    const templateId = urlSegments[3];
    // if so, redirect them to the citizen-facing version of the template preview page (url pattern: /templates/[id])
    return `${localeSegment}/templates/${templateId}`;
  }

  // if not, redirect them to the sign-in page
  // TO DO: Here we need to redirect to index
  // if the user is already signed in. If I want to access the admin as a signed in user
  // I get redirect => sign in => then index (because I'm already signed in)
  return `${localeSegment}/`;
};

const IndexElement = () => {
  const location = useLocation();
  const { pathname, urlLocale } = removeLocale(location.pathname);

  const accessAuthorized = usePermission({
    item: { type: 'route', path: pathname },
    action: 'access',
  });

  const { data: appConfiguration } = useAppConfiguration();
  const { data: authUser } = useAuthUser();

  if (isNilOrError(appConfiguration) || authUser === undefined) return null;

  const redirectURL = accessAuthorized
    ? null
    : getRedirectURL(
        appConfiguration.data,
        authUser?.data,
        pathname,
        urlLocale
      );

  if (redirectURL) return <Navigate to={redirectURL} />;

  return (
    <PageLoading>
      <AdminContainer />
    </PageLoading>
  );
};

const createAdminRoutes = () => {
  return {
    path: 'admin',
    element: <IndexElement />,
    children: [
      {
        // Careful: moderators currently have access to the admin index route
        // Adjust isModerator in routePermissions.ts if needed.
        path: '',
        element: <Navigate to="dashboard/visitors" />,
      },
      createDashboardRoutes(),
      createAdminInitiativesRoutes(),
      createAdminUsersRoutes(),
      createAdminProjectsRoutes(),
      settingsRoutes(),
      pagesAndMenuRoutes(),
      invitationsRoutes(),
      createAdminMessagingRoutes(),
      ideasRoutes(),
      projectFoldersRoutes(),
      reportingRoutes(),
      toolsRoutes(),
      // This path is only reachable via URL.
      // It's a pragmatic solution to reduce workload
      // on the team so admins can set their favicon.
      {
        path: 'favicon',
        element: (
          <PageLoading>
            <AdminFavicon />
          </PageLoading>
        ),
      },
      ...moduleConfiguration.routes.admin,
    ],
  };
};

export default createAdminRoutes;
