import { IProjectFolderData } from './../services/projectFolders';
import { definePermissionRule } from 'services/permissions/permissions';
import { isProjectFolderModerator } from './roles';
import { isAdmin } from 'services/permissions/roles';
import { IUser } from 'services/users';

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

export const canModerate = (user: IUser, folder: IProjectFolderData) =>
  isAdmin(user) || isProjectFolderModerator(user, folder.id);

definePermissionRule(
  'project_folder',
  'moderate',
  (_folder: IProjectFolderData, user: IUser) => {
    return canModerate(user, _folder);
  }
);
