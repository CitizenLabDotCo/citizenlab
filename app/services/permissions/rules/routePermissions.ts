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

export const MODERATOR_ROUTES = [
  '/admin/projects',
  '/admin/emails',
  '/admin/ideas',
  '/admin/workshops',
  '/admin/processing',
  '/admin/dashboard',
  '/admin/moderation',
];

export const isModeratorRoute = (item: IRouteItem) => {
  return MODERATOR_ROUTES.includes(item.path);
};

export const isModeratedProjectRoute = (
  item: IRouteItem,
  user: IUser | null
) => {
  const idRegexp = /^\/admin\/projects\/([a-z0-9-]+)\//;
  const matches = idRegexp.exec(item.path);
  const pathProjectId = matches && matches[1];
  return (pathProjectId && isProjectModerator(user, pathProjectId)) || false;
};

export const isAdminRoute = (item: IRouteItem) => {
  return /^\/admin/.test(item.path);
};

export const tenantIsChurned = (tenant: IAppConfigurationData) => {
  return tenant.attributes.settings.core.lifecycle_stage === 'churned';
};

export const canAccessRoute = (
  item: IRouteItem,
  user: IUser | null,
  tenant: IAppConfigurationData
) => {
  if (isAdminRoute(item)) {
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
