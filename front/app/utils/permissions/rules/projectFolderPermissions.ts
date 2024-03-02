import { IUserData, IUser } from 'api/users/types';
import { isAdmin, TRole, userHasRole } from 'utils/permissions/roles';
import { IProjectFolderData } from 'api/project_folders/types';
import {
  definePermissionRule,
  IRouteItem,
} from 'utils/permissions/permissions';
import {
  canAccessRoute,
  isModeratorRoute,
} from 'utils/permissions/rules/routePermissions';
import { IAppConfigurationData } from 'api/app_configuration/types';

export function userModeratesFolder(user: IUserData, projectFolderId: string) {
  return (
    isAdmin({ data: user }) ||
    !!user.attributes?.roles?.find((role: TRole) => {
      return (
        role.type === 'project_folder_moderator' &&
        role.project_folder_id === projectFolderId
      );
    })
  );
}

export function isProjectFolderModerator(user: IUserData) {
  return userHasRole({ data: user }, 'project_folder_moderator');
}

// rules
const canUserAccessAdminFolderRoute = (
  item: IRouteItem,
  user: IUser,
  tenant: IAppConfigurationData
) => {
  const hasAdminFolderRouteAccess =
    isProjectFolderModerator(user.data) &&
    // folder mods have the same
    // access rights as project mods
    // besides their respective folders/projects
    (isModeratorRoute(item) || item.path.includes('admin/projects/folders'));

  return canAccessRoute(item, user, tenant) || hasAdminFolderRouteAccess;
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
    return userModeratesFolder(user.data, folder.id);
  }
);

definePermissionRule(
  'project_folder',
  'create_project_in_folder_only',
  (_folder, user: IUser) => {
    return !isAdmin(user) && isProjectFolderModerator(user.data);
  }
);
