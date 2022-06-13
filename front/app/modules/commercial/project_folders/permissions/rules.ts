import { IProjectFolderData } from './../services/projectFolders';
import { definePermissionRule } from 'services/permissions/permissions';
import { moderatesFolder } from './roles';
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

definePermissionRule(
  'project_folder',
  'moderate',
  (folder: IProjectFolderData, user: IUser) => {
    return moderatesFolder(user.data, folder.id);
  }
);
