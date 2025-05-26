import { createSurveyProject } from './utils';

describe('Survey logic conflict', () => {
  let projectId: string | undefined;
  let projectSlug: string | undefined;
  let phaseId: string | undefined;

  beforeEach(() => {
    // Defensive cleanup in case a previous test left a project behind
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
    createSurveyProject(cy).then((res: any) => {
      projectId = res.projectId;
      projectSlug = res.projectSlug;
      phaseId = res.phaseId;
    });
  });

  after(() => {
    // Clean up after the test
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
  });

  it('prioritizes question logic over page logic', () => {
    cy.setAdminLoginCookie();
    cy.visit(`/admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`);
    cy.dataCy('e2e-field-row').should('have.length', 3);

    // Add a new page
    cy.wait(1000);
    cy.dataCy('e2e-page').click();
    cy.dataCy('e2e-field-row').should('have.length', 4);

    // Add another page
    cy.wait(1000);
    cy.dataCy('e2e-page').click();
    cy.dataCy('e2e-field-row').should('have.length', 5);

    // Save
    // TODO: this should not be necessary, but it is because of a bug
    // where we can't change survey logic until we save the survey
    // See https://www.notion.so/govocal/Cannot-add-survey-logic-sometimes-1929663b7b268020a8b4c9fb6912269a
    cy.get('form').submit();
    // Make sure we see "Survey successfully saved" message
    cy.get('[data-testid="feedbackSuccessMessage"]');

    // Point first page to third page
    cy.dataCy('e2e-field-row').first().click();
    cy.dataCy('e2e-form-builder-logic-tab').click();
    cy.dataCy('e2e-add-rule-button').click();
    cy.dataCy('e2e-rule-input-select').find('select').select('Page 3');

    // Open settings first question
    cy.dataCy('e2e-field-row').eq(1).click();
    cy.dataCy('e2e-form-builder-logic-tab').click();

    // Point first option to page 2
    cy.dataCy('e2e-add-rule-button').first().click();
    cy.dataCy('e2e-rule-input-select').first().find('select').select('Page 2');

    // Set no answer to go to survey end
    cy.dataCy('e2e-add-rule-button').eq(2).click();
    cy.dataCy('e2e-rule-input-select').eq(1).find('select').select('Ending');

    // Save again
    cy.get('form').submit();
    cy.get('[data-testid="feedbackSuccessMessage"]');

    // Take survey and make sure it works as expected
    cy.visit(`/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`);
    cy.acceptCookies();

    // Make sure submit button is shown
    cy.dataCy('e2e-submit-form');

    // Select first option
    cy.get('#e2e-single-select-control')
      .find('[data-testid="radio-container"]')
      .first()
      .click();

    // Go to next page
    cy.wait(1000);
    cy.dataCy('e2e-next-page').click();

    // Make sure we're on page 2
    cy.dataCy('e2e-page-number-2');

    // Go back, deselect option 1
    cy.wait(1000);
    cy.dataCy('e2e-previous-page').click();
    cy.dataCy('e2e-page-number-1');
    cy.wait(1000);
    cy.get('#e2e-single-select-control')
      .find('[data-testid="radio-container"]')
      .first()
      .click();

    // Make sure submit button is shown
    cy.dataCy('e2e-submit-form');
  });
});
