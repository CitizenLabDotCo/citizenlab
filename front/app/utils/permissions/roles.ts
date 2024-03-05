import { IUser } from 'api/users/types';
import { isNilOrError } from 'utils/helperUtils';

export interface IProjectModeratorRole {
  type: 'project_moderator';
  project_id: string;
}

interface IProjectFolderModeratorRole {
  type: 'project_folder_moderator';
  project_folder_id: string;
}

interface IAdminRole {
  type: 'admin';
}

export interface IRoleRegisty {
  IAdminRole: IAdminRole;
  IProjectModeratorRole: IProjectModeratorRole;
  IProjectFolderModeratorRole: IProjectFolderModeratorRole;
}

export type TRole = IRoleRegisty[keyof IRoleRegisty];

export const userHasRole = (user: IUser, role: TRole['type']) => {
  return !!(
    user.data.attributes?.roles &&
    user.data.attributes.roles?.find((r) => r.type === role)
  );
};

export const isAdmin = (user?: IUser | null | undefined | Error) => {
  if (!isNilOrError(user)) {
    return !!user && userHasRole(user, 'admin');
  }

  return false;
};

export const isModerator = (user?: IUser | null | undefined | Error) => {
  if (!isNilOrError(user)) {
    return ['project_moderator', 'project_folder_moderator'].includes(
      user.data.attributes.highest_role
    );
  }

  return false;
};

/*
  A super admin is an admin with @citizenlab.co email address.
  In the frontend, it doesn't have a significant meaning at the time of writing (18/1/'21).
  It does not exist in the roles value of an authUser.
  super_admin can be the highest_role value though.
  In the backend, it's used for data integrity.
  Most of the times it's used it's to make sure that we don't accept test data from CL employees as valid data.
*/
export const isSuperAdmin = (user?: IUser | null | Error) => {
  if (!isNilOrError(user)) {
    return user.data.attributes?.highest_role === 'super_admin';
  }
  return false;
};

export const isRegularUser = (user?: IUser | null) => {
  if (!isNilOrError(user)) {
    // Every user with a role higher than "user" can be considered a moderator
    return user.data.attributes?.highest_role === 'user';
  }
  return false;
};

export const isProjectModerator = (user?: IUser | null, projectId?: string) => {
  return (
    isModerator(user) &&
    (!projectId ||
      !!(
        user &&
        projectId &&
        user.data.attributes?.roles &&
        user.data.attributes?.roles?.find(
          (r: IProjectModeratorRole) => r.project_id === projectId
        )
      ))
  );
};
