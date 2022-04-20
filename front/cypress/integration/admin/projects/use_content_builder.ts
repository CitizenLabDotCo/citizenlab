import { randomString } from '../../../support/commands';

const projectTitleEN = randomString();
const projectTitleNLBE = randomString();
const projectTitleNLNL = randomString();
const projectTitleFRBE = randomString();

describe('Admin: add project and edit description', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  it('creates a draft project', () => {
    cy.visit('/admin/projects/');
    cy.get('.e2e-create-project-expand-collapse-button').click();
    cy.wait(1000);
    cy.get('.e2e-create-project-tabs .last').click();
    cy.wait(1000);
    cy.get('.e2e-project-general-form');
    cy.get('.e2e-projecstatus-draft').click();

    // Random project titles for these required fields
    cy.get('#project-title').type(projectTitleEN);
    cy.get('.e2e-localeswitcher.nl-BE').click();
    cy.get('#project-title').type(projectTitleNLBE);
    cy.get('.e2e-localeswitcher.nl-NL').click();
    cy.get('#project-title').type(projectTitleNLNL);
    cy.get('.e2e-localeswitcher.fr-BE').click();
    cy.get('#project-title').type(projectTitleFRBE);

    // Submit project
    cy.get('.e2e-submit-wrapper-button').click();
    cy.wait(2000);
  });
  it('edits project description in content builder', () => {
    cy.url().then((url) => {
      const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);
      cy.visit(`${baseUrl}description`);
      cy.get('[id$=toggle-enable-content-builder]')
        .find('input')
        .click({ force: true });
      cy.get('*[class^="ContentBuilderToggle__StyledLink"]').click();

      // Drag and drop components into the page
      cy.get('#draggable-text').dragAndDrop('#content-builder-frame', {
        position: 'inside',
      });
    });
  });
  it('checks that live content is displayed properly', () => {
    // Save content
    cy.get('#contentBuilderTopBarSaveButton').click();

    // Navigate to live project page
    cy.get('[data-testid="goBackButton"] .button', {
      withinSubject: null,
    }).click();
    cy.get('#to-project').click();

    // Check builder content is displayed
    cy.contains(
      'This is some text. You can edit and format it by using the editor in the panel on the right.'
    ).should('be.visible');
  });
});
