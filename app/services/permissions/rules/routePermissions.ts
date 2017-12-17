import { definePermissionRule, IRouteItem } from '../permissions';
import { isAdmin } from '../roles';
import { IUser } from 'services/users';

definePermissionRule('route', 'access', (item: IRouteItem, user: IUser) => {
  if (/^\/admin/.test(item.path)) {
    return isAdmin(user);
  } else {
    return true;
  }
});
