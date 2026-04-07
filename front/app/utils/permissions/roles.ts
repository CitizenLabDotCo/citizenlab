import { IUser } from 'api/users/types';

interface IAdminRole {
  type: 'admin';
  project_reviewer?: boolean;
}

export interface IProjectModeratorRole {
  type: 'project_moderator';
  project_id: string;
}

export interface IProjectFolderModeratorRole {
  type: 'project_folder_moderator';
  project_folder_id: string;
}

interface ISpaceModeratorRole {
  type: 'space_moderator';
  space_id: string;
}

export type TRole =
  | IAdminRole
  | IProjectFolderModeratorRole
  | IProjectModeratorRole
  | ISpaceModeratorRole;

export const userHasRole = (user: IUser, role: TRole['type']) => {
  const result = user.data.attributes.roles?.find((r) => r.type === role);

  return result !== undefined;
};

export const isAdmin = (user: IUser | undefined) => {
  if (!user) return false;

  return userHasRole(user, 'admin');
};

const MODERATOR_TYPES = [
  'project_moderator',
  'project_folder_moderator',
  'space_moderator',
];

export const isModerator = (user: IUser | undefined) => {
  if (!user) return false;

  return MODERATOR_TYPES.includes(user.data.attributes.highest_role ?? 'user');
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
  projectId?: string
) => {
  if (!user) return false;

  if (projectId) {
    const role = user.data.attributes.roles?.find(
      (r) => r.type === 'project_moderator' && r.project_id === projectId
    );

    return role !== undefined;
  } else {
    return user.data.attributes.roles?.some(
      (r) => r.type === 'project_moderator'
    );
  }
};

export const isSpaceModerator = (user: IUser | undefined) => {
  if (!user) return false;

  const role = user.data.attributes.roles?.find(
    (r) => r.type === 'space_moderator'
  );

  return role !== undefined;
};
