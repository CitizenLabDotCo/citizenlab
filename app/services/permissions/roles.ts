import {
  IUser,
  IRole,
  IProjectModerator,
  IAdminPublicationModerator,
} from 'services/users';
import { IProjectData } from 'services/projects';
import { IAdminPublicationData } from 'services/adminPublications';
import { isNilOrError } from 'utils/helperUtils';

const hasRole = (user: IUser, role: IRole['type']) => {
  return !!(
    user.data.attributes?.roles &&
    user.data.attributes.roles?.find((r) => r.type === role)
  );
};

export const isAdmin = (user?: IUser | null | undefined | Error) => {
  if (!isNilOrError(user)) {
    return !!user && hasRole(user, 'admin');
  }

  return false;
};

export const isSuperAdmin = (user?: IUser | null | Error) => {
  if (!isNilOrError(user)) {
    return user.data.attributes?.highest_role === 'super_admin';
  }
  return false;
};

export const isModerator = (user?: IUser | null) => {
  return !!user && hasRole(user, 'project_moderator');
};

export const isProjectModerator = (
  user?: IUser | null,
  projectId?: IProjectData['id'] | null
) => {
  return (
    isModerator(user) &&
    (!projectId ||
      !!(
        user &&
        projectId &&
        user.data.attributes?.roles &&
        user.data.attributes?.roles?.find(
          (r: IProjectModerator) => r.project_id === projectId
        )
      ))
  );
};

export const isAdminPublicationModerator = (
  user?: IUser | null,
  adminPublicationId?: IAdminPublicationData['id'] | null
) => {
  return (
    isModerator(user) &&
    (!adminPublicationId ||
      !!(
        user &&
        adminPublicationId &&
        user.data.attributes?.roles &&
        user.data.attributes?.roles?.find(
          (r: IAdminPublicationModerator) =>
            r.admin_publication_id === adminPublicationId
        )
      ))
  );
};
