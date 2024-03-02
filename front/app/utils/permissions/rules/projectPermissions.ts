import { definePermissionRule } from 'utils/permissions/permissions';
import { isAdmin, isProjectModerator } from '../roles';
import { IUser } from 'api/users/types';
import { IProjectData } from 'api/projects/types';

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

export function canModerateProject(projectId: string, user: IUser) {
  return isAdmin(user) || isProjectModerator(user, projectId);
}

definePermissionRule(
  'project',
  'moderate',
  (project: IProjectData, user: IUser) => {
    return canModerateProject(project.id, user);
  }
);
