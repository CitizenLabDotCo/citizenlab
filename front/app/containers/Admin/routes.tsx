import React, { lazy } from 'react';

import moduleConfiguration from 'modules';
import { Navigate, useLocation } from 'react-router-dom';

import { IAppConfigurationData } from 'api/app_configuration/types';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import PageLoading from 'components/UI/PageLoading';
import Unauthorized from 'components/Unauthorized';

import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';
import { isUUID } from 'utils/helperUtils';
import { usePermission } from 'utils/permissions';

import communityMonitorsRoutes, {
  communityMonitorRouteTypes,
} from './communityMonitor/routes';
import createDashboardRoutes, { dashboardRouteTypes } from './dashboard/routes';
import ideasRoutes, { ideaRouteTypes } from './ideas/routes';
import inspirationHubRoutes, {
  inspirationHubRouteTypes,
} from './inspirationHub/routes';
import invitationsRoutes, { invitationRouteTypes } from './invitations/routes';
import createAdminMessagingRoutes, {
  messagingRouteTypes,
} from './messaging/routes';
import pagesAndMenuRoutes, {
  pagesAndMenuRouteTypes,
} from './pagesAndMenu/routes';
import projectFoldersRoutes, {
  projectFolderRouteTypes,
} from './projectFolders/routes';
import createAdminProjectsRoutes, {
  projectsRouteTypes,
} from './projects/routes';
import reportingRoutes, { reportingRouteTypes } from './reporting/routes';
import settingsRoutes, { settingRouteTypes } from './settings/routes';
import toolsRoutes, { toolRouteTypes } from './tools/routes';
import createAdminUsersRoutes, { userRouteTypes } from './users/routes';

const AdminContainer = lazy(() => import('containers/Admin'));
const AdminFavicon = lazy(() => import('containers/Admin/favicon'));
const ProjectDescriptionBuilderComponent = React.lazy(
  () => import('containers/ProjectDescriptionBuilder')
);
const FullscreenPreview = React.lazy(
  () => import('containers/ProjectDescriptionBuilder/FullscreenPreview')
);

// TODO remove this when project planning is fully rolled out
const NewProjectsPage = React.lazy(() => import('./projects/all/new'));

export type AdminRoute<T extends string = string> = `/admin/${T}`;

export type AdminRouteTypes =
  | '/admin'
  | ideaRouteTypes
  | userRouteTypes
  | invitationRouteTypes
  | dashboardRouteTypes
  | projectFolderRouteTypes
  | toolRouteTypes
  | communityMonitorRouteTypes
  | reportingRouteTypes
  | messagingRouteTypes
  | pagesAndMenuRouteTypes
  | projectsRouteTypes
  | settingRouteTypes
  | inspirationHubRouteTypes
  | AdminRoute<'projects-redesign-early-access'>;

const isTemplatePreviewPage = (urlSegments: string[]) =>
  urlSegments.length === 4 &&
  urlSegments[0] === 'admin' &&
  urlSegments[1] === 'projects' &&
  urlSegments[2] === 'templates' &&
  isUUID(urlSegments[3]);

const getRedirectURL = (
  appConfiguration: IAppConfigurationData,
  pathname: string | undefined,
  urlLocale: string | null
) => {
  const localeSegment = urlLocale ? `/${urlLocale}` : '';

  if (appConfiguration.attributes.settings.core.lifecycle_stage === 'churned') {
    return `${localeSegment}/subscription-ended`;
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

  return null;
};

const IndexElement = () => {
  const location = useLocation();
  const { pathname, urlLocale } = removeLocale(location.pathname);

  const accessAuthorized = usePermission({
    item: { type: 'route', path: pathname },
    action: 'access',
  });

  const { data: appConfiguration } = useAppConfiguration();

  if (!appConfiguration) return null;

  const redirectURL = accessAuthorized
    ? null
    : getRedirectURL(appConfiguration.data, pathname, urlLocale);

  if (!redirectURL && !accessAuthorized) {
    return <Unauthorized />;
  } else if (redirectURL) {
    return <Navigate to={redirectURL} />;
  }

  return (
    <PageLoading>
      <AdminContainer />
    </PageLoading>
  );
};

export enum descriptionBuilderRoutes {
  projectdescriptionBuilder = 'project-description-builder',
  description = `project-description-builder/projects/:projectId/description`,
  preview = `project-description-builder/projects/:projectId/preview`,
}

const createAdminRoutes = () => {
  return {
    path: 'admin',
    element: <IndexElement />,
    children: [
      {
        // Careful: moderators currently have access to the admin index route
        // Adjust isModerator in routePermissions.ts if needed.
        path: '',
        element: <Navigate to="dashboard/overview" />,
      },
      createDashboardRoutes(),
      createAdminUsersRoutes(),
      createAdminProjectsRoutes(),
      settingsRoutes(),
      pagesAndMenuRoutes(),
      invitationsRoutes(),
      createAdminMessagingRoutes(),
      ideasRoutes(),
      projectFoldersRoutes(),
      ...reportingRoutes(),
      toolsRoutes(),
      communityMonitorsRoutes(),
      inspirationHubRoutes(),
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
      {
        path: descriptionBuilderRoutes.description,
        element: <ProjectDescriptionBuilderComponent />,
      },
      {
        path: descriptionBuilderRoutes.preview,
        element: <FullscreenPreview />,
      },
      ...moduleConfiguration.routes.admin,

      // TODO remove this route when project planning is fully rolled out
      {
        path: 'projects-redesign-early-access',
        element: <NewProjectsPage />,
      },
    ],
  };
};

export default createAdminRoutes;
