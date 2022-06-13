import { IProjectFolderData } from './../services/projectFolders';
import {
  definePermissionRule,
  IRouteItem,
} from 'services/permissions/permissions';
import { isProjectFolderModerator, moderatesFolder } from './roles';
import { isAdmin } from 'services/permissions/roles';
import {
  canAccessRoute,
  isAdminRoute,
  MODERATOR_INDEX_ROUTES,
} from 'services/permissions/rules/routePermissions';
import { IUser } from 'services/users';
import { IAppConfigurationData } from 'services/appConfiguration';
import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';

const canUserAccessAdminFolderRoute = (
  item: IRouteItem,
  user: IUser | null,
  tenant: IAppConfigurationData
) => {
  const { pathname: pathNameWithoutLocale } = removeLocale(item.path);
  const userIsProjectFolderModerator = user
    ? isProjectFolderModerator(user.data)
    : false;

  return (
    canAccessRoute(item, user, tenant) ||
    (typeof pathNameWithoutLocale === 'string' &&
      userIsProjectFolderModerator &&
      (isModeratorRoute(pathNameWithoutLocale) ||
        isProjectFolderRoute(pathNameWithoutLocale)))
  );
};

function isModeratorRoute(pathNameWithoutLocale: string) {
  return MODERATOR_INDEX_ROUTES.includes(pathNameWithoutLocale);
}

function isProjectFolderRoute(pathNameWithoutLocale: string) {
  return pathNameWithoutLocale
    ? isAdminRoute(pathNameWithoutLocale) &&
        /\/folders\/?/.test(pathNameWithoutLocale)
    : false;
}

definePermissionRule('route', 'access', canUserAccessAdminFolderRoute);

definePermissionRule(
  'project_folder',
  'create',
  (_folder: IProjectFolderData, user: IUser) => {
    return isAdmin(user);
  }
);

definePermissionRule(
  'project_folder',
  'delete',
  (_folder: IProjectFolderData, user: IUser) => {
    return isAdmin(user);
  }
);

definePermissionRule(
  'project_folder',
  'reorder',
  (_folder: IProjectFolderData, user: IUser) => {
    return isAdmin(user);
  }
);

definePermissionRule(
  'project_folder',
  'moderate',
  (folder: IProjectFolderData, user: IUser) => {
    return moderatesFolder(user.data, folder.id);
  }
);
