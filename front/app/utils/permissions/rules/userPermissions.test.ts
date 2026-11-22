import {
  makeAdmin,
  makeSuperAdmin,
  makeUser,
} from 'api/users/__mocks__/useUsers';

import { canManageUser } from './userPermissions';

describe('canManageUser', () => {
  it('lets an admin manage a regular user', () => {
    expect(canManageUser(makeUser().data, makeAdmin())).toBe(true);
  });

  it('does not let an admin manage a super admin', () => {
    expect(canManageUser(makeSuperAdmin().data, makeAdmin())).toBe(false);
  });

  it('lets a super admin manage another super admin', () => {
    expect(canManageUser(makeSuperAdmin().data, makeSuperAdmin())).toBe(true);
  });

  it('does not let a regular user manage anyone', () => {
    expect(canManageUser(makeUser().data, makeUser())).toBe(false);
  });
});
