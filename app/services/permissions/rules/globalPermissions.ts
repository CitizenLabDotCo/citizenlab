import { definePermissionRule } from '../.';
import { isAdmin } from '../roles';
import { IUser } from 'services/users';

definePermissionRule('global', 'accessAdminInterface', (item, user: IUser) => {
  return isAdmin(user);
});
