import { canModerateProject } from './projectPermissions';
import { makeUser } from 'api/users/__mocks__/useUsers';
import { project1 } from 'api/projects/__mocks__/_mockServer';

const folderId = '793ee057-3191-53ce-a862-5f97b5c03c8b';
project1.attributes.folder_id = folderId;

describe('canModerateProject', () => {
  describe('when a user is an admin', () => {
    it('returns true', () => {
      const user = makeUser({ roles: [{ type: 'admin' }] });
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
