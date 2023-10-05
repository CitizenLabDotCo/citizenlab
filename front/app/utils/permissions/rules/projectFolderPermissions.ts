import { IUserData, IUser } from 'api/users/types';
import { isAdmin, TRole } from 'utils/permissions/roles';
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
import { isNilOrError } from 'utils/helperUtils';

export function userModeratesFolder(
  user: IUserData | null,
  projectFolderId: string
) {
  if (isNilOrError(user)) {
    return false;
  }

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
  return !!user.attributes?.roles?.find((role: TRole) => {
    return role.type === 'project_folder_moderator';
  });
}

// rules

const canUserAccessAdminFolderRoute = (
  item: IRouteItem,
  user: IUser | null,
  tenant: IAppConfigurationData
) => {
  const hasAdminFolderRouteAccess =
    !isNilOrError(user) &&
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
