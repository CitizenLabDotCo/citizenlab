import React, { lazy } from 'react';

import { localeRoute } from 'routes';
import * as yup from 'yup';

import { IAppConfigurationData } from 'api/app_configuration/types';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import PageLoading from 'components/UI/PageLoading';
import Unauthorized from 'components/Unauthorized';

import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';
import { isUUID } from 'utils/helperUtils';
import type { Routes } from 'utils/moduleUtils';
import { usePermission } from 'utils/permissions';
import { createRoute, Navigate, useLocation } from 'utils/router';

import createAdminCommunityMonitorRoutes from './communityMonitor/routes';
import createAdminDashboardRoutes from './dashboard/routes';
import createAdminIdeasRoutes from './ideas/routes';
import createAdminInspirationHubRoutes from './inspirationHub/routes';
import createAdminInvitationsRoutes from './invitations/routes';
import createAdminMessagingRoutes from './messaging/routes';
import createAdminPagesAndMenuRoutes from './pagesAndMenu/routes';
import createProjectFoldersRoutes from './projectFolders/routes';
import createAdminProjectsRoutes from './projects/routes';
import createAdminReportingRoutes from './reporting/routes';
import createAdminSettingsRoutes from './settings/routes';
import createAdminToolsRoutes from './tools/routes';
import createAdminUsersRoutes from './users/routes';

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

// Admin layout route - parent for all admin routes
export const adminRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'admin',
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
  path: 'favicon',
  component: () => (
    <PageLoading>
      <AdminFavicon />
    </PageLoading>
  ),
});

// Description builder routes
const projectDescriptionRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'description-builder/projects/$projectId/description',
  component: () => <ProjectDescriptionBuilderComponent />,
});

const projectPreviewRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'description-builder/projects/$projectId/preview',
  component: () => <ProjectFullscreenPreview />,
});

const folderDescriptionRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'description-builder/folders/$folderId/description',
  component: () => <FolderDescriptionBuilderComponent />,
});

const folderPreviewRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'description-builder/folders/$folderId/preview',
  component: () => <FolderFullscreenPreview />,
});

// Project importer search schema
const projectImporterSearchSchema = yup.object({
  id: yup.string().optional(),
  num_imports: yup.string().optional(),
  preview: yup.boolean().optional(),
});

export type ProjectImporterSearchParams = yup.InferType<
  typeof projectImporterSearchSchema
>;

// Project importer route
const projectImporterRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'project-importer',
  validateSearch: (
    search: Record<string, unknown>
  ): ProjectImporterSearchParams =>
    projectImporterSearchSchema.validateSync(search, { stripUnknown: true }),
  component: () => <ProjectImporter />,
});

// Factory function to create admin route tree
export const createAdminRoutes = (moduleRoutes: Partial<Routes> = {}) => {
  return adminRoute.addChildren([
    adminIndexRoute,
    createAdminProjectsRoutes(
      moduleRoutes['admin.project_templates, admin.projects']
    ),
    createAdminDashboardRoutes(),
    createAdminUsersRoutes(),
    createAdminSettingsRoutes(),
    createAdminPagesAndMenuRoutes(),
    createAdminInvitationsRoutes(),
    createAdminMessagingRoutes(),
    createAdminIdeasRoutes(moduleRoutes['admin.ideas']),
    createProjectFoldersRoutes(),
    ...createAdminReportingRoutes(),
    createAdminToolsRoutes(moduleRoutes['admin.tools']),
    createAdminCommunityMonitorRoutes(),
    createAdminInspirationHubRoutes(),
    faviconRoute,
    projectDescriptionRoute,
    projectPreviewRoute,
    folderDescriptionRoute,
    folderPreviewRoute,
    projectImporterRoute,
  ]);
};

export default createAdminRoutes;
