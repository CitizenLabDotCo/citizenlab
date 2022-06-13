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
import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';

export const MODERATOR_INDEX_ROUTES = [
  '/admin/projects',
  '/admin/messaging',
  '/admin/ideas',
  '/admin/workshops',
  '/admin/processing',
  '/admin/dashboard',
  '/admin/moderation',
  '/admin/insights',
];

export const isModeratorIndexRoute = (item: IRouteItem) => {
  return MODERATOR_INDEX_ROUTES.includes(item.path);
};

export const isModeratedProjectRoute = (
  item: IRouteItem,
  user: IUser | null
) => {
  const { pathname: pathNameWithoutLocale } = removeLocale(item.path);
  const idRegexp = /^\/admin\/projects\/([a-z0-9-]+)\/?/;
  const matches = pathNameWithoutLocale
    ? idRegexp.exec(pathNameWithoutLocale)
    : false;
  const pathProjectId = matches && matches[1];
  return pathProjectId && isProjectModerator(user, pathProjectId);
};

export const isAdminRoute = (path: string) => {
  const { pathname: pathNameWithoutLocale } = removeLocale(path);

  return pathNameWithoutLocale ? /^\/admin/.test(pathNameWithoutLocale) : false;
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

    if (isModerator(user) && isModeratorIndexRoute(item)) {
      return true;
    }

    return isModeratedProjectRoute(item, user);
  } else {
    return true;
  }
};

definePermissionRule('route', 'access', canAccessRoute);
