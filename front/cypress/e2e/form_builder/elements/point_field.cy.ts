import { randomString } from '../../../support/commands';
import moment = require('moment');

describe('Form builder point field', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  const questionTitle = randomString();
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

  after(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
  });

  it('adds point field and tests validations', () => {
    cy.visit(
      `admin/projects/${projectId}/phases/${phaseId}/native-survey/edit`
    );
    cy.get('[data-cy="e2e-point-field"]').click();

    // Save the survey
    cy.get('form').submit();
    // Should show error if no title is entered
    cy.get('[data-testid="error-message"]').should('exist');

    cy.get('#e2e-title-multiloc').type(questionTitle, { force: true });
    // Set the field to required
    cy.get('#e2e-required-toggle').find('input').click({ force: true });

    cy.get('form').submit();
    // Should show success message on saving
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Confirm in front office that default map is shown if the map was never configured
    cy.visit(`/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`);
    cy.contains(questionTitle).should('exist');
    checkMapInputWorks();

    // Configure the map in the back office
    cy.visit(
      `admin/projects/${projectId}/phases/${phaseId}/native-survey/edit`
    );
    cy.contains(questionTitle).click();
    cy.get('[data-cy="e2e-configure-map-button"]').click();
    cy.get('[data-cy="e2e-web-map-upload-btn"]').click();
    cy.get('#e2e-portal-id-input')
      .click()
      .clear()
      .type('ce88f9dba8d748a4bf3aa8d6c8027d2e');
    cy.get('[data-cy="e2e-web-map-import-btn"]').click();
    cy.contains('Lava Flow Hazard Zones').should('exist');
    cy.get('form').submit();

    // Try filling in the survey
    cy.visit(`/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`);
    cy.acceptCookies();
    cy.contains(questionTitle).should('exist');
    cy.contains('Lava Flow Hazard Zones').should('exist');

    // Try going to the next page without entering data for required field
    cy.get('[data-cy="e2e-next-page"]').click();
    // verify that an error is shown and that we stay on the page
    cy.get('.e2e-error-message');
    cy.url().should(
      'eq',
      `${
        Cypress.config().baseUrl
      }/en/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`
    );

    // Enter an address by clicking on the map
    checkMapInputWorks();

    // Enter an address by typing an address
    cy.get('#e2e-location-input').type('Brussels');

    // Save survey response
    cy.get('[data-cy="e2e-next-page"]').click();
    cy.get('[data-cy="e2e-submit-form"]').should('exist');
    cy.get('[data-cy="e2e-submit-form"]').click();

    // Check that we show a success message
    cy.get('[data-cy="e2e-survey-success-message"]').should('exist');
    // close modal
    cy.get('.e2e-modal-close-button').click();
    // check that the modal is no longer on the page
    cy.get('#e2e-modal-container').should('have.length', 0);

    // Check results in back office
    cy.visit(`/admin/projects/${projectId}/phases/${phaseId}/native-survey`);
    cy.contains(questionTitle).should('exist');
    cy.contains('Lava Flow Hazard Zones').should('exist'); // Check loading the correct map config
    cy.contains('Responses').should('exist');
  });
});

const checkMapInputWorks = () => {
  const initialAddressValue = cy.get('#e2e-location-input').invoke('val');
  cy.get('#e2e-point-control-map').should('exist');
  cy.get('#e2e-point-control-map').click('center');
  cy.get('#e2e-location-input')
    .invoke('val')
    .should('not.eq', initialAddressValue);
};
