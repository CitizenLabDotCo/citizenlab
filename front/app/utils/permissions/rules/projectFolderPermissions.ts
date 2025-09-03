import { IAppConfigurationData } from 'api/app_configuration/types';
import { IProjectFolderData } from 'api/project_folders/types';
import { IUser } from 'api/users/types';

import {
  definePermissionRule,
  IRouteItem,
} from 'utils/permissions/permissions';
import { isAdmin, TRole } from 'utils/permissions/roles';
import {
  canAccessRoute,
  isModeratorRoute,
} from 'utils/permissions/rules/routePermissions';

export function userModeratesFolder(
  user: IUser | undefined,
  projectFolderId: string
) {
  if (!user) return false;

  return isAdmin(user) || isProjectFolderModerator(user, projectFolderId);
}

/**
 * Checks if the user is a project folder moderator. If a folderId is provided,
 * it checks if the user is a moderator of that folder specifically.
 */
export function isProjectFolderModerator(
  user?: IUser,
  folderId?: string | null
): boolean {
  const roles = user?.data.attributes.roles;
  if (!roles) return false;

  if (folderId) {
    return roles.some(
      (role: TRole) =>
        role.type === 'project_folder_moderator' &&
        role.project_folder_id === folderId
    );
  } else {
    return roles.some(
      (role: TRole) => role.type === 'project_folder_moderator'
    );
  }
}

// rules
const canUserAccessAdminFolderRoute = (
  item: IRouteItem,
  user: IUser | undefined,
  tenant: IAppConfigurationData
) => {
  const hasAdminFolderRouteAccess = user
    ? isProjectFolderModerator(user) &&
      // folder mods have the same
      // access rights as project mods
      // besides their respective folders/projects
      (isModeratorRoute(item) || item.path.includes('admin/projects/folders'))
    : false;

  return canAccessRoute(item, user, tenant) || hasAdminFolderRouteAccess;
};

definePermissionRule('route', 'access', canUserAccessAdminFolderRoute);

definePermissionRule(
  'project_folder',
  'create',
  (_folder: IProjectFolderData, user) => {
    return isAdmin(user);
  }
);

definePermissionRule(
  'project_folder',
  'delete',
  (_folder: IProjectFolderData, user) => {
    return isAdmin(user);
  }
);

definePermissionRule(
  'project_folder',
  'reorder',
  (_folder: IProjectFolderData, user) => {
    return isAdmin(user);
  }
);

definePermissionRule(
  'project_folder',
  'moderate',
  (folder: IProjectFolderData, user) => {
    return userModeratesFolder(user, folder.id);
  }
);

// Permission to add or remove projects from folders
definePermissionRule(
  'project_folder',
  'manage_projects',
  (_folder: IProjectFolderData, user) => {
    return isAdmin(user);
  }
);

definePermissionRule(
  'project_folder',
  'create_project_in_folder',
  (_folder: IProjectFolderData, user) => {
    return isAdmin(user) || isProjectFolderModerator(user);
  }
);
