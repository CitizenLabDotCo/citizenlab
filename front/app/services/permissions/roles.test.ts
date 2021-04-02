import {
  isAdmin,
  isModerator,
  isProjectModerator,
  isSuperAdmin,
} from './roles';
import { makeUser } from 'services/__mocks__/users';

jest.mock('modules', () => ({ streamsToReset: [] }));

describe('isAdmin', () => {
  it('returns true when a user is an admin', () => {
    const admin = makeUser({ roles: [{ type: 'admin' }] });
    expect(isAdmin(admin)).toBeTruthy();
  });

  it('returns false when a user is not an admin', () => {
    const mortal = makeUser();
    expect(isAdmin(mortal)).toBeFalsy();
  });
});

describe('isModerator', () => {
  it('returns true when a user is a moderator', () => {
    const moderator = makeUser({
      roles: [
        {
          type: 'project_moderator',
          project_id: '793ee057-3191-53ce-a862-5f97b5c03c8b',
        },
      ],
    });
    expect(isModerator(moderator)).toBeTruthy();
  });

  it('returns false when a user is not a moderator', () => {
    const mortal = makeUser();
    expect(isModerator(mortal)).toBeFalsy();
  });
});

describe('isProjectModerator', () => {
  it('returns true when a user is a moderator for a specific project', () => {
    const projectId = '793ee057-3191-53ce-a862-5f97b5c03c8b';
    const moderator = makeUser({
      roles: [{ type: 'project_moderator', project_id: projectId }],
    });
    expect(isProjectModerator(moderator, projectId)).toBeTruthy();
  });

  it('returns false when a user is a moderator for a different project', () => {
    const projectId = '793ee057-3191-53ce-a862-5f97b5c03c8b';
    const moderator = makeUser({
      roles: [{ type: 'project_moderator', project_id: projectId }],
    });
    expect(
      isProjectModerator(moderator, '444add65-e122-51db-a1b9-80fcd2e3f635')
    ).toBeFalsy();
  });

  it('returns false when a user is not a moderator', () => {
    const mortal = makeUser();
    expect(
      isProjectModerator(mortal, 'df534d5b-ec63-5adf-8713-9cc247957175')
    ).toBeFalsy();
  });
});

describe('isSuperAdmin', () => {
  it('returns true when a user is a super admin', () => {
    const superAdmin = makeUser({
      roles: [{ type: 'admin' }],
      highest_role: 'super_admin',
    });
    expect(isSuperAdmin(superAdmin)).toBeTruthy();
  });

  it('returns false when a user is not an admin', () => {
    const mortal = makeUser();
    expect(isSuperAdmin(mortal)).toBeFalsy();
  });
});
