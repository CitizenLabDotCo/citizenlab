import { snakeCase } from 'lodash-es';
import { randomString } from '../../support/commands';
import moment = require('moment');

const waitForCustomFormFields = () => {
  cy.intercept('**/phases/**/custom_fields**').as('customFields');
  cy.wait('@customFields', { timeout: 10000 });
  cy.wait(1000);
};

describe('Survey Builder - Results and Data Management', () => {
  const phaseTitle = randomString();
  let questionTitle = randomString();
  const answer = randomString();
  let projectId: string;
  let projectSlug: string;
  let phaseId: string;

  beforeEach(() => {
    cy.setAdminLoginCookie();
    questionTitle = randomString();

    cy.createProjectWithNativeSurveyPhase({ phaseTitle }).then((result) => {
      projectId = result.projectId;
      projectSlug = result.projectSlug;
      phaseId = result.phaseId;
    });
  });

  afterEach(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
  });

  it('shows survey results for multiple choice and linear scale fields', () => {
    const chooseOneOption1 = randomString();
    const chooseOneOption2 = randomString();
    const chooseManyOption1 = randomString();
    const chooseManyOption2 = randomString();
    const multipleChoiceChooseOneTitle = 'multiplechoicechooseonefield';
    const multipleChoiceChooseManyTitle = 'multiplechoicechoosemultiplefield';
    const linearScaleTitle = 'linearscalefield';
    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`);
    waitForCustomFormFields();

    // Multiple choice choose one
    cy.addItemToFormBuilder('#toolbox_select');
    cy.get('#e2e-title-multiloc').type(multipleChoiceChooseOneTitle, {
      force: true,
    });
    cy.get('#e2e-option-input-0').type(chooseOneOption1, { force: true });
    cy.dataCy('e2e-add-answer').click();
    cy.get('#e2e-option-input-1').type(chooseOneOption2, { force: true });

    // Multiple choice choose multiple
    cy.addItemToFormBuilder('#toolbox_select');
    cy.get('#e2e-title-multiloc').type(multipleChoiceChooseManyTitle, {
      force: true,
    });
    cy.get('#e2e-option-input-0').type(chooseManyOption1, { force: true });
    cy.dataCy('e2e-add-answer').click();
    cy.get('#e2e-option-input-1').type(chooseManyOption2, { force: true });

    // Linear scale
    cy.addItemToFormBuilder('#toolbox_linear_scale');
    cy.get('#e2e-title-multiloc').type(linearScaleTitle, { force: true });

    // Save the survey
    cy.get('form').submit();
    // Should show success message on saving
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Navigate to the survey page
    cy.visit(`/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`);

    cy.contains(multipleChoiceChooseOneTitle).should('exist');
    cy.contains(multipleChoiceChooseManyTitle).should('exist');
    cy.contains(linearScaleTitle).should('exist');

    cy.contains(chooseOneOption1).should('exist');
    cy.contains(chooseOneOption2).should('exist');
    cy.contains(chooseManyOption1).should('exist');
    cy.contains(chooseManyOption2).should('exist');

    // Enter some data and save
    cy.contains(chooseOneOption1).click();
    cy.contains(chooseManyOption1).click({
      force: true,
    });
    cy.get(`#linear-scale-option-1`).click();
    cy.dataCy('e2e-submit-form').should('exist');

    cy.wait(1000);
    cy.dataCy('e2e-submit-form').click();
    cy.dataCy('e2e-page-number-1').should('exist');
    cy.dataCy('e2e-after-submission').should('exist');

    cy.visit(`/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`);
    cy.contains(chooseOneOption2).click();
    cy.contains(chooseManyOption1).click({
      force: true,
    });
    cy.get(`#linear-scale-option-3`).click();
    cy.dataCy('e2e-submit-form').should('exist');

    cy.wait(1000);
    cy.dataCy('e2e-submit-form').click();
    cy.dataCy('e2e-page-number-1').should('exist');
    cy.dataCy('e2e-after-submission').should('exist');

    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/insights`);
    cy.get(`[data-cy="e2e-${snakeCase(multipleChoiceChooseOneTitle)}"]`).should(
      'exist'
    );
    cy.get(
      `[data-cy="e2e-${snakeCase(multipleChoiceChooseManyTitle)}"]`
    ).should('exist');
    cy.get(`[data-cy="e2e-${snakeCase(linearScaleTitle)}"]`).should('exist');

    // Verify that when trying to edit the survey, a warning modal is now shown
    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/survey-form`);
    cy.get(`[data-cy="e2e-edit-survey-form"]`).click();
    cy.get(`[data-cy="e2e-edit-warning-modal"]`).should('exist');
    cy.get(`[data-cy="e2e-edit-warning-modal-continue"]`).click();
    cy.url().should('include', `/survey-form/edit`);
  });

  it('allows deleting survey results when user clicks the delete button', () => {
    const numberAnswer = '37';

    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`);
    waitForCustomFormFields();
    cy.addItemToFormBuilder('#toolbox_number');
    cy.get('#e2e-title-multiloc').type(questionTitle, { force: true });

    // Save the survey
    cy.get('form').submit();
    // Should show success message on saving
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Check that the user can access the settings to edit
    cy.contains(questionTitle).should('exist').click();
    cy.get('#e2e-title-multiloc').should('exist');

    // Navigate to the survey page
    cy.visit(`/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`);

    cy.contains(questionTitle).should('exist');

    cy.get(`*[id^="${questionTitle}"]:not([id$="-label"])`).type(numberAnswer, {
      force: true,
    });

    // Save survey response
    cy.dataCy('e2e-submit-form').should('exist');

    cy.wait(1000);
    cy.dataCy('e2e-submit-form').click();
    cy.dataCy('e2e-page-number-1').should('exist');
    cy.dataCy('e2e-after-submission').should('exist');

    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/insights`);

    // Click the delete button (now a standalone button, not in the dropdown)
    cy.dataCy('e2e-delete-survey-results').click();

    // Confirm deleting the results
    cy.dataCy('e2e-confirm-delete-survey-results').click();

    cy.dataCy('e2e-form-delete-results-notice').should('not.exist');
  });

  it('allows export of survey results', () => {
    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`);
    waitForCustomFormFields();
    cy.addItemToFormBuilder('#toolbox_multiline_text');
    cy.get('#e2e-title-multiloc').type(questionTitle, { force: true });

    // Save the survey
    cy.get('form').submit();
    // Should show success message on saving
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Check that the user can access the settings to edit
    cy.contains(questionTitle).should('exist').click();
    cy.get('#e2e-title-multiloc').should('exist');

    // Navigate to the survey page
    cy.visit(`/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`);

    cy.contains(questionTitle).should('exist');

    cy.get(`*[id^="${questionTitle}"]:not([id$="-label"])`).type(answer, {
      force: true,
    });

    // Save survey response
    cy.dataCy('e2e-submit-form').should('be.visible');

    cy.wait(1000);
    cy.dataCy('e2e-submit-form').click();
    cy.dataCy('e2e-page-number-1').should('be.visible');
    cy.dataCy('e2e-after-submission').should('be.visible');

    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/insights`);

    // Open the export dropdown
    cy.dataCy('e2e-survey-export-button').click();

    // Click button to export survey results
    cy.dataCy('e2e-download-survey-results').click();

    // Check that file is downloaded
    const downloadsFolder = Cypress.config('downloadsFolder');
    const fileName = `${snakeCase(phaseTitle)}_${moment().format(
      'YYYY-MM-DD'
    )}.xlsx`;
    cy.readFile(`${downloadsFolder}/${fileName}`).should('exist');

    // Delete the downloads folder and its contents
    cy.task('deleteFolder', downloadsFolder);
  });

  it('allows export of survey responses through the PII review modal', () => {
    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`);
    waitForCustomFormFields();
    cy.addItemToFormBuilder('#toolbox_multiline_text');
    cy.get('#e2e-title-multiloc').type(questionTitle, { force: true });

    // Save the survey
    cy.get('form').submit();
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Submit one response
    cy.visit(`/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`);
    cy.contains(questionTitle).should('exist');
    cy.get(`*[id^="${questionTitle}"]:not([id$="-label"])`).type(answer, {
      force: true,
    });
    cy.dataCy('e2e-submit-form').should('be.visible');
    cy.wait(1000);
    cy.dataCy('e2e-submit-form').click();
    cy.dataCy('e2e-after-submission').should('be.visible');

    cy.intercept('**/phases/**/input_response_fields').as('responseFields');
    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/insights`);

    // Open the modal-based Excel export
    cy.dataCy('e2e-survey-export-button').click();
    cy.dataCy('e2e-export-responses-xlsx').click();

    // The field review lists the export fields once the PII flags load (the
    // LLM is unavailable in CI, so the structural fallback flags the author
    // columns deterministically)
    cy.wait('@responseFields', { timeout: 20000 });
    cy.dataCy('e2e-field-redaction-list').should('be.visible');
    cy.dataCy('e2e-field-redaction-list')
      .contains(questionTitle)
      .should('exist');
    cy.dataCy('e2e-field-redaction-row-author_email')
      .contains('Excluded')
      .should('exist');

    // Generate is disabled until consent is given
    cy.dataCy('e2e-generate-export-button').should('be.disabled');
    cy.dataCy('e2e-export-consent-checkbox')
      .find('input[type="checkbox"]')
      .check({ force: true });
    cy.dataCy('e2e-generate-export-button').should('not.be.disabled').click();

    // Check that the file is downloaded
    const downloadsFolder = Cypress.config('downloadsFolder');
    const fileName = `${snakeCase(`input responses ${phaseTitle}`)}.xlsx`;
    cy.readFile(`${downloadsFolder}/${fileName}`, { timeout: 20000 }).should(
      'exist'
    );
    cy.task('deleteFolder', downloadsFolder);

    // The PDF flavour opens the same review with the cover settings and
    // preview (generation itself needs Gotenberg, which the e2e stack lacks)
    cy.dataCy('e2e-survey-export-button').click();
    cy.dataCy('e2e-export-responses-pdf').click();
    cy.contains('Cover settings').should('be.visible');
    cy.contains('Cover preview').should('be.visible');
    cy.dataCy('e2e-field-redaction-list').should('be.visible');
  });
});
