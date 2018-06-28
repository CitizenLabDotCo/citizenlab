import { IUser, IRole } from 'services/users';
import { IProjectData } from 'services/projects';
import { isNilOrError } from 'utils/helperUtils';

const hasRole = (user: IUser, role: IRole['type']) => {
  return !!(user.data.attributes.roles && user.data.attributes.roles.find((r) => r.type === role));
};

export const isAdmin = (user?: IUser | null | undefined | Error)  => {
  if (!isNilOrError(user)) {
    return !!user && hasRole(user, 'admin');
  }

  return false;
};

export const isModerator = (user?: IUser) => {
  return !!user && hasRole(user, 'project_moderator');
};

export const isProjectModerator = (user?: IUser, projectId?: IProjectData['id'] | null) => {
  return isModerator(user) && !!(user && projectId && user.data.attributes.roles && user.data.attributes.roles.find((r) => r.project_id === projectId));
};
