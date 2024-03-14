import { IAppConfigurationData } from 'api/app_configuration/types';
import { IProjectFolderData } from 'api/project_folders/types';
import { IUserData, IUser } from 'api/users/types';

import { isNilOrError } from 'utils/helperUtils';
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
  user: IUserData | undefined,
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

export function isProjectFolderModerator(user: IUserData | undefined) {
  return !!user?.attributes?.roles?.find((role: TRole) => {
    return role.type === 'project_folder_moderator';
  });
}

// rules
const canUserAccessAdminFolderRoute = (
  item: IRouteItem,
  user: IUser | undefined,
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
    return user ? userModeratesFolder(user.data, folder.id) : false;
  }
);

definePermissionRule(
  'project_folder',
  'create_project_in_folder_only',
  (_folder, user) => {
    return user ? !isAdmin(user) && isProjectFolderModerator(user.data) : false;
  }
);
