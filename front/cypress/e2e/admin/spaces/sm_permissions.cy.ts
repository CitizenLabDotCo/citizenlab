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

  it('Can moderate project in space', () => {
    cy.setLoginCookie(spaceModEmail, spaceModPassword);
    cy.visit(`/admin/projects/${projectId}/general`);

    cy.get('#e2e-project-title-setting-field').clear().type('New project name');
    cy.get('.e2e-submit-wrapper-button > button').click();
    cy.get('.e2e-submit-wrapper-button').contains('Success!');
    cy.reload();
    cy.dataCy('e2e-project-title-preview-link-to-settings').contains(
      'New project name'
    );
  });

  it.only('Can create folder in space', () => {
    cy.setLoginCookie(spaceModEmail, spaceModPassword);
    cy.visit('/admin/projects/folders/new');

    const folderName = randomString();
    const folderDescription = randomString();

    // Add title
    cy.dataCy('e2e-project-folder-title')
      .find('.e2e-localeswitcher')
      .each((button) => {
        cy.wrap(button).click();
        cy.get('#project-folder-title').type(folderName);
        cy.wait(300);
      });

    // Add folder description
    cy.dataCy('e2e-project-folder-description')
      .find('.e2e-localeswitcher')
      .each((button) => {
        cy.wrap(button).click();
        cy.dataCy('e2e-project-folder-description').within(() => {
          cy.get('#description').type(folderDescription);
          cy.wait(300);
        });
      });

    // Add folder short description
    cy.dataCy('e2e-project-folder-short-description')
      .find('.e2e-localeswitcher')
      .each((button) => {
        cy.wrap(button).click();
        cy.wait(300);
        cy.dataCy('e2e-project-folder-short-description').within(() => {
          cy.get('textarea').type(folderDescription);
          cy.wait(300);
        });
      });

    // Select space
    cy.dataCy('space-select').select(spaceId);

    // Submit
    cy.get('.e2e-submit-wrapper-button button').click({ force: true });

    // Confirm  we got redirected to folder page
    cy.get('.e2e-resource-header').should('be.visible');
    cy.get('.e2e-resource-header').contains(folderName);

    // Confirm folder is in space
    cy.get('.intercom-admin-tab-settings').first().click();
    cy.dataCy('space-select').should('have.value', spaceId);
  });

  // it('Can create project in space', () => {
  //   // TODO
  // });

  // it('Can create project in folder in space', () => {
  //   // TODO
  // });

  // it('Can create project in root', () => {
  //   // TODO
  // });

  after(() => {
    cy.apiRemoveProject(projectId);
    cy.apiRemoveFolder(folderId);
    removeSpace(spaceId);
  });
});
