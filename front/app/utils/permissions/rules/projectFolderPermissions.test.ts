import { makeUser } from 'api/users/__mocks__/useUsers';

import {
  userModeratesFolder,
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
});
