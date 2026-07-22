import { makeUser, makeAdmin } from 'api/users/__mocks__/useUsers';

import {
  userModeratesFolder,
  userModeratesSpace,
  isProjectFolderModerator,
} from './projectFolderPermissions';

describe('isProjectFolderModerator', () => {
  it('returns true when a user is project folder moderator', () => {
    const user = makeUser({
      roles: [{ type: 'project_folder_moderator' }],
    });
    expect(isProjectFolderModerator(user)).toBeTruthy();
  });

  it('returns false when a user is not a project folder moderator', () => {
    const user = makeUser();
    expect(isProjectFolderModerator(user)).toBeFalsy();
  });
});

describe('userModeratesFolder', () => {
  it('returns true when a user is a moderator for a specific folder', () => {
    const folderId = '793ee057-3191-53ce-a862-5f97b5c03c8b';
    const moderator = makeUser({
      roles: [
        { type: 'project_folder_moderator', project_folder_id: folderId },
      ],
    });
    expect(userModeratesFolder(moderator, folderId)).toBeTruthy();
  });

  it('returns false when a user is a moderator for a different project', () => {
    const folderId = '793ee057-3191-53ce-a862-5f97b5c03c8b';
    const moderator = makeUser({
      roles: [
        { type: 'project_folder_moderator', project_folder_id: folderId },
      ],
    });
    expect(
      userModeratesFolder(moderator, '444add65-e122-51db-a1b9-80fcd2e3f635')
    ).toBeFalsy();
  });

  it('returns false when a user is not a moderator', () => {
    const user = makeUser();
    expect(
      userModeratesFolder(user, 'df534d5b-ec63-5adf-8713-9cc247957175')
    ).toBeFalsy();
  });

  it("returns true for a moderator of the folder's space", () => {
    const spaceId = 'c9575fd8-2341-5f8d-b1f1-1e73a9c209b2';
    const user = makeUser({
      roles: [{ type: 'space_moderator', space_id: spaceId }],
    });
    expect(
      userModeratesFolder(user, '793ee057-3191-53ce-a862-5f97b5c03c8b', spaceId)
    ).toBe(true);
  });

  it('returns false for a moderator of a different space', () => {
    const user = makeUser({
      roles: [{ type: 'space_moderator', space_id: 'some-other-space' }],
    });
    expect(
      userModeratesFolder(
        user,
        '793ee057-3191-53ce-a862-5f97b5c03c8b',
        'c9575fd8-2341-5f8d-b1f1-1e73a9c209b2'
      )
    ).toBe(false);
  });

  // Regression guard: a missing folder id must fail closed, not fall through
  // to the "moderates any folder" role check.
  it('returns false when folderId is undefined, even for a moderator of some folder', () => {
    const user = makeUser({
      roles: [
        {
          type: 'project_folder_moderator',
          project_folder_id: '793ee057-3191-53ce-a862-5f97b5c03c8b',
        },
      ],
    });
    expect(userModeratesFolder(user, undefined)).toBe(false);
  });

  it('returns false when folderId is null, even for an admin', () => {
    expect(userModeratesFolder(makeAdmin(), null)).toBe(false);
  });
});

describe('userModeratesSpace', () => {
  const spaceId = 'c9575fd8-2341-5f8d-b1f1-1e73a9c209b2';

  it('returns true for a moderator of that space', () => {
    const user = makeUser({
      roles: [{ type: 'space_moderator', space_id: spaceId }],
    });
    expect(userModeratesSpace(user, spaceId)).toBe(true);
  });

  it('returns false for a moderator of a different space', () => {
    const user = makeUser({
      roles: [{ type: 'space_moderator', space_id: 'some-other-space' }],
    });
    expect(userModeratesSpace(user, spaceId)).toBe(false);
  });

  it('returns true for an admin', () => {
    expect(userModeratesSpace(makeAdmin(), spaceId)).toBe(true);
  });

  // Regression guard: a missing space id must fail closed, not fall through
  // to the "moderates any space" role check.
  it('returns false when spaceId is undefined, even for a space moderator', () => {
    const user = makeUser({
      roles: [{ type: 'space_moderator', space_id: spaceId }],
    });
    expect(userModeratesSpace(user, undefined)).toBe(false);
  });

  it('returns false when spaceId is null, even for an admin', () => {
    expect(userModeratesSpace(makeAdmin(), null)).toBe(false);
  });
});
