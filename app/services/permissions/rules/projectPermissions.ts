import { definePermissionRule } from '../permissions';
import { isAdmin } from '../roles';
import { IUser } from 'services/users';
import { IProjectData } from 'services/projects';

definePermissionRule('projects', 'create', (_project: IProjectData, user: IUser) => {
  return isAdmin(user);
});

definePermissionRule('projects', 'delete', (_project: IProjectData, user: IUser) => {
  return isAdmin(user);
});

definePermissionRule('projects', 'reorder', (_project: IProjectData, user: IUser) => {
  return isAdmin(user);
});
