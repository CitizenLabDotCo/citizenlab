import { randomString } from '../../../support/commands';

describe('Admin project participation method settings', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectIdContinuous: string;

  before(() => {
    // Create active continuous project
    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
      participationMethod: 'ideation',
    }).then((project) => {
      projectIdContinuous = project.body.data.id;
    });
  });

  it('checks that participation method can be changed after creation except for native survey projects/phases', () => {
    cy.setAdminLoginCookie();
    cy.visit(`admin/projects/${projectIdContinuous}`);

    // Check that participation method warning is present
    cy.get('#e2e-participation-method-warning').should('exist');

    // Check that native survey radio is disabled
    cy.get('#participationmethod-native_survey')
      .siblings()
      .first()
      .should('have.class', 'disabled');

    // Information
    cy.get('#participationmethod-information').click({ force: true });
    cy.get('.e2e-submit-wrapper-button').find('button').click();
    cy.visit(`admin/projects/${projectIdContinuous}`);
    cy.get('#participationmethod-information').should('be.checked');

    // Ideation
    cy.get('#participationmethod-ideation').click({ force: true });
    cy.get('.e2e-submit-wrapper-button').find('button').click();
    cy.visit(`admin/projects/${projectIdContinuous}`);
    cy.get('#participationmethod-ideation').should('be.checked');

    // Poll
    cy.get('#participationmethod-poll').click({ force: true });
    cy.get('.e2e-submit-wrapper-button').find('button').click();
    cy.visit(`admin/projects/${projectIdContinuous}`);
    cy.get('#participationmethod-poll').should('be.checked');

    // Budgeting
    cy.get('#participationmethod-voting').click({ force: true });
    cy.get('.e2e-submit-wrapper-button').find('button').click();
    cy.visit(`admin/projects/${projectIdContinuous}`);
    cy.get('#participationmethod-voting').should('be.checked');

    // Volunteering
    cy.get('#participationmethod-volunteering').click({ force: true });
    cy.get('.e2e-submit-wrapper-button').find('button').click();
    cy.visit(`admin/projects/${projectIdContinuous}`);
    cy.get('#participationmethod-volunteering').should('be.checked');

    // Native survey
    cy.get('#participationmethod-native_survey').click({ force: true });
    cy.get('.e2e-submit-wrapper-button').find('button').click();
    cy.visit(`admin/projects/${projectIdContinuous}`);
    cy.get('#participationmethod-native_survey').should('not.exist');
  });

  after(() => {
    cy.apiRemoveProject(projectIdContinuous);
  });
});
