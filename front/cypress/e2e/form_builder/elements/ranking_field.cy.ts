import { randomString } from '../../../support/commands';
import moment = require('moment');

describe('Form builder ranking component', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;
  let projectSlug: string;
  let phaseId: string;

  beforeEach(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }

    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    })
      .then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;
        return cy.apiCreatePhase({
          projectId,
          title: 'firstPhaseTitle',
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          participationMethod: 'native_survey',
          nativeSurveyButtonMultiloc: { en: 'Take the survey' },
          nativeSurveyTitleMultiloc: { en: 'Survey' },
          canPost: true,
          canComment: true,
          canReact: true,
        });
      })
      .then((phase) => {
        phaseId = phase.body.data.id;
      });

    cy.setAdminLoginCookie();
  });

  it('adds ranking field and is displayed when filling survey', () => {
    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`);
    cy.dataCy('e2e-ranking');
    cy.wait(2000);
    cy.dataCy('e2e-ranking').click();
    cy.get('#e2e-title-multiloc').type('Question title 2', { force: true });
    cy.get('#e2e-option-input-0').type('Option 1 question 2', { force: true });

    // Set the field to required
    cy.get('#e2e-required-toggle').find('input').click({ force: true });

    cy.get('form').submit();

    // Visit the survey front office
    cy.visit(`/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`);
    cy.acceptCookies();

    // Verify that the ranking question is displayed
    cy.contains('Question title 2').should('exist');
    cy.contains('Option 1 question 2').should('exist');
    cy.get('#e2e-ranking-control').should('exist');

    // Try going to the next page without filling in the survey
    cy.dataCy('e2e-submit-form').click();

    // verify that an error is shown and that we stay on the page
    cy.get('.e2e-error-message').should('exist');
    cy.url().should(
      'eq',
      `${
        Cypress.config().baseUrl
      }/en/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`
    );
  });

  after(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
  });
});
