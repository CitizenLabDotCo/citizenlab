import {
  definePermissionRule,
  IRouteItem,
} from 'services/permissions/permissions';
import {
  isAdmin,
  isModerator,
  isProjectModerator,
  isSuperAdmin,
} from '../roles';
import { IUser } from 'services/users';
import { IAppConfigurationData } from 'services/appConfiguration';

const MODERATOR_ROUTES = [
  '/admin/dashboard',
  '/admin/projects',
  '/admin/messaging',
  '/admin/ideas',
  '/admin/ideas/import',
  '/admin/workshops',
  '/admin/processing',
  '/admin/moderation',
  '/admin/insights',
  '/admin/content-builder',
];

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

const isModeratedProjectRoute = (item: IRouteItem, user: IUser | null) => {
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
  user: IUser | null,
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

    if (isModerator(user) && isModeratorRoute(item)) {
      return true;
    }

    return isModeratedProjectRoute(item, user);
  } else {
    return true;
  }
};

definePermissionRule('route', 'access', canAccessRoute);
