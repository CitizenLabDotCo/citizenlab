import { IProjectData } from 'api/projects/types';
import { IUser } from 'api/users/types';

import { definePermissionRule } from 'utils/permissions/permissions';

import { isAdmin, isProjectModerator } from '../roles';

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
  projectId: string | null | undefined,
  user: IUser | undefined
) {
  if (projectId) {
    return isAdmin(user) || isProjectModerator(user, projectId);
  }

  return isAdmin(user);
}

definePermissionRule('project', 'moderate', (project: IProjectData, user) => {
  return canModerateProject(project.id, user);
});
