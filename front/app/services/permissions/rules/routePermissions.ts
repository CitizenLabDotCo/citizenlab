import {
  definePermissionRule,
  IRouteItem,
} from 'services/permissions/permissions';
import {
  isAdmin,
  isModerator,
  isProjectModerator,
  isProjectFolderModerator,
  isSuperAdmin,
} from '../roles';
import { IUser } from 'services/users';
import { IAppConfigurationData } from 'services/appConfiguration';

export const MODERATOR_ROUTES = [
  '/admin/projects',
  '/admin/messaging',
  '/admin/ideas',
  '/admin/workshops',
  '/admin/processing',
  '/admin/dashboard',
  '/admin/moderation',
  '/admin/insights',
  '/admin/content-builder',
];

export const isModeratorRoute = (item: IRouteItem) => {
  return MODERATOR_ROUTES.some((moderatorRoute) => {
    return item.path.includes(moderatorRoute);
  });
};

export const isModeratedProjectRoute = (
  item: IRouteItem,
  user: IUser | null
) => {
  const idRegexp = /^\/admin\/projects\/([a-z0-9-]+)\/?/;
  const matches = idRegexp.exec(item.path);
  const pathProjectId = matches && matches[1];
  return (pathProjectId && isProjectModerator(user, pathProjectId)) || false;
};

export const isAdminRoute = (path: string) => {
  return /^\/admin/.test(path);
};

export const tenantIsChurned = (tenant: IAppConfigurationData) => {
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

    if (
      (isModerator(user) || isProjectFolderModerator(user)) &&
      isModeratorRoute(item)
    ) {
      return true;
    }

    if (
      item.path.includes('folders') &&
      user &&
      isProjectFolderModerator(user)
    ) {
      return true;
    }

    return isModeratedProjectRoute(item, user);
  } else {
    return true;
  }
};

definePermissionRule('route', 'access', canAccessRoute);
