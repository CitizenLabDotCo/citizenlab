import { definePermissionRule, IRouteItem } from '../permissions';
import { isAdmin, isModerator, isProjectModerator } from '../roles';
import { IUser } from 'services/users';

definePermissionRule('route', 'access', (item: IRouteItem, user: IUser) => {
  if (/^\/admin/.test(item.path)) {
    if (isAdmin(user)) return true;
    if (isModerator(user) && item.path === '/admin/projects') return true;

    // Try to find a project ID in the URL
    const idRegexp = /^\/admin\/projects\/([a-z0-9-]+)\//;
    const matches = idRegexp.exec(item.path);
    const pathProjectId = matches && matches[1];
    if (isProjectModerator(user, pathProjectId)) return true;

    return false;
  } else {
    return true;
  }
});
