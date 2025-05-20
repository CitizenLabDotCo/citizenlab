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
    cy.visit(`/admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`);
    cy.get('[data-cy="e2e-field-row"]').should('have.length', 3);

    // Make sure first page references "Ending"
    cy.get('[data-cy="e2e-field-row"]')
      .first()
      .find('[data-cy="e2e-field-rule-display"]')
      .contains('Ending');

    // Add a new page
    cy.wait(1000);
    cy.get('[data-cy="e2e-page"').click();
    cy.get('[data-cy="e2e-field-row"]').should('have.length', 4);
  });

  it('correctly adds new page', () => {
    // Make sure first page references "Page 2"
    cy.get('[data-cy="e2e-field-row"]')
      .first()
      .find('[data-cy="e2e-field-rule-display"]')
      .contains('Page 2');

    // Make sure second page references "Ending"
    cy.get('[data-cy="e2e-field-row"]')
      .eq(2) // eq(1) is the question on the first page
      .find('[data-cy="e2e-field-rule-display"]')
      .contains('Ending');
  });

  it('correctly updates page logic when removing pages', () => {
    // Create another age
    cy.wait(1000);
    cy.get('[data-cy="e2e-page"').click();

    // Make sure first page references page 2
    cy.get('[data-cy="e2e-field-row"]')
      .first()
      .find('[data-cy="e2e-field-rule-display"]')
      .contains('Page 2');

    // Point first page to third page
    cy.get('[data-cy="e2e-field-row"]').first().click();
    cy.get('[data-cy="e2e-form-builder-logic-tab"]').click();
    cy.get('[data-cy="e2e-add-rule-button"]').click();
    cy.get('[data-cy="e2e-rule-input-select"]').find('select').select('Page 3');

    // Confirm first page references third page
    cy.get('[data-cy="e2e-field-row"]')
      .first()
      .find('[data-cy="e2e-field-rule-display"]')
      .contains('Page 3');

    // Delete third page
    cy.get('[data-cy="e2e-more-field-actions"').first().click();
    cy.get('.e2e-more-actions-list').find('button').first().click();

    // Make sure first page now references page 2 again
    cy.get('[data-cy="e2e-field-row"]')
      .first()
      .find('[data-cy="e2e-field-rule-display"]')
      .contains('Page 2');
  });

  it('works when filling out survey', () => {
    // Point first page to ending
    cy.get('[data-cy="e2e-field-row"]').first().click();
    cy.get('[data-cy="e2e-form-builder-logic-tab"]').click();
    cy.get('[data-cy="e2e-add-rule-button"]').click();
    cy.get('[data-cy="e2e-rule-input-select"]').find('select').select('Ending');

    // Save
    cy.get('form').submit();
    // Make sure we see "Survey successfully saved" message
    cy.get('[data-testid="feedbackSuccessMessage"]');

    // Go to survey
    cy.visit(`/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`);
    cy.acceptCookies();

    // Expect submit button to be there, proving that page 1 goes straight to the end
    // of the survey (and not to page 2)
    cy.get('[data-cy="e2e-submit-form"]').click();

    // Expect to be on success page and return to project
    cy.get('[data-cy="e2e-after-submission"]').click();
    cy.location('pathname').should('eq', `/en/projects/${projectSlug}`);
  });
});
