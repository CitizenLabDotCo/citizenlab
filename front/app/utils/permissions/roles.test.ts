import { makeUser } from 'api/users/__mocks__/useUsers';
import { HighestRole } from 'api/users/types';

import {
  highestRoleFor,
  isAdmin,
  isRegularUser,
  isProjectModerator,
  isSuperAdmin,
  rolesExceedHighestRole,
  TRole,
} from './roles';

describe('highestRoleFor', () => {
  it('returns the highest role of an array holding several roles', () => {
    expect(
      highestRoleFor([
        { type: 'project_moderator', project_id: 'project-1' },
        { type: 'admin' },
      ])
    ).toBe('admin');
  });

  it('returns user for an empty array', () => {
    expect(highestRoleFor([])).toBe('user');
  });

  it('returns user when roles are undefined', () => {
    expect(highestRoleFor(undefined)).toBe('user');
  });

  it('ignores a moderator role without its scope id', () => {
    // Only a tampered response body can carry these, so they don't satisfy TRole.
    const scopelessRoles = [
      { type: 'project_moderator' },
      { type: 'space_moderator' },
    ] as TRole[];

    expect(highestRoleFor(scopelessRoles)).toBe('user');
  });
});

describe('rolesExceedHighestRole', () => {
  it('flags an admin role entry on a user claim', () => {
    expect(rolesExceedHighestRole([{ type: 'admin' }], 'user')).toBe(true);
  });

  it('flags a moderator role entry on a user claim', () => {
    expect(
      rolesExceedHighestRole(
        [{ type: 'project_moderator', project_id: 'project-1' }],
        'user'
      )
    ).toBe(true);
  });

  it('flags an admin role entry on a project moderator claim', () => {
    expect(
      rolesExceedHighestRole([{ type: 'admin' }], 'project_moderator')
    ).toBe(true);
  });

  it('allows an admin role entry on an admin claim', () => {
    expect(rolesExceedHighestRole([{ type: 'admin' }], 'admin')).toBe(false);
  });

  it('allows an admin role entry on a super admin claim', () => {
    expect(rolesExceedHighestRole([{ type: 'admin' }], 'super_admin')).toBe(
      false
    );
  });

  it('allows several project moderator roles on a project moderator claim', () => {
    expect(
      rolesExceedHighestRole(
        [
          { type: 'project_moderator', project_id: 'project-1' },
          { type: 'project_moderator', project_id: 'project-2' },
        ],
        'project_moderator'
      )
    ).toBe(false);
  });

  it('allows an empty array on an admin claim', () => {
    expect(rolesExceedHighestRole([], 'admin')).toBe(false);
  });

  it('allows a role type this frontend does not know yet', () => {
    // A tier the back end may add later. Signing these users out would lock them
    // out for good, since the next login mints the same claim.
    const futureRole = 'tenant_moderator' as HighestRole;

    expect(rolesExceedHighestRole([], futureRole)).toBe(false);
  });
});

describe('isAdmin', () => {
  it('returns true when a user is an admin', () => {
    const admin = makeUser({
      roles: [{ type: 'admin' }],
      highest_role: 'admin',
    });
    expect(isAdmin(admin)).toBe(true);
  });

  it('returns true when a user is a super admin', () => {
    const superAdmin = makeUser({
      roles: [{ type: 'admin' }],
      highest_role: 'super_admin',
    });
    expect(isAdmin(superAdmin)).toBe(true);
  });

  it('returns false when a user is not an admin', () => {
    const regularUser = makeUser();
    expect(isAdmin(regularUser)).toBe(false);
  });

  it('returns false when only the roles array claims admin', () => {
    const tamperedUser = makeUser({
      roles: [{ type: 'admin' }],
      highest_role: 'user',
    });
    expect(isAdmin(tamperedUser)).toBe(false);
  });
});

describe('isRegularUser', () => {
  it('returns false when a user is a super admin', () => {
    const superAdmin = makeUser({
      highest_role: 'super_admin',
    });
    expect(isRegularUser(superAdmin)).toBe(false);
  });

  it('returns false when a user is an admin', () => {
    const admin = makeUser({
      highest_role: 'admin',
    });
    expect(isRegularUser(admin)).toBe(false);
  });

  it('returns false when a user is a project moderator', () => {
    const projectModerator = makeUser({
      highest_role: 'project_moderator',
    });
    expect(isRegularUser(projectModerator)).toBe(false);
  });

  it('returns true when a user is not a moderator', () => {
    const regularUser = makeUser({
      highest_role: 'user',
    });
    expect(isRegularUser(regularUser)).toBe(true);
  });
});

describe('isProjectModerator', () => {
  it('returns true when a user is a moderator for a specific project', () => {
    const projectId = '793ee057-3191-53ce-a862-5f97b5c03c8b';
    const moderator = makeUser({
      highest_role: 'project_moderator',
      roles: [{ type: 'project_moderator', project_id: projectId }],
    });
    expect(isProjectModerator(moderator, projectId)).toBe(true);
  });

  it('returns false when a user is a moderator for a different project', () => {
    const projectId = '793ee057-3191-53ce-a862-5f97b5c03c8b';
    const moderator = makeUser({
      roles: [{ type: 'project_moderator', project_id: projectId }],
    });
    expect(
      isProjectModerator(moderator, '444add65-e122-51db-a1b9-80fcd2e3f635')
    ).toBe(false);
  });

  it('returns false when a user is not a moderator', () => {
    const regularUser = makeUser();
    expect(
      isProjectModerator(regularUser, 'df534d5b-ec63-5adf-8713-9cc247957175')
    ).toBe(false);
  });
});

describe('isSuperAdmin', () => {
  it('returns true when a user is a super admin', () => {
    const superAdmin = makeUser({
      roles: [{ type: 'admin' }],
      highest_role: 'super_admin',
    });
    expect(isSuperAdmin(superAdmin)).toBe(true);
  });

  it('returns false when a user is not an admin', () => {
    const regularUser = makeUser();
    expect(isSuperAdmin(regularUser)).toBe(false);
  });
});
