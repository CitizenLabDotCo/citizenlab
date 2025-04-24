import { IAppConfigurationData } from 'api/app_configuration/types';
import { IUser } from 'api/users/types';

import {
  definePermissionRule,
  IRouteItem,
} from 'utils/permissions/permissions';

import {
  isAdmin,
  isRegularUser,
  isProjectModerator,
  isSuperAdmin,
} from '../roles';

const MODERATOR_ROUTES = [
  '/admin/projects',
  '/admin/ideas',
  '/admin/ideas/import',
  '/admin/tools',
  '/admin/processing',
  '/admin/reporting',
  '/admin/reporting/insights',
  '/admin/reporting/report-builder',
  '/admin/project-description-builder',
  '/admin/inspiration-hub',
];

const isCommunityMonitorRoute = (item: IRouteItem) => {
  return item.path.includes('/admin/community-monitor');
};

export const isModeratorRoute = (item: IRouteItem) => {
  return MODERATOR_ROUTES.some((moderatorRoute) => {
    // We need to check with startsWith because we
    // wouldn't match nested routes with === checks
    if (item.path.startsWith(moderatorRoute)) {
      return true;
    }

    // We need this separate check because we can't let /admin
    // be part of the MODERATOR_ROUTES because it'll return true
    // for item.path.startsWith for every item.path value when in the admin.
    if (item.path === '/admin') {
      return true;
    }

    return false;
  });
};
export const isAdminRoute = (path: string) => {
  return /^\/admin/.test(path);
};

const isCommunityMonitorModerator = (
  user: IUser | undefined,
  tenant: IAppConfigurationData
) => {
  const communityMonitorProjectId =
    tenant.attributes.settings.community_monitor?.project_id;
  return communityMonitorProjectId
    ? isProjectModerator(user, communityMonitorProjectId)
    : false;
};

const isModeratedProjectRoute = (item: IRouteItem, user: IUser | undefined) => {
  const idRegexp = /^\/admin\/projects\/([a-z0-9-]+)\/?/;
  const matches = idRegexp.exec(item.path);
  const pathProjectId = matches && matches[1];
  return (pathProjectId && isProjectModerator(user, pathProjectId)) || false;
};

const tenantIsChurned = (tenant: IAppConfigurationData) => {
  return tenant.attributes.settings.core.lifecycle_stage === 'churned';
};

export const canAccessRoute = (
  item: IRouteItem,
  user: IUser | undefined,
  tenant: IAppConfigurationData
) => {
  if (isAdminRoute(item.path)) {
    if (isSuperAdmin(user)) {
      return true;
    }

    if (tenantIsChurned(tenant)) {
      return false;
    }

    if (isAdmin(user)) {
      return true;
    }

    if (isCommunityMonitorRoute(item)) {
      return isCommunityMonitorModerator(user, tenant);
    }

    if (!isRegularUser(user) && isModeratorRoute(item)) {
      return true;
    }

    return isModeratedProjectRoute(item, user);
  } else {
    return true;
  }
};

definePermissionRule('route', 'access', canAccessRoute);
