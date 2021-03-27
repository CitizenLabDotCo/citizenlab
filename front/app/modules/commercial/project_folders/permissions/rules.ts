import { IProjectFolderData } from './../services/projectFolders';
import {
  definePermissionRule,
  IRouteItem,
} from 'services/permissions/permissions';
import { isProjectFolderModerator } from './roles';
import { isAdmin } from 'services/permissions/roles';
import {
  canAccessRoute,
  isAdminRoute,
  MODERATOR_ROUTES,
} from 'services/permissions/rules/routePermissions';
import { IUser } from 'services/users';
import { IAppConfigurationData } from 'services/appConfiguration';

const canUserAccessAdminFolderRoute = (
  item: IRouteItem,
  user: IUser | null,
  tenant: IAppConfigurationData
) => {
  return (
    canAccessRoute(item, user, tenant) ||
    (isAdminRoute(item) &&
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
    return isProjectFolderModerator(user.data, folder.id);
  }
);
