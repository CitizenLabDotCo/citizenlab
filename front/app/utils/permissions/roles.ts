import { IUser } from 'api/users/types';

export interface IProjectModeratorRole {
  type: 'project_moderator';
  project_id: string;
}

export interface IProjectFolderModeratorRole {
  type: 'project_folder_moderator';
  project_folder_id: string;
}

interface IAdminRole {
  type: 'admin';
  project_reviewer?: boolean;
}

interface IRoleRegisty {
  IAdminRole: IAdminRole;
  IProjectModeratorRole: IProjectModeratorRole;
  IProjectFolderModeratorRole: IProjectFolderModeratorRole;
}

export type TRole = IRoleRegisty[keyof IRoleRegisty];

export const userHasRole = (user: IUser, role: TRole['type']) => {
  const result = user.data.attributes.roles?.find((r) => r.type === role);

  return result !== undefined;
};

export const isAdmin = (user: IUser | undefined) => {
  if (!user) return false;

  return userHasRole(user, 'admin');
};

export const isModerator = (user: IUser | undefined) => {
  if (!user) return false;

  return ['project_moderator', 'project_folder_moderator'].includes(
    user.data.attributes.highest_role
  );
};

/*
  A super admin is an admin with @govocal.com email address.
  In the frontend, it doesn't have a significant meaning at the time of writing (18/1/'21).
  It does not exist in the roles value of an authUser.
  super_admin can be the highest_role value though.
  In the backend, it's used for data integrity.
  Most of the times it's used it's to make sure that we don't accept test data from CL employees as valid data.
*/
export const isSuperAdmin = (user: IUser | undefined) => {
  if (!user) return false;

  return user.data.attributes.highest_role === 'super_admin';
};

export const isRegularUser = (user: IUser | undefined) => {
  if (!user) return false;

  return user.data.attributes.highest_role === 'user';
};

export const isProjectModerator = (
  user: IUser | undefined,
  projectId: string
) => {
  if (!user) return false;

  const role = user.data.attributes.roles?.find(
    (r) => r.type === 'project_moderator' && r.project_id === projectId
  );

  return role !== undefined;
};
