import { IUser, IUserData } from 'api/users/types';

import { definePermissionRule } from 'utils/permissions/permissions';

import { isAdmin, isSuperAdmin } from '../roles';

// Mirrors the backend UserPolicy: admins may update, delete and block other
// users, but only super admins may do so on a super admin's account.
export const canManageUser = (
  target: IUserData,
  authUser: IUser | undefined | null
) => {
  if (!isAdmin(authUser)) return false;
  if (isSuperAdmin(authUser)) return true;

  return !isSuperAdmin({ data: target });
};

definePermissionRule('user', 'manage', canManageUser);
