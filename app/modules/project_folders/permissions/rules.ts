import { IProjectFolderData } from './../services/projectFolders';
import { definePermissionRule } from 'services/permissions/permissions';
import { isFolderModerator } from './roles';
import { isAdmin } from 'services/permissions/roles';
import { IUser } from 'services/users';
import { IProjectData } from 'services/projects';

definePermissionRule(
  'project_folder',
  'create',
  (_project: IProjectData, user: IUser) => {
    return isAdmin(user);
  }
);

definePermissionRule(
  'project_folder',
  'delete',
  (_project: IProjectData, user: IUser) => {
    return isAdmin(user);
  }
);

definePermissionRule(
  'project_folder',
  'reorder',
  (_project: IProjectFolderData, user: IUser) => {
    return isAdmin(user);
  }
);

export const canModerate = (user: IUser, folder: ?IProjectFolderData) =>
  isAdmin(user) || isFolderModerator(user, folder);

definePermissionRule(
  'project_folder',
  'moderate',
  (user: IUser, folder: ?IProjectFolderData) => {
    return canModerate(user, folder);
  }
);
