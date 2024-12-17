import { IProjectData } from 'api/projects/types';
import { IUser } from 'api/users/types';

import { definePermissionRule } from 'utils/permissions/permissions';

import { isAdmin, isProjectModerator } from '../roles';

import {
  isProjectFolderModerator,
  userModeratesFolder,
} from './projectFolderPermissions';

definePermissionRule('project', 'create', (_project: IProjectData, user) => {
  return isAdmin(user);
});

definePermissionRule('project', 'delete', (_project: IProjectData, user) => {
  return isAdmin(user);
});

definePermissionRule('project', 'reorder', (_project: IProjectData, user) => {
  return isAdmin(user);
});

definePermissionRule(
  'project',
  'publish',
  (project: IProjectData, user, _tenant, isProjectApproved: boolean) => {
    return (
      isAdmin(user) ||
      isProjectFolderModerator(user, project.attributes.folder_id) ||
      (isProjectApproved && isProjectModerator(user, project.id))
    );
  }
);

definePermissionRule(
  'project',
  'review',
  (project: IProjectData, user, _tenant) => {
    return (
      isAdmin(user) ||
      isProjectFolderModerator(user, project.attributes.folder_id)
    );
  }
);

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
      userModeratesFolder(user, projectFolderId)) ||
    isProjectModerator(user, projectId)
  );
}

definePermissionRule('project', 'moderate', (project: IProjectData, user) => {
  return canModerateProject(project, user);
});
