import { appConfigurationData } from 'api/app_configuration/__mocks__/useAppConfiguration';
import { makeUser, makeAdmin } from 'api/users/__mocks__/useUsers';

import { IRouteItem } from 'utils/permissions/permissions';

import { canAccessRoute } from './routePermissions';

const tenant = appConfigurationData;

const route = (path: string): IRouteItem => ({ type: 'route', path });

// A route that only admins and moderators may access.
const MODERATOR_ROUTE = route('/admin/inspiration-hub');

describe('canAccessRoute', () => {
  describe('moderator-route gate must not fail open', () => {
    // Regression guard: a negative role check granted access when the role
    // attributes were absent from the /users/me payload (TAN-6826).
    it('denies a user whose highest_role and roles are missing', () => {
      const user = makeUser({ highest_role: undefined, roles: undefined });
      expect(canAccessRoute(MODERATOR_ROUTE, user, tenant)).toBe(false);
    });

    it('denies a plain regular user', () => {
      const user = makeUser({ highest_role: 'user', roles: [] });
      expect(canAccessRoute(MODERATOR_ROUTE, user, tenant)).toBe(false);
    });
  });

  describe('legitimate access is preserved', () => {
    it('allows an admin', () => {
      expect(canAccessRoute(MODERATOR_ROUTE, makeAdmin(), tenant)).toBe(true);
    });

    it('allows a project moderator', () => {
      const user = makeUser({
        highest_role: 'project_moderator',
        roles: [{ type: 'project_moderator', project_id: 'project-1' }],
      });
      expect(canAccessRoute(MODERATOR_ROUTE, user, tenant)).toBe(true);
    });
  });

  describe('non-admin routes stay public', () => {
    it('allows a user with missing role attributes on a non-admin route', () => {
      const user = makeUser({ highest_role: undefined, roles: undefined });
      expect(canAccessRoute(route('/ideas'), user, tenant)).toBe(true);
    });
  });
});
