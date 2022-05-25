import React, { lazy } from 'react';

// routes
import createDashboardRoutes from './dashboard/routes';
import createAdminInitiativesRoutes from './initiatives/routes';
import createAdminUsersRoutes from './users/routes';
// import invitationsRoutes from './invitations/routes';
// import projectsRoutes from './projects/routes';
// import settingsRoutes from './settings/routes';
// import settingsAreasRoutes from './settings/areas/routes';
// import pagesRoutes from './pages/routes';
import createAdminMessagingRoutes from './messaging/routes';
// import ideasRoutes from './ideas/routes';

// import moduleConfiguration from 'modules';

// components
const AdminContainer = lazy(() => import('containers/Admin'));
import { LoadingComponent } from 'routes';
import { Navigate, useLocation } from 'react-router-dom';
// import { LoadableLoadingAdmin } from 'components/UI/LoadableLoading';

// hooks
import { usePermission } from 'services/permissions';
import useAppConfiguration from 'hooks/useAppConfiguration';
import useAuthUser, { TAuthUser } from 'hooks/useAuthUser';

// utils
import { isModerator } from 'services/permissions/roles';
import { isNilOrError, isUUID } from 'utils/helperUtils';
import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';

// typings
import { IAppConfiguration } from 'services/appConfiguration';

const isTemplatePreviewPage = (urlSegments: string[]) =>
  urlSegments.length === 4 &&
  urlSegments[0] === 'admin' &&
  urlSegments[1] === 'projects' &&
  urlSegments[2] === 'templates' &&
  isUUID(urlSegments[3]);

const getRedirectURL = (
  appConfiguration: IAppConfiguration,
  authUser: TAuthUser,
  pathname: string | undefined,
  urlLocale: string | null
) => {
  const localeSegment = urlLocale ? `/${urlLocale}` : '';

  if (
    appConfiguration.data.attributes.settings.core.lifecycle_stage === 'churned'
  ) {
    return `${localeSegment}/subscription-ended`;
  }

  if (!isNilOrError(authUser) && isModerator({ data: authUser })) {
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
  return `${localeSegment}/sign-in`;
};

const IndexElement = () => {
  const location = useLocation();
  const { pathname, urlLocale } = removeLocale(location.pathname);

  const accessAuthorized = usePermission({
    item: { type: 'route', path: pathname },
    action: 'access',
  });
  const appConfiguration = useAppConfiguration();
  const authUser = useAuthUser();

  if (isNilOrError(appConfiguration)) return null;

  const redirectURL = accessAuthorized
    ? null
    : getRedirectURL(appConfiguration, authUser, pathname, urlLocale);

  if (redirectURL) return <Navigate to={redirectURL} />;

  return (
    <LoadingComponent>
      <AdminContainer />
    </LoadingComponent>
  );
};

const createAdminRoutes = () => {
  return {
    path: 'admin',
    element: <IndexElement />,
    children: [
      {
        path: '',
        element: <Navigate to="dashboard" />,
      },
      createDashboardRoutes(),
      createAdminInitiativesRoutes(),
      createAdminUsersRoutes(),
      // projectsRoutes(),
      // settingsRoutes(),
      // settingsAreasRoutes(),
      // pagesRoutes(),
      // invitationsRoutes(),
      createAdminMessagingRoutes(),
      // ideasRoutes(),
      // {
      //   path: 'workshops',
      //   component: Loadable({
      //     loader: () => import('containers/Admin/workshops'),
      //     loading: LoadableLoadingAdmin,
      //     delay: 500,
      //   }),
      // },
      // {
      //   path: 'favicon',
      //   component: Loadable({
      //     loader: () => import('containers/Admin/favicon'),
      //     loading: LoadableLoadingAdmin,
      //     delay: 500,
      //   }),
      // },
      // ...moduleConfiguration.routes.admin,
    ],
  };
};

export default createAdminRoutes;
