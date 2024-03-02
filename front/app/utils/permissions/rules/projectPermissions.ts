import { definePermissionRule } from 'utils/permissions/permissions';
import { isAdmin, isProjectModerator } from '../roles';
import { IUser } from 'api/users/types';
import { IProjectData } from 'api/projects/types';
import { userModeratesFolder } from './projectFolderPermissions';

definePermissionRule(
  'project',
  'create',
  (_project: IProjectData, user: IUser) => {
    return isAdmin(user);
  }
);

definePermissionRule(
  'project',
  'delete',
  (_project: IProjectData, user: IUser) => {
    return isAdmin(user);
  }
);

definePermissionRule(
  'project',
  'reorder',
  (_project: IProjectData, user: IUser) => {
    return isAdmin(user);
  }
);

export function canModerateProject(project: IProjectData, user: IUser) {
  const projectId = project.id;
  const projectFolderId = project.attributes.folder_id;

  return (
    isAdmin(user) ||
    (typeof projectFolderId === 'string' &&
      canModerateParentFolder(user, projectFolderId)) ||
    isProjectModerator(user, projectId)
  );
}

function canModerateParentFolder(user: IUser, projectFolderId: string) {
  return userModeratesFolder(user.data, projectFolderId);
}

definePermissionRule(
  'project',
  'moderate',
  (project: IProjectData, user: IUser) => {
    return canModerateProject(project, user);
  }
);
