import { randomString, randomEmail } from '../../../support/commands';
import {
  createModeratorForSpace,
  createSpace,
  removeSpace,
} from '../../../support/spaces';

describe('Spae moderator: permissions', () => {
  const spaceName = randomString(10);
  const spaceModEmail = randomEmail();
  const spaceModPassword = 'password';
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
            password: spaceModPassword,
            spaceId,
          });
        });
      });
    });
  });

  it('Can moderate space', () => {
    cy.setLoginCookie(spaceModEmail, spaceModPassword);
    cy.visit(`/admin/projects/spaces/${spaceId}/settings`);

    cy.get('input#spaceName').clear().type('New space name');
    cy.dataCy('space-name-save-button').click();
    cy.url().should('match', /\/admin\/projects\/spaces\/[a-zA-Z0-9]+/);
    cy.get('.e2e-resource-header')
      .find('h1')
      .should('have.text', 'New space name');
  });

  it('Can moderate folder in space', () => {
    cy.setLoginCookie(spaceModEmail, spaceModPassword);
    cy.visit(`/admin/projects/folders/${folderId}/settings`);

    cy.get('input#project-folder-title').clear().type('New folder name');
    cy.get('.e2e-submit-wrapper-button > button').click();
    cy.get('.e2e-submit-wrapper-button').contains('Success!');
    cy.reload();
    cy.get('.e2e-resource-header')
      .find('h1')
      .should('have.text', 'New folder name');
  });

  after(() => {
    cy.apiRemoveProject(projectId);
    cy.apiRemoveFolder(folderId);
    removeSpace(spaceId);
  });
});
