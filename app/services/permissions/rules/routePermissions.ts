import { definePermissionRule } from '../permissions';
import { isAdmin } from '../roles';
import { IUser } from 'services/users';

definePermissionRule('routes', 'admin', (item, user: IUser) => {
  return isAdmin(user);
});
