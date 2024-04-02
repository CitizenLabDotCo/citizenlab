import { IProjectData } from 'api/projects/types';
import { IUser } from 'api/users/types';

import { definePermissionRule } from 'utils/permissions/permissions';

import { isAdmin, isProjectModerator } from '../roles';

import { userModeratesFolder } from './projectFolderPermissions';

definePermissionRule('project', 'create', (_project: IProjectData, user) => {
  return user ? isAdmin(user) : false;
});

definePermissionRule('project', 'delete', (_project: IProjectData, user) => {
  return user ? isAdmin(user) : false;
});

definePermissionRule('project', 'reorder', (_project: IProjectData, user) => {
  return user ? isAdmin(user) : false;
});

export function canModerateProject(project: IProjectData, user: IUser) {
  const projectId = project.id;
  const projectFolderId = project.attributes.folder_id;

  return (
    isAdmin(user) ||
    (typeof projectFolderId === 'string' &&
      userModeratesFolder(user.data, projectFolderId)) ||
    isProjectModerator(user, projectId)
  );
}

definePermissionRule('project', 'moderate', (project: IProjectData, user) => {
  return user ? canModerateProject(project, user) : false;
});
