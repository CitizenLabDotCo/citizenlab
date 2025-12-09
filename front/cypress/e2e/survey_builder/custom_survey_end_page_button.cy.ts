import { createSurveyProject } from './utils';

describe('Survey page logic', () => {
  let projectId: string | undefined;
  let projectSlug: string | undefined;
  let phaseId: string | undefined;

  before(() => {
    createSurveyProject(cy).then((res: any) => {
      projectId = res.projectId;
      projectSlug = res.projectSlug;
      phaseId = res.phaseId;
    });
  });

  after(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  it('correctly uses default button on survey end page if not customized', () => {
    // Visit survey front office
    cy.visit(`/projects/${projectSlug}/surveys/new`);

    // Click next
    cy.contains('Submit').should('exist');
    cy.contains('Submit').click();
    // Check if we are on the survey end page
    cy.dataCy('e2e-after-submission').should('exist');
    // Check if the button text is correct
    cy.contains('Back to project').should('exist');
  });

  it('uses custom button link and text on survey end page if customized', () => {
    // Visit the form builder
    cy.visit(`/admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`);

    // For the survey end page, set a custom button link + label
    cy.dataCy('e2e-field-row').last().click();
    cy.contains('Description (optional)').should('be.visible');

    cy.get('#e2e-custom-button-toggle')
      .scrollIntoView()
      .should('be.visible')
      .click();

    cy.dataCy('e2e-custom-button-link').should('exist');
    cy.dataCy('e2e-custom-button-link').click().type('/events');

    cy.get('#e2e-custom-button-label').should('exist');
    cy.get('#e2e-custom-button-label').click().type('See events');

    // Save the survey
    cy.get('form').submit();

    cy.intercept('GET', `/web_api/v1/phases/${phaseId}/custom_fields?**`).as(
      'getCustomFields'
    );

    // Visit survey front office
    cy.visit(`/projects/${projectSlug}/surveys/new`);

    cy.wait('@getCustomFields', { timeout: 10000 });
    cy.contains('Your question').should('exist');

    // Click next
    cy.dataCy('e2e-submit-form').should('exist');
    cy.dataCy('e2e-submit-form').click();

    cy.wait(500);

    // Check if we are on the survey end page
    cy.dataCy('e2e-after-submission').should('exist');
    // Check if the button text + link is the custom one we set up
    cy.contains('See events').should('exist');
    cy.dataCy('e2e-after-submission').click();
    cy.url().should('include', '/events');
  });
});
