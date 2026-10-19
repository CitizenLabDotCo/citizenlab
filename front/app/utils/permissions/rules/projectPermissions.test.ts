import { project1 } from 'api/projects/__mocks__/_mockServer';
import { makeAdmin, makeUser } from 'api/users/__mocks__/useUsers';

import { canModerateProject, canReorderProject } from './projectPermissions';

const folderId = '793ee057-3191-53ce-a862-5f97b5c03c8b';
project1.attributes.folder_id = folderId;

describe('canModerateProject', () => {
  describe('when a user is an admin', () => {
    it('returns true', () => {
      const user = makeUser({
        roles: [{ type: 'admin' }],
        highest_role: 'admin',
      });
      expect(canModerateProject(project1, user)).toBe(true);
    });
  });

  describe('when a user is a project folder moderator', () => {
    it('returns true when the project is in a folder the user moderates', () => {
      const user = makeUser({
        roles: [
          { type: 'project_folder_moderator', project_folder_id: folderId },
        ],
      });
      expect(canModerateProject(project1, user)).toBe(true);
    });

    it('returns false when the project is in a folder the user does not moderate', () => {
      const user = makeUser({
        roles: [
          {
            type: 'project_folder_moderator',
            project_folder_id: folderId,
          },
        ],
      });
      project1.attributes.folder_id = 'differentFolderId';

      expect(canModerateProject(project1, user)).toBe(false);
    });

    it('returns false when the project does not have a folder', () => {
      const user = makeUser({
        roles: [
          { type: 'project_folder_moderator', project_folder_id: folderId },
        ],
      });
      project1.attributes.folder_id = null;
      expect(canModerateProject(project1, user)).toBe(false);
    });
  });

  describe('when a user is a project moderator', () => {
    it('returns true when the project is moderated by the user', () => {
      const user = makeUser({
        roles: [{ type: 'project_moderator', project_id: project1.id }],
      });
      expect(canModerateProject(project1, user)).toBe(true);
    });

    it('returns false when the project is not moderated by the user', () => {
      const user = makeUser({
        roles: [
          { type: 'project_moderator', project_id: 'differentProjectId' },
        ],
      });
      expect(canModerateProject(project1, user)).toBe(false);
    });
  });

  describe('when a user is not an admin, project folder moderator, or project moderator', () => {
    it('returns false', () => {
      const user = makeUser();
      expect(canModerateProject(project1, user)).toBe(false);
    });
  });
});

describe('canReorderProject', () => {
  const spaceManager = makeUser({
    roles: [{ type: 'space_moderator', space_id: 'space' }],
  });
  const folderManager = makeUser({
    roles: [{ type: 'project_folder_moderator', project_folder_id: 'folder' }],
  });

  it('lets admins move any project', () => {
    expect(canReorderProject(makeAdmin(), {})).toBe(true);
    expect(canReorderProject(makeAdmin(), { folderId: 'folder' })).toBe(true);
  });

  it('lets space managers move the top projects of their space', () => {
    expect(canReorderProject(spaceManager, { spaceId: 'space' })).toBe(true);
    expect(canReorderProject(spaceManager, { spaceId: 'other' })).toBe(false);
    expect(canReorderProject(spaceManager, {})).toBe(false);
  });

  it('lets whoever moderates a folder move its projects', () => {
    expect(canReorderProject(folderManager, { folderId: 'folder' })).toBe(true);
    expect(
      canReorderProject(spaceManager, { folderId: 'folder', spaceId: 'space' })
    ).toBe(true);
    expect(canReorderProject(folderManager, { folderId: 'other' })).toBe(false);
  });

  it("doesn't let folder managers move projects at the top", () => {
    expect(canReorderProject(folderManager, { spaceId: 'space' })).toBe(false);
  });
});
