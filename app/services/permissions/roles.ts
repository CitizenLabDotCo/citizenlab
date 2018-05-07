import { IUser, IRole } from 'services/users';
import { IProjectData } from 'services/projects';

const hasRole = (user: IUser, role: IRole['type']) => {
  return !!(user.data.attributes.roles && user.data.attributes.roles.find((r) => r.type === role));
};

export const isAdmin = (user?: IUser): boolean  => {
  return !!user && hasRole(user, 'admin');
};

export const isModerator = (user?: IUser): boolean => {
  return !!user && hasRole(user, 'project_moderator');
};

export const isProjectModerator = (user?: IUser, projectId?: IProjectData['id'] | null): boolean => {
  return isModerator(user) && !!(user && projectId && user.data.attributes.roles && user.data.attributes.roles.find((r) => r.project_id === projectId));
};
