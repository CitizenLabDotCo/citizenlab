import {
  isAdmin,
  isRegularUser,
  isProjectModerator,
  isSuperAdmin,
} from './roles';
import { makeUser } from 'services/__mocks__/users';

describe('isAdmin', () => {
  it('returns true when a user is an admin', () => {
    const admin = makeUser({ roles: [{ type: 'admin' }] });
    expect(isAdmin(admin)).toBe(true);
  });

  it('returns false when a user is not an admin', () => {
    const regularUser = makeUser();
    expect(isAdmin(regularUser)).toBe(false);
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
