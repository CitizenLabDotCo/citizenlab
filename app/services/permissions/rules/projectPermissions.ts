import { definePermissionRule } from 'services/permissions/permissions';
import { isAdmin, isProjectModerator } from '../roles';
import { IUser } from 'services/users';
import { IProjectData } from 'services/projects';

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

export function canModerateProject(
  projectId: string | null | undefined,
  user: IUser
) {
  if (projectId) {
    return isAdmin(user) || isProjectModerator(user, projectId);
  }

  return isAdmin(user);
}

definePermissionRule(
  'project',
  'moderate',
  (project: IProjectData, user: IUser) => {
    return canModerateProject(project.id, user);
  }
);
