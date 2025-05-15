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
    cy.get('[data-cy="e2e-survey-form-title"]').should('be.visible');

    // Check that the edit button is visible
    cy.get('[data-cy="e2e-edit-survey-form"]').should('be.visible');
  });

  it('should navigate to survey form builder page when clicking the edit button', () => {
    // Click the edit button
    cy.get('[data-cy="e2e-edit-survey-form"]').click();

    // Verify we're on the survey form builder page
    cy.url().should(
      'include',
      `/admin/projects/${projectId}/phases/${phaseId}/native-survey/edit`
    );

    // Verify the form builder content has loaded
    cy.get('[data-cy="e2e-survey-form-builder"]').should('exist');

    // Check for content of the form builder
    cy.get('[data-cy="e2e-form-builder-toolbox"]').should('be.visible');
    cy.get('[data-cy="e2e-form-builder-top-bar"]').should('be.visible');
  });
});
