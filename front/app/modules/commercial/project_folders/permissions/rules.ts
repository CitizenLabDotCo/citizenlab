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
  MODERATOR_ROUTES,
  isModeratorRoute,
} from 'services/permissions/rules/routePermissions';
import { IUser } from 'services/users';
import { IAppConfigurationData } from 'services/appConfiguration';
import { isNilOrError } from 'utils/helperUtils';

const canUserAccessAdminFolderRoute = (
  item: IRouteItem,
  user: IUser | null,
  tenant: IAppConfigurationData
) => {
  return (
    canAccessRoute(item, user, tenant) ||
    (!isNilOrError(user) &&
      isProjectFolderModerator(user.data) &&
      isModeratorRoute(item)) ||
    (!isNilOrError(user) &&
      item.path.includes('folders') &&
      user &&
      isProjectFolderModerator(user.data)) ||
    (isAdminRoute(item.path) &&
      (user ? isProjectFolderModerator(user.data) : false) &&
      MODERATOR_ROUTES.includes(item.path))
  );
};

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
