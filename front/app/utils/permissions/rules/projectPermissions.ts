import { IProjectData } from 'api/projects/types';
import { IUser } from 'api/users/types';

import { definePermissionRule } from 'utils/permissions/permissions';

import { isAdmin, isProjectModerator } from '../roles';

import { userModeratesFolder } from './projectFolderPermissions';

definePermissionRule('project', 'create', (_project: IProjectData, user) => {
  return isAdmin(user);
});

definePermissionRule('project', 'delete', (_project: IProjectData, user) => {
  return isAdmin(user);
});

definePermissionRule('project', 'reorder', (_project: IProjectData, user) => {
  return isAdmin(user);
});

export function canModerateProject(
  project: IProjectData,
  user: IUser | undefined
) {
  const projectId = project.id;
  const projectFolderId = project.attributes.folder_id;

  if (!user) return false;

  return (
    isAdmin(user) ||
    (typeof projectFolderId === 'string' &&
      userModeratesFolder(user.data, projectFolderId)) ||
    isProjectModerator(user, projectId)
  );
}

definePermissionRule('project', 'moderate', (project: IProjectData, user) => {
  return canModerateProject(project, user);
});
