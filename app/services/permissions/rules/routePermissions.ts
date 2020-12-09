import {
  definePermissionRule,
  IRouteItem,
} from 'services/permissions/permissions';
import {
  isAdmin,
  isModerator,
  isProjectModerator,
  isSuperAdmin,
} from '../roles';
import { IUser } from 'services/users';
import { ITenantData } from 'services/tenant';

definePermissionRule(
  'route',
  'access',
  (item: IRouteItem, user: IUser | null, tenant: ITenantData) => {
    if (/^\/admin/.test(item.path)) {
      if (isSuperAdmin(user)) {
        return true;
      }
      if (tenant.attributes.settings.core.lifecycle_stage === 'churned') {
        return false;
      }

      if (isAdmin(user)) {
        return true;
      }

      if (
        (isModerator(user) && item.path === '/admin/dashboard') ||
        item.path === '/admin/projects' ||
        item.path === '/admin/emails' ||
        item.path === '/admin/ideas' ||
        item.path === '/admin/workshops' ||
        item.path === '/admin/processing' ||
        item.path === '/admin/moderation'
      ) {
        return true;
      }

      // Try to find a project ID in the URL
      const idRegexp = /^\/admin\/projects\/([a-z0-9-]+)\//;
      const matches = idRegexp.exec(item.path);
      const pathProjectId = matches && matches[1];
      if (pathProjectId && isProjectModerator(user, pathProjectId)) return true;

      return false;
    } else {
      return true;
    }
  }
);
