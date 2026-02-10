import React, { lazy } from 'react';

import { localeRoute } from 'routes';

import { IAppConfigurationData } from 'api/app_configuration/types';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import PageLoading from 'components/UI/PageLoading';
import Unauthorized from 'components/Unauthorized';

import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';
import { isUUID } from 'utils/helperUtils';
import { usePermission } from 'utils/permissions';
import { createRoute, Navigate, useLocation } from 'utils/router';

import { communityMonitorRouteTypes } from './communityMonitor/routes';
import { dashboardRouteTypes } from './dashboard/routes';
import { ideaRouteTypes } from './ideas/routes';
import { inspirationHubRouteTypes } from './inspirationHub/routes';
import { invitationRouteTypes } from './invitations/routes';
import { messagingRouteTypes } from './messaging/routes';
import { pagesAndMenuRouteTypes } from './pagesAndMenu/routes';
import { projectFolderRouteTypes } from './projectFolders/routes';
import createAdminProjectsRoutes, {
  projectsRouteTypes,
} from './projects/routes';
import { reportingRouteTypes } from './reporting/routes';
import { settingRouteTypes } from './settings/routes';
import { toolRouteTypes } from './tools/routes';
import { userRouteTypes } from './users/routes';

const AdminContainer = lazy(() => import('containers/Admin'));
const AdminFavicon = lazy(() => import('containers/Admin/favicon'));
const ProjectDescriptionBuilderComponent = React.lazy(
  () => import('containers/DescriptionBuilder/ProjectDescriptionBuilder')
);
const ProjectFullscreenPreview = React.lazy(
  () =>
    import(
      'containers/DescriptionBuilder/ProjectDescriptionBuilder/ProjectFullScreenPreview'
    )
);
const FolderDescriptionBuilderComponent = React.lazy(
  () => import('containers/DescriptionBuilder/FolderDescriptionBuilder')
);
const FolderFullscreenPreview = React.lazy(
  () =>
    import(
      'containers/DescriptionBuilder/FolderDescriptionBuilder/FolderFullScreenPreview'
    )
);

const ProjectImporter = React.lazy(
  () => import('containers/Admin/ProjectImporter')
);

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

const AdminLayoutElement = () => {
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

export enum adminRoutes {
  admin = 'admin',
  favicon = 'favicon',
  projectDescription = 'description-builder/projects/$projectId/description',
  projectPreview = 'description-builder/projects/$projectId/preview',
  folderDescription = 'description-builder/folders/$folderId/description',
  folderPreview = 'description-builder/folders/$folderId/preview',
  projectImporter = 'project-importer',
}

// Admin layout route - parent for all admin routes
export const adminRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: adminRoutes.admin,
  component: AdminLayoutElement,
});

// Admin index route - redirects to dashboard
const adminIndexRoute = createRoute({
  getParentRoute: () => adminRoute,
  // Careful: moderators currently have access to the admin index route
  // Adjust isModerator in routePermissions.ts if needed.
  path: '/',
  component: () => <Navigate to="dashboard/overview" />,
});

// Favicon route
const faviconRoute = createRoute({
  getParentRoute: () => adminRoute,
  // This path is only reachable via URL.
  // It's a pragmatic solution to reduce workload
  // on the team so admins can set their favicon.
  path: adminRoutes.favicon,
  component: () => (
    <PageLoading>
      <AdminFavicon />
    </PageLoading>
  ),
});

// Description builder routes
const projectDescriptionRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: adminRoutes.projectDescription,
  component: () => <ProjectDescriptionBuilderComponent />,
});

const projectPreviewRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: adminRoutes.projectPreview,
  component: () => <ProjectFullscreenPreview />,
});

const folderDescriptionRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: adminRoutes.folderDescription,
  component: () => <FolderDescriptionBuilderComponent />,
});

const folderPreviewRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: adminRoutes.folderPreview,
  component: () => <FolderFullscreenPreview />,
});

// Project importer route
const projectImporterRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: adminRoutes.projectImporter,
  component: () => <ProjectImporter />,
});

// Factory function to create admin route tree
export const createAdminRoutes = () => {
  return adminRoute.addChildren([
    adminIndexRoute,
    createAdminProjectsRoutes(),
    // TODO: Convert these sub-route factories to TanStack format one by one
    // createDashboardRoutes(),
    // createAdminUsersRoutes(),
    // settingsRoutes(),
    // pagesAndMenuRoutes(),
    // invitationsRoutes(),
    // createAdminMessagingRoutes(),
    // ideasRoutes(),
    // projectFoldersRoutes(),
    // ...reportingRoutes(),
    // toolsRoutes(),
    // communityMonitorsRoutes(),
    // inspirationHubRoutes(),
    // TODO: understand this:
    // ...moduleConfiguration.routes.admin,
    faviconRoute,
    projectDescriptionRoute,
    projectPreviewRoute,
    folderDescriptionRoute,
    folderPreviewRoute,
    projectImporterRoute,
  ]);
};

export default createAdminRoutes;
