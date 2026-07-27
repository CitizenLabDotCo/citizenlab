import { IAppConfigurationData } from 'api/app_configuration/types';
import { IProjectFolderData } from 'api/project_folders/types';
import { IUser } from 'api/users/types';

import {
  definePermissionRule,
  IRouteItem,
} from 'utils/permissions/permissions';
import { isAdmin, isSpaceModerator, TRole } from 'utils/permissions/roles';
import {
  canAccessRoute,
  isModeratorRoute,
} from 'utils/permissions/rules/routePermissions';

// Fails closed when the folder id is missing — this is always a question about
// a specific folder. `folderSpaceId` lets moderators of the folder's space
// moderate it too.
export function userModeratesFolder(
  user: IUser | undefined | null,
  projectFolderId?: string | null,
  folderSpaceId?: string | null
) {
  if (!user) return false;
  if (typeof projectFolderId !== 'string') return false;

  return (
    isAdmin(user) ||
    isProjectFolderModerator(user, projectFolderId) ||
    (typeof folderSpaceId === 'string' && isSpaceModerator(user, folderSpaceId))
  );
}

// Fails closed when the space id is missing — this is always a question about
// a specific space.
export const userModeratesSpace = (
  user: IUser | undefined | null,
  spaceId?: string | null
) => {
  if (!user) return false;
  if (typeof spaceId !== 'string') return false;

  return isAdmin(user) || isSpaceModerator(user, spaceId);
};

/**
 * Checks if the user is a project folder moderator. If a folderId is provided,
 * it checks if the user is a moderator of that folder specifically.
 */
export function isProjectFolderModerator(
  user?: IUser | null,
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
  user: IUser | undefined | null,
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

// Pass the folder id via `context` (e.g. `{ folderId, folderSpaceId }`) so the
// rule can check moderation of that specific folder.
definePermissionRule(
  'project_folder',
  'moderate',
  (_folder, user, _tenant, context) =>
    userModeratesFolder(user, context?.folderId, context?.folderSpaceId)
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
