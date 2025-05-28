import { randomString } from '../../../support/commands';

describe('Form builder point field', () => {
  const questionTitle = randomString();
  let projectId: string;
  let projectSlug: string;
  let phaseId: string;

  beforeEach(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }

    cy.createProjectWithNativeSurveyPhase().then((result) => {
      projectId = result.projectId;
      projectSlug = result.projectSlug;
      phaseId = result.phaseId;
    });

    cy.setAdminLoginCookie();
  });

  after(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
  });

  it('adds point field and tests validations', () => {
    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`);
    cy.dataCy('e2e-point-field');
    cy.wait(2000);
    cy.dataCy('e2e-point-field').click();

    // Save the survey
    cy.get('form').submit();
    // Should show error if no title is entered
    cy.get('[data-testid="error-message"]').should('exist');

    cy.get('#e2e-title-multiloc').type(questionTitle, {
      force: true,
      delay: 0,
    });
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
    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`);
    cy.contains(questionTitle).click();
    cy.dataCy('e2e-configure-map-button').click();
    cy.dataCy('e2e-web-map-upload-btn').click();
    cy.get('#e2e-portal-id-input')
      .click()
      .clear()
      .type('ce88f9dba8d748a4bf3aa8d6c8027d2e');
    cy.dataCy('e2e-web-map-import-btn').click();
    cy.contains('Lava Flow Hazard Zones').should('exist');
    cy.get('form').submit();

    // Try filling in the survey
    cy.visit(`/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`);
    cy.acceptCookies();
    cy.contains(questionTitle).should('exist');
    cy.contains('Lava Flow Hazard Zones').should('exist');

    // Try submitting without entering data for required field
    cy.dataCy('e2e-submit-form').click();

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
    cy.get('#e2e-location-input').type('Brussels', { delay: 0 });

    // Save survey response
    cy.dataCy('e2e-submit-form').should('exist');
    cy.dataCy('e2e-submit-form').click();

    // Check that we're on final page and return to project
    cy.dataCy('e2e-after-submission').should('exist');
    cy.dataCy('e2e-after-submission').click();

    // Make sure we're back at the project
    cy.url().should('include', `projects/${projectSlug}`);

    // Check results in back office
    cy.visit(`/admin/projects/${projectId}/phases/${phaseId}/results`);
    cy.contains(questionTitle).should('exist');
    // Open the legend and check the correct data is shown
    cy.get(
      '.esri-ui-bottom-right > .esri-component > .esri-expand__container'
    ).click();
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
