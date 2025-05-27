describe('Survey Form Tab Navigation', () => {
  let projectId: string;
  let projectSlug: string;
  let phaseId: string;

  before(() => {
    // Create project with native survey phase using the helper method
    cy.createProjectWithNativeSurveyPhase().then((result) => {
      projectId = result.projectId;
      projectSlug = result.projectSlug;
      phaseId = result.phaseId;
    });
  });

  beforeEach(() => {
    // Login as admin before running tests
    cy.setConsentAndAdminLoginCookies();
    // Visit the admin project phases page
    cy.visit(`/admin/projects/${projectId}/phases/${phaseId}/survey-form`);
  });

  it('should navigate to survey form tab and verify content loads', () => {
    // Verify the tab panel loaded by checking section title
    cy.dataCy('e2e-survey-form-title').should('be.visible');

    // Check that the edit button is visible
    cy.dataCy('e2e-edit-survey-form').should('be.visible');
  });

  it('should navigate to survey form builder page when clicking the edit button', () => {
    // Click the edit button
    cy.dataCy('e2e-edit-survey-form').click();

    // Verify we're on the survey form builder page
    cy.url().should(
      'include',
      `/admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`
    );

    // Verify the form builder content has loaded
    cy.dataCy('e2e-survey-form-builder').should('be.visible');
    cy.dataCy('e2e-form-builder-toolbox').should('be.visible');
    cy.dataCy('e2e-form-builder-top-bar').should('be.visible');
  });
});
