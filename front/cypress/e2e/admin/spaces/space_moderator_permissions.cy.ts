import { randomString, randomEmail } from '../../../support/commands';
import { createSpace } from '../../../support/spaces';

describe('Spae moderator: permissions', () => {
  const spaceName = randomString(10);
  const spaceModEmail = randomEmail();
  let spaceId: string;
  let folderId: string;
  // let projectId: string;

  before(() => {
    cy.apiSignup('Space', 'Moderator', spaceModEmail, 'password');

    createSpace({ title: spaceName }).then((response) => {
      spaceId = response.body.data.id;

      // TODO: create folder inside of space
      cy.apiCreateFolder({
        title: randomString(),
        description: randomString(),
      }).then((response) => {
        folderId = response.body.data.id;

        // TODO: create project inside of folder
      });
    });
  });
});
