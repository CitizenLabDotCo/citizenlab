import React, { lazy } from 'react';

import { localeRoute } from 'routes';
import * as yup from 'yup';

import { IAppConfigurationData } from 'api/app_configuration/types';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import { supportedLocales } from 'containers/App/constants';

import PageLoading from 'components/UI/PageLoading';
import Unauthorized from 'components/Unauthorized';

import clHistory from 'utils/cl-router/history';
import Navigate from 'utils/cl-router/Navigate';
import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';
import { isUUID } from 'utils/helperUtils';
import type { Routes } from 'utils/moduleUtils';
import { usePermission } from 'utils/permissions';
import { createRoute, useLocation } from 'utils/router';

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
import createAdminSpacesRoutes from './spaces/routes';
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

type UnauthorizedRedirect =
  | { kind: 'subscriptionEnded' }
  | { kind: 'templatePreview'; templateId: string };

const getUnauthorizedRedirect = (
  appConfiguration: IAppConfigurationData,
  pathname: string | undefined
): UnauthorizedRedirect | null => {
  if (appConfiguration.attributes.settings.core.lifecycle_stage === 'churned') {
    return { kind: 'subscriptionEnded' };
  }

  // get array with url segments (e.g. 'admin/projects/all' becomes ['admin', 'projects', 'all'])
  const urlSegments = pathname
    ? pathname.replace(/^\/+/g, '').split('/')
    : null;

  // check if the unauthorized user is trying to access a template preview page (url pattern: /admin/projects/templates/[id])
  if (urlSegments && isTemplatePreviewPage(urlSegments)) {
    return { kind: 'templatePreview', templateId: urlSegments[3] };
  }

  return null;
};

const AdminLayoutElement = () => {
  const location = useLocation();
  const { pathname } = removeLocale(location.pathname);

  const accessAuthorized = usePermission({
    item: { type: 'route', path: pathname },
    action: 'access',
  });

  const { data: appConfiguration } = useAppConfiguration();

  if (!appConfiguration) return null;

  const redirect = accessAuthorized
    ? null
    : getUnauthorizedRedirect(appConfiguration.data, pathname);

  if (!redirect && !accessAuthorized) {
    return <Unauthorized />;
  }

  if (redirect?.kind === 'subscriptionEnded') {
    return <Navigate to="/subscription-ended" />;
  }

  if (redirect?.kind === 'templatePreview') {
    return <TemplatePreviewRedirect templateId={redirect.templateId} />;
  }

  return (
    <PageLoading>
      <AdminContainer />
    </PageLoading>
  );
};

// The citizen template-preview route (`/templates/:projectTemplateId`) is
// registered by the `admin_project_templates` commercial module and isn't part
// of the static typed route tree, so we can't pass it through the typed
// `Navigate` wrapper. Push through `clHistory` (which auto-prepends the
// locale) instead.
const TemplatePreviewRedirect = ({ templateId }: { templateId: string }) => {
  React.useEffect(() => {
    clHistory.push(`/templates/${templateId}`);
  }, [templateId]);
  return null;
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
  component: () => <Navigate to="/admin/dashboard/overview" />,
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

const descriptionBuilderPreviewSearchSchema = yup.object({
  selected_locale: yup.string().oneOf(supportedLocales).optional(),
});

const projectPreviewRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'description-builder/projects/$projectId/preview',
  validateSearch: (search: Record<string, unknown>) =>
    descriptionBuilderPreviewSearchSchema.validateSync(search, {
      stripUnknown: true,
    }),
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
  validateSearch: (search: Record<string, unknown>) =>
    descriptionBuilderPreviewSearchSchema.validateSync(search, {
      stripUnknown: true,
    }),
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
    createAdminSpacesRoutes(),
    faviconRoute,
    projectDescriptionRoute,
    projectPreviewRoute,
    folderDescriptionRoute,
    folderPreviewRoute,
    projectImporterRoute,
  ]);
};
