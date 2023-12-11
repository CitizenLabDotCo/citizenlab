import { randomString } from '../../../support/commands';
import moment = require('moment');

describe('Admin project participation method', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;
  let phaseId: string;

  before(() => {
    // Create active continuous project
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    })
      .then((project) => {
        projectId = project.body.data.id;
        return cy.apiCreatePhase({
          projectId,
          title: 'firstPhaseTitle',
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          endAt: moment().subtract(3, 'month').format('DD/MM/YYYY'),
          participationMethod: 'ideation',
          canPost: true,
          canComment: true,
          canReact: true,
        });
      })
      .then((phase) => {
        phaseId = phase.body.data.id;
      });
  });

  it('checks that participation method can be changed after creation except for native survey phases', () => {
    const phaseSetupPath = `admin/projects/${projectId}/phases/${phaseId}/setup`;

    cy.setAdminLoginCookie();
    cy.visit(phaseSetupPath);
    cy.acceptCookies();

    // Check that participation method warning is present
    cy.get('#e2e-participation-method-warning').should('exist');

    // Check that native survey radio is disabled
    cy.get('#participationmethod-native_survey')
      .siblings()
      .first()
      .should('have.class', 'disabled');

    // Information
    cy.get('#participationmethod-information').click({ force: true });
    cy.get('.e2e-submit-wrapper-button button').click();
    cy.visit(phaseSetupPath);
    cy.get('#participationmethod-information').should('be.checked');

    // Ideation
    cy.get('#participationmethod-ideation').click({ force: true });
    cy.get('.e2e-submit-wrapper-button button').click();
    cy.visit(phaseSetupPath);
    cy.get('#participationmethod-ideation').should('be.checked');

    // Poll
    cy.get('#participationmethod-poll').click({ force: true });
    cy.get('.e2e-submit-wrapper-button button').click();
    cy.visit(phaseSetupPath);
    cy.get('#participationmethod-poll').should('be.checked');

    // Budgeting
    cy.get('#participationmethod-voting').click({ force: true });
    cy.get('.e2e-submit-wrapper-button button').click();
    cy.visit(phaseSetupPath);
    cy.get('#participationmethod-voting').should('be.checked');

    // Volunteering
    cy.get('#participationmethod-volunteering').click({ force: true });
    cy.get('.e2e-submit-wrapper-button button').click();
    cy.visit(phaseSetupPath);
    cy.get('#participationmethod-volunteering').should('be.checked');

    // Native survey
    cy.get('#participationmethod-native_survey').click({ force: true });
    cy.get('.e2e-submit-wrapper-button button').click();
    cy.visit(phaseSetupPath);
    cy.get('#participationmethod-native_survey').should('not.exist');
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
