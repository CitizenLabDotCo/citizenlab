import { HighestRole, IUser } from 'api/users/types';

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

export interface ISpaceModeratorRole {
  type: 'space_moderator';
  space_id: string;
}

// NOTE: TRole['type'] is NOT the same as HighestRole (front/app/api/users/types.ts)!
// highest role also includes super_admin.
export type TRole =
  | IAdminRole
  | IProjectFolderModeratorRole
  | IProjectModeratorRole
  | ISpaceModeratorRole;

const ADMIN_ROLES: HighestRole[] = ['admin', 'super_admin'];

/*
  Mirrors UserRoles#highest_role_for in the back end, including its rule that a
  moderator role without its scope id doesn't count. A roles array can never imply
  super_admin: that depends on the user's email domain, which the array doesn't carry.
*/
export const highestRoleFor = (roles: TRole[] | undefined): HighestRole => {
  const rolesList = roles ?? [];

  if (rolesList.some((role) => role.type === 'admin')) {
    return 'admin';
  }

  if (
    rolesList.some((role) => role.type === 'space_moderator' && role.space_id)
  ) {
    return 'space_moderator';
  }

  if (
    rolesList.some(
      (role) =>
        role.type === 'project_folder_moderator' && role.project_folder_id
    )
  ) {
    return 'project_folder_moderator';
  }

  if (
    rolesList.some(
      (role) => role.type === 'project_moderator' && role.project_id
    )
  ) {
    return 'project_moderator';
  }

  return 'user';
};

// Most privileged first, in the precedence UserRoles#highest_role_for uses to pick a
// user's one label. super_admin is admin with a Go Vocal email, so it shares the rank.
const TIER_ORDER: HighestRole[] = [
  'admin',
  'space_moderator',
  'project_folder_moderator',
  'project_moderator',
  'user',
];

const UNKNOWN_TIER = -1;

const tierRank = (role: HighestRole) =>
  TIER_ORDER.indexOf(role === 'super_admin' ? 'admin' : role);

/*
  True when the roles array implies a tier above the one the signed JWT claims, which
  only a rewritten /users/me body can produce. Falling short of the claim is accepted
  on purpose: a role type added to the back end but not yet known here ranks as user,
  and signing those users out would lock them out for good, because the next login
  mints the same claim. See fetchMe in front/app/api/me/useAuthUser.ts.
*/
export const rolesExceedHighestRole = (
  roles: TRole[] | undefined,
  highestRole: HighestRole
) => {
  const claimedRank = tierRank(highestRole);
  if (claimedRank === UNKNOWN_TIER) return false;

  return tierRank(highestRoleFor(roles)) < claimedRank;
};

export const isAdmin = (user: IUser | undefined | null) => {
  if (!user) return false;

  return ADMIN_ROLES.includes(user.data.attributes.highest_role ?? 'user');
};

const MODERATOR_TYPES = [
  'project_moderator',
  'project_folder_moderator',
  'space_moderator',
];

export const isModerator = (user: IUser | undefined | null) => {
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
export const isSuperAdmin = (user: IUser | undefined | null) => {
  if (!user) return false;

  return user.data.attributes.highest_role === 'super_admin';
};

export const isRegularUser = (user: IUser | undefined | null) => {
  if (!user) return false;

  return user.data.attributes.highest_role === 'user';
};

export const isProjectModerator = (
  user: IUser | undefined | null,
  projectId?: string
) => {
  if (!user) return false;

  const roles = user.data.attributes.roles || [];

  if (projectId) {
    return roles.some(
      (r) => r.type === 'project_moderator' && r.project_id === projectId
    );
  }

  return roles.some((r) => r.type === 'project_moderator');
};

export const isSpaceModerator = (
  user: IUser | undefined | null,
  spaceId?: string
) => {
  if (!user) return false;

  const roles = user.data.attributes.roles || [];

  if (spaceId) {
    return roles.some(
      (r) => r.type === 'space_moderator' && r.space_id === spaceId
    );
  }

  return roles.some((r) => r.type === 'space_moderator');
};
