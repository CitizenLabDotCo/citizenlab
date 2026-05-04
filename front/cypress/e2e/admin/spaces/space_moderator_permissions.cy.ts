import { randomString, randomEmail } from '../../../support/commands';
import { createModeratorForSpace, createSpace } from '../../../support/spaces';

describe('Spae moderator: permissions', () => {
  const spaceName = randomString(10);
  const spaceModEmail = randomEmail();
  let spaceId: string;
  let folderId: string;
  let projectId: string;

  before(() => {
    createSpace({ title: spaceName }).then((response) => {
      spaceId = response.body.data.id;

      cy.apiCreateFolder({
        title: randomString(),
        description: randomString(),
        spaceId,
      }).then((response) => {
        folderId = response.body.data.id;

        cy.apiCreateProject({
          title: randomString(),
          description: randomString(),
          publicationStatus: 'published',
          folderId,
        }).then((response) => {
          projectId = response.body.data.id;

          createModeratorForSpace({
            firstName: 'Space',
            lastName: 'Moderator',
            email: spaceModEmail,
            password: 'password',
            spaceId,
          });
        });
      });
    });
  });
});
