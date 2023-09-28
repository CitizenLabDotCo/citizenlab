import { snakeCase } from 'lodash-es';
import { randomString, randomEmail } from '../../support/commands';
import moment = require('moment');

describe('Survey builder', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  let questionTitle = randomString();
  const answer = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;
  let projectSlug: string;

  beforeEach(() => {
    cy.setAdminLoginCookie();
    questionTitle = randomString();

    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
      participationMethod: 'native_survey',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;
    });
  });

  afterEach(() => {
    cy.apiRemoveProject(projectId);
  });

  it('can create survey, save survey and user can respond to survey', () => {
    cy.visit(`admin/projects/${projectId}/native-survey`);
    cy.get('[data-cy="e2e-edit-survey-content"]').click();
    cy.get('[data-cy="e2e-short-answer"]').click();

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

    // Try filling in the survey
    cy.visit(`/projects/${projectSlug}/ideas/new`);
    cy.acceptCookies();
    cy.contains(questionTitle).should('exist');

    // Try going to the next page without filling in the survey
    cy.get('[data-cy="e2e-next-page"]').click();

    // verify that an error is shown and that we stay on the page
    cy.get('.e2e-error-message');
    cy.location('pathname').should(
      'eq',
      `/en/projects/${projectSlug}/ideas/new`
    );

    cy.get(`#properties${questionTitle}`).type(answer, { force: true });

    // Go to the next page
    cy.get('[data-cy="e2e-next-page"]').click();

    // Save survey response
    cy.get('[data-cy="e2e-submit-form"]').should('exist');
    cy.get('[data-cy="e2e-submit-form"]').click();

    // Check that we show a success message
    cy.get('[data-cy="e2e-survey-success-message"]').should('exist');
    // close modal
    cy.get('.e2e-modal-close-button').click();
    // check that the modal is no longer on the page
    cy.get('#e2e-modal-container').should('have.length', 0);
  });

  it('can create survey, save survey and admin can click button in survey page to navigate to the survey builder', () => {
    cy.visit(`admin/projects/${projectId}/native-survey`);
    cy.get('[data-cy="e2e-edit-survey-content"]').click();
    cy.get('[data-cy="e2e-short-answer"]').click();

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

    // Navigate to the survey
    cy.visit(`/projects/${projectSlug}/ideas/new`);
    cy.acceptCookies();

    cy.get('[data-cy="e2e-edit-survey-link"]').click();
    cy.location('pathname').should(
      'eq',
      `/en/admin/projects/${projectId}/native-survey/edit`
    );
  });

  it('deletes a field when the delete button is clicked', () => {
    cy.visit(`admin/projects/${projectId}/native-survey/edit`);
    cy.get('[data-cy="e2e-short-answer"]').click();
    cy.get('#e2e-title-multiloc').type(questionTitle, { force: true });

    // Save the survey
    cy.get('form').submit();
    // Should show success message on saving
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Navigate to the survey page
    cy.visit(`/projects/${projectSlug}/ideas/new`);
    cy.acceptCookies();
    cy.contains(questionTitle).should('exist');

    cy.visit(`admin/projects/${projectId}/native-survey/edit`);

    cy.contains(questionTitle).should('exist').click();

    // Click to delete the field
    cy.get(`[data-cy="e2e-delete-field"]`).click();

    // Save the survey
    cy.get('form').submit();

    // Check that field nolonger exists
    cy.get(`[data-cy="${`field-${questionTitle}`}"]`).should('not.exist');

    // Navigate to the survey page
    cy.visit(`/projects/${projectSlug}/ideas/new`);
    cy.contains(questionTitle).should('not.exist');
  });

  it('shows survey results for multiple choice and linear scale fields', () => {
    const chooseOneOption1 = randomString();
    const chooseOneOption2 = randomString();
    const chooseManyOption1 = randomString();
    const chooseManyOption2 = randomString();
    const multipleChoiceChooseOneTitle = 'multiplechoicechooseonefield';
    const multipleChoiceChooseManyTitle = 'multiplechoicechoosemultiplefield';
    const linearScaleTitle = 'linearscalefield';
    cy.visit(`admin/projects/${projectId}/native-survey/edit`);

    // Multiple choice choose one
    cy.get('[data-cy="e2e-single-choice"]').click();
    cy.get('#e2e-title-multiloc').type(multipleChoiceChooseOneTitle, {
      force: true,
    });
    cy.get('#e2e-option-input-0').type(chooseOneOption1, { force: true });
    cy.get('[data-cy="e2e-add-answer"]').click();
    cy.get('#e2e-option-input-1').type(chooseOneOption2, { force: true });

    // Multiple choice choose multiple
    cy.get('[data-cy="e2e-multiple-choice"]').click();
    cy.get('#e2e-title-multiloc').type(multipleChoiceChooseManyTitle, {
      force: true,
    });
    cy.get('#e2e-option-input-0').type(chooseManyOption1, { force: true });
    cy.get('[data-cy="e2e-add-answer"]').click();
    cy.get('#e2e-option-input-1').type(chooseManyOption2, { force: true });

    // Linear scale
    cy.get('[data-cy="e2e-linear-scale"]').click();
    cy.get('#e2e-title-multiloc').type(linearScaleTitle, { force: true });

    // Save the survey
    cy.get('form').submit();
    // Should show success message on saving
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Navigate to the survey page
    cy.visit(`/projects/${projectSlug}/ideas/new`);
    cy.acceptCookies();
    cy.contains(multipleChoiceChooseOneTitle).should('exist');
    cy.contains(multipleChoiceChooseManyTitle).should('exist');
    cy.contains(linearScaleTitle).should('exist');

    cy.contains(chooseOneOption1).should('exist');
    cy.contains(chooseOneOption2).should('exist');
    cy.contains(chooseManyOption1).should('exist');
    cy.contains(chooseManyOption2).should('exist');

    // Enter some data and save
    cy.contains(chooseOneOption1).click({ force: true });
    cy.contains(chooseManyOption1).click({
      force: true,
    });
    cy.get(`#linear-scale-option-1`).click({ force: true });
    cy.get('[data-cy="e2e-next-page"]').click();
    cy.get('[data-cy="e2e-submit-form"]').should('exist');
    cy.get('[data-cy="e2e-submit-form"]').click();
    cy.wait(1000);

    cy.visit(`/projects/${projectSlug}/ideas/new`);
    cy.contains(chooseOneOption2).click({ force: true });
    cy.contains(chooseManyOption2).click({
      force: true,
    });
    cy.get(`#linear-scale-option-1`).click({ force: true });
    cy.get('[data-cy="e2e-next-page"]').click();
    cy.get('[data-cy="e2e-submit-form"]').should('exist');
    cy.get('[data-cy="e2e-submit-form"]').click();
    cy.wait(1000);

    cy.visit(`/projects/${projectSlug}/ideas/new`);
    cy.contains(chooseOneOption2).click({ force: true });
    cy.contains(chooseManyOption2).click({
      force: true,
    });
    cy.get(`#linear-scale-option-1`).click({ force: true });
    cy.get('[data-cy="e2e-next-page"]').click();
    cy.get('[data-cy="e2e-submit-form"]').should('exist');
    cy.get('[data-cy="e2e-submit-form"]').click();
    cy.wait(1000);

    cy.visit(`admin/projects/${projectId}/native-survey/results`);
    cy.get(`[data-cy="e2e-${snakeCase(multipleChoiceChooseOneTitle)}"]`).should(
      'exist'
    );
    cy.get(
      `[data-cy="e2e-${snakeCase(multipleChoiceChooseManyTitle)}"]`
    ).should('exist');
    cy.get(`[data-cy="e2e-${snakeCase(linearScaleTitle)}"]`).should('exist');

    // Verify that when trying to edit the survey, a warning modal is now shown
    cy.visit(`admin/projects/${projectId}/native-survey`);
    cy.get(`[data-cy="e2e-edit-survey-content"]`).click();
    cy.get(`[data-cy="e2e-edit-warning-modal"]`).should('exist');
    cy.get(`[data-cy="e2e-edit-warning-modal-continue"]`).click();
    cy.url().should('include', `/native-survey/edit`);
  });

  it('navigates to live project in a new tab when view project button in content builder is clicked', () => {
    const projectUrl = `/en/projects/${projectSlug}/ideas/new`;

    cy.visit(`admin/projects/${projectId}/native-survey`);
    cy.get('[data-cy="e2e-edit-survey-content"]').click();
    cy.get('[data-cy="e2e-short-answer"]').click();
    cy.get('#e2e-title-multiloc').type(questionTitle, { force: true });
    cy.get('form').submit();

    cy.get('[data-cy="e2e-preview-form-button"] > a')
      .should(($a) => {
        expect($a.attr('href'), 'href').to.equal(projectUrl);
        expect($a.attr('target'), 'target').to.equal('_blank');
        $a.attr('target', '_self');
      })
      .click();
    cy.location('pathname').should('equal', projectUrl);
  });

  it('does not allow editing survey fields in builder when responses have started coming in', () => {
    cy.visit(`admin/projects/${projectId}/native-survey/edit`);
    cy.get('[data-cy="e2e-short-answer"]').click();
    cy.get('#e2e-title-multiloc').type(questionTitle, { force: true });

    // Save the survey
    cy.get('form').submit();
    // Should show success message on saving
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Check that the user can access the settings to edit
    cy.contains(questionTitle).should('exist').click();
    cy.get('#e2e-title-multiloc').should('exist');

    // Navigate to the survey page
    cy.visit(`/projects/${projectSlug}/ideas/new`);
    cy.acceptCookies();
    cy.contains(questionTitle).should('exist');

    cy.get(`#properties${questionTitle}`).type(answer, { force: true });

    cy.get('[data-cy="e2e-next-page"]').click();

    // Save survey response
    cy.get('[data-cy="e2e-submit-form"]').should('exist');
    cy.get('[data-cy="e2e-submit-form"]').click();

    cy.visit(`admin/projects/${projectId}/native-survey/edit`);

    // Check that the user cannot access the settings to edit
    cy.contains(questionTitle).should('exist').click();
    cy.get('#e2e-title-multiloc').should('not.exist');

    cy.get('[data-cy="e2e-form-delete-results-notice"]').should('exist');
    cy.get('[data-cy="e2e-delete-form-results-notice-link"]').click();

    cy.get('[data-cy="e2e-form-delete-results-notice"]').should('exist');
  });

  it('allows deleting survey results when user clicks the delete button', () => {
    cy.visit(`admin/projects/${projectId}/native-survey/edit`);
    cy.get('[data-cy="e2e-short-answer"]').click();
    cy.get('#e2e-title-multiloc').type(questionTitle, { force: true });

    // Save the survey
    cy.get('form').submit();
    // Should show success message on saving
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Check that the user can access the settings to edit
    cy.contains(questionTitle).should('exist').click();
    cy.get('#e2e-title-multiloc').should('exist');

    // Navigate to the survey page
    cy.visit(`/projects/${projectSlug}/ideas/new`);
    cy.acceptCookies();
    cy.contains(questionTitle).should('exist');

    cy.get(`#properties${questionTitle}`).type(answer, { force: true });

    cy.get('[data-cy="e2e-next-page"]').click();
    // Save survey response
    cy.get('[data-cy="e2e-submit-form"]').should('exist');
    cy.get('[data-cy="e2e-submit-form"]').click();

    cy.visit(`admin/projects/${projectId}/native-survey/edit`);

    // Check that the user cannot access the settings to edit
    cy.contains(questionTitle).should('exist').click();
    cy.get('#e2e-title-multiloc').should('not.exist');

    cy.get('[data-cy="e2e-form-delete-results-notice"]').should('exist');
    cy.get('[data-cy="e2e-delete-form-results-notice-link"]').click();

    // Click the delete button
    cy.get('[data-cy="e2e-delete-survey-results"]').click();

    // Confirm deleting the results
    cy.get('[data-cy="e2e-confirm-delete-survey-results"]').click();

    cy.get('[data-cy="e2e-form-delete-results-notice"]').should('not.exist');
  });

  it('allows export of survey results', () => {
    cy.visit(`admin/projects/${projectId}/native-survey/edit`);
    cy.get('[data-cy="e2e-short-answer"]').click();
    cy.get('#e2e-title-multiloc').type(questionTitle, { force: true });

    // Save the survey
    cy.get('form').submit();
    // Should show success message on saving
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Check that the user can access the settings to edit
    cy.contains(questionTitle).should('exist').click();
    cy.get('#e2e-title-multiloc').should('exist');

    // Navigate to the survey page
    cy.visit(`/projects/${projectSlug}/ideas/new`);
    cy.acceptCookies();
    cy.contains(questionTitle).should('exist');

    cy.get(`#properties${questionTitle}`).type(answer, { force: true });

    cy.get('[data-cy="e2e-next-page"]').click();
    // Save survey response
    cy.get('[data-cy="e2e-submit-form"]').should('exist');
    cy.get('[data-cy="e2e-submit-form"]').click();

    cy.visit(`admin/projects/${projectId}/native-survey/edit`);

    // Check that the user cannot access the settings to edit
    cy.contains(questionTitle).should('exist').click();
    cy.get('#e2e-title-multiloc').should('not.exist');

    cy.get('[data-cy="e2e-form-delete-results-notice"]').should('exist');
    cy.get('[data-cy="e2e-delete-form-results-notice-link"]').click();

    cy.get('[data-cy="e2e-form-delete-results-notice"]').should('exist');

    // Click the view survey results button
    cy.get('[data-cy="e2e-form-view-results"]').click();

    // Click button to export survey results
    cy.get('[data-cy="e2e-download-survey-results"]').click();

    const fileName = `${snakeCase(projectTitle)}_${moment().format(
      'YYYY-MM-DD'
    )}.xlsx`;

    // Check that file is downloaded
    const downloadsFolder = Cypress.config('downloadsFolder');
    cy.readFile(`${downloadsFolder}/${fileName}`).should('exist');

    // Delete the downloads folder and its contents
    cy.task('deleteFolder', downloadsFolder);
  });

  it('allows admins to fill in surveys as many times as they want when permissions are set to registered users', () => {
    cy.visit(`admin/projects/${projectId}/permissions`);
    cy.get('#e2e-granular-permissions').within(() => {
      cy.get('#e2e-permission-registered-users').click();
    });

    cy.visit(`admin/projects/${projectId}/native-survey`);
    cy.get('[data-cy="e2e-edit-survey-content"]').click();
    cy.get('[data-cy="e2e-short-answer"]').click();

    cy.get('#e2e-title-multiloc').type(questionTitle, { force: true });

    // Save the survey
    cy.get('form').submit();
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Take the survey
    cy.visit(`/projects/${projectSlug}`);
    cy.acceptCookies();
    cy.get('#e2e-cta-button')
      .find('button')
      .should('not.have.attr', 'disabled');
    cy.get('#e2e-cta-button').find('button').click({ force: true });
    cy.contains(questionTitle).should('exist');
    cy.get('[data-cy="e2e-next-page"]').click();
    cy.get('[data-cy="e2e-submit-form"]').click();

    // Take the survey again
    cy.visit(`/projects/${projectSlug}`);
    cy.get('#e2e-project-sidebar-surveys-count').should('exist');
    cy.get('#e2e-cta-button')
      .find('button')
      .should('not.have.attr', 'disabled');
    cy.get('#e2e-cta-button').find('button').click({ force: true });
    cy.contains(questionTitle).should('exist');
    cy.get('[data-cy="e2e-next-page"]').click();
    cy.get('[data-cy="e2e-submit-form"]').click();

    // Check that we show a success message
    cy.get('[data-cy="e2e-survey-success-message"]').should('exist');
    // close modal
    cy.get('.e2e-modal-close-button').click();
    // check that the modal is no longer on the page
    cy.get('#e2e-modal-container').should('have.length', 0);
  });

  it('creates survey with logic, saves survey and user can respond to survey and responses determine which page he sees based on set logic', () => {
    const chooseOneOption1 = randomString();
    const chooseOneOption2 = randomString();
    const question2Title = randomString();
    const question3Title = randomString();
    const page2Title = randomString();
    const page3Title = randomString();
    const multipleChoiceChooseOneTitle = 'multiplechoicechooseonefield';

    cy.visit(`admin/projects/${projectId}/native-survey`);
    cy.get('[data-cy="e2e-edit-survey-content"]').click();
    cy.get('[data-cy="e2e-short-answer"]').click();

    cy.get('#e2e-title-multiloc').type(questionTitle, { force: true });

    cy.get('[data-cy="e2e-single-choice"]').click();
    cy.get('#e2e-title-multiloc').type(multipleChoiceChooseOneTitle, {
      force: true,
    });
    cy.get('#e2e-option-input-0').type(chooseOneOption1, { force: true });
    cy.get('[data-cy="e2e-add-answer"]').click();
    cy.get('#e2e-option-input-1').type(chooseOneOption2, { force: true });

    // Add second page
    cy.get('[data-cy="e2e-page"]').click();
    cy.get('#e2e-field-group-title-multiloc').type(page2Title, { force: true });
    cy.get('[data-cy="e2e-short-answer"]').click();
    cy.get('#e2e-title-multiloc').type(question2Title, { force: true });

    // Add third page
    cy.get('[data-cy="e2e-page"]').click();
    cy.get('#e2e-field-group-title-multiloc').type(page3Title, { force: true });
    cy.get('[data-cy="e2e-short-answer"]').click();
    cy.get('#e2e-title-multiloc').type(question3Title, { force: true });

    // Add logic to the multiple choice question
    cy.contains(multipleChoiceChooseOneTitle).should('exist');
    cy.contains(multipleChoiceChooseOneTitle).click();
    cy.get('[data-cy="e2e-form-builder-logic-tab"]').click();
    cy.get('[data-cy="e2e-add-rule-button"]').first().click();
    cy.get('[data-cy="e2e-rule-input-select"]').should('exist');
    // Add rule to go to survey end
    cy.get('[data-cy="e2e-rule-input-select"]').get('select').select(4);
    // Add rule to go to page 3
    cy.get('[data-cy="e2e-add-rule-button"]').first().click();
    cy.get('[data-cy="e2e-rule-input-select"]').get('select').eq(1).select(3);

    // Check to see that the rules are added to the field row
    cy.get('[data-cy="e2e-field-rule-display"]')
      .contains(chooseOneOption1)
      .should('exist');
    cy.get('[data-cy="e2e-field-rule-display"]')
      .contains('Survey end')
      .should('exist');
    cy.get('[data-cy="e2e-field-rule-display"]')
      .contains(chooseOneOption2)
      .should('exist');
    cy.get('[data-cy="e2e-field-rule-display"]')
      .contains('Survey end')
      .should('exist');

    // Save the survey
    cy.get('form').submit();
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Try filling in the survey
    cy.visit(`/projects/${projectSlug}/ideas/new`);
    cy.acceptCookies();
    cy.contains(questionTitle).should('exist');

    // Select the first option and click next
    cy.contains(chooseOneOption1).click({ force: true });
    cy.get('[data-cy="e2e-next-page"]').click();

    // Check to see that the user is on the submit page
    cy.get('[data-cy="e2e-submit-form"]').should('exist');

    // Go back to the previous page
    cy.get('[data-cy="e2e-previous-page"]').click();

    // Select the second option and click next
    cy.contains(chooseOneOption2).click({ force: true });
    cy.get('[data-cy="e2e-next-page"]').click();

    // Check to see that the user is on the third page
    cy.contains(page3Title).should('exist');

    // Click next
    cy.get('[data-cy="e2e-next-page"]').click();

    // Save survey response
    cy.get('[data-cy="e2e-submit-form"]').should('exist');
    cy.get('[data-cy="e2e-submit-form"]').click();
    cy.get('[data-cy="e2e-survey-success-message"]').should('exist');
    cy.get('.e2e-modal-close-button').click();
    cy.get('#e2e-modal-container').should('have.length', 0);
  });

  it('does not allow non admin users to fill in a survey more than once when permissions are set to registered users', () => {
    const firstName = randomString();
    const lastName = randomString();
    const email = randomEmail();
    const password = randomString();

    cy.visit(`admin/projects/${projectId}/permissions`);
    cy.get('#e2e-granular-permissions').within(() => {
      cy.get('#e2e-permission-registered-users').click();
    });

    cy.visit(`admin/projects/${projectId}/native-survey`);
    cy.get('[data-cy="e2e-edit-survey-content"]').click();
    cy.get('[data-cy="e2e-short-answer"]').click();

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

    cy.visit(`admin/projects/${projectId}`);
    cy.logout();
    cy.apiSignup(firstName, lastName, email, password);
    cy.setLoginCookie(email, password);

    // Take the survey
    cy.visit(`/projects/${projectSlug}`);
    cy.acceptCookies();
    cy.get('#e2e-cta-button')
      .find('button')
      .should('not.have.attr', 'disabled');
    cy.get('#e2e-project-sidebar-surveys-count').should('exist');
    cy.get('#e2e-cta-button').find('button').click({ force: true });
    cy.contains(questionTitle).should('exist');
    cy.get(`#properties${questionTitle}`).type(answer, { force: true });

    // Save survey response
    cy.get('[data-cy="e2e-next-page"]').click();
    cy.get('[data-cy="e2e-submit-form"]').click();

    // Check that we show a success message
    cy.get('[data-cy="e2e-survey-success-message"]').should('exist');
    // close modal
    cy.get('.e2e-modal-close-button').click();
    // check that the modal is no longer on the page
    cy.get('#e2e-modal-container').should('have.length', 0);

    // Try filling in the survey again
    cy.visit(`/projects/${projectSlug}`);
    cy.get('#e2e-cta-button').find('button').should('have.attr', 'disabled');
    cy.get('#e2e-project-sidebar-surveys-count').should('exist');
  });

  it('shows validation errors when current page or previous pages are referenced', () => {
    const chooseOneOption1 = randomString();
    const chooseOneOption2 = randomString();
    const question2Title = randomString();
    const question3Title = randomString();
    const page2Title = randomString();
    const page3Title = randomString();
    const multipleChoiceChooseOneTitle = 'multiplechoicechooseonefield';

    cy.visit(`admin/projects/${projectId}/native-survey`);
    cy.get('[data-cy="e2e-edit-survey-content"]').click();
    cy.get('[data-cy="e2e-short-answer"]').click();

    cy.get('#e2e-title-multiloc').type(questionTitle, { force: true });

    // Add second page
    cy.get('[data-cy="e2e-page"]').click();
    cy.get('#e2e-field-group-title-multiloc').type(page2Title, { force: true });
    cy.get('[data-cy="e2e-short-answer"]').click();
    cy.get('#e2e-title-multiloc').type(question2Title, { force: true });

    // Add multiple choice question to the second page
    cy.get('[data-cy="e2e-single-choice"]').click();
    cy.get('#e2e-title-multiloc').type(multipleChoiceChooseOneTitle, {
      force: true,
    });
    cy.get('#e2e-option-input-0').type(chooseOneOption1, { force: true });
    cy.get('[data-cy="e2e-add-answer"]').click();
    cy.get('#e2e-option-input-1').type(chooseOneOption2, { force: true });

    // Add third page
    cy.get('[data-cy="e2e-page"]').click();
    cy.get('#e2e-field-group-title-multiloc').type(page3Title, { force: true });
    cy.get('[data-cy="e2e-short-answer"]').click();
    cy.get('#e2e-title-multiloc').type(question3Title, { force: true });

    // Add logic to the multiple choice question
    cy.contains(multipleChoiceChooseOneTitle).should('exist');
    cy.contains(multipleChoiceChooseOneTitle).click();
    cy.get('[data-cy="e2e-form-builder-logic-tab"]').click();
    cy.get('[data-cy="e2e-add-rule-button"]').first().click();
    cy.get('[data-cy="e2e-rule-input-select"]').should('exist');
    // Add rule to go to survey end
    cy.get('[data-cy="e2e-rule-input-select"]').get('select').select(4);
    // Add rule to go to page 1 which should show an error since it is the previous page
    cy.get('[data-cy="e2e-add-rule-button"]').first().click();
    cy.get('[data-cy="e2e-rule-input-select"]').get('select').eq(1).select(1);

    // Check to see that the rules are added to the field row
    cy.get('[data-cy="e2e-field-rule-display"]')
      .contains(chooseOneOption1)
      .should('exist');
    cy.get('[data-cy="e2e-field-rule-display"]')
      .contains('Survey end')
      .should('exist');
    cy.get('[data-cy="e2e-field-rule-display"]')
      .contains(chooseOneOption2)
      .should('exist');
    cy.get('[data-cy="e2e-field-rule-display"]')
      .contains('Survey end')
      .should('exist');

    // Check that an error message is shown
    cy.get('[data-testid="error-message"]').should('exist');
    cy.get('[data-cy="e2e-rule-input-error"]').should('exist');

    // Add a rule to go to page 2 which should not show an error since it is the same page
    cy.get('[data-cy="e2e-rule-input-select"]').get('select').eq(1).select(2);
    // Check that an error message is shown
    cy.get('[data-testid="error-message"]').should('exist');
    cy.get('[data-cy="e2e-rule-input-error"]').should('exist');

    // Change rule to go to page 3 which should not show any errors
    cy.get('[data-cy="e2e-rule-input-select"]').get('select').eq(1).select(3);

    // Check to see that the errors were removed
    cy.get('[data-testid="error-message"]').should('not.exist');
    cy.get('[data-cy="e2e-rule-input-error"]').should('not.exist');
  });

  it('creates survey with page logic and user fills in the survey based on that logic', () => {
    cy.intercept('POST', '**/ideas').as('saveSurvey');

    const chooseOneOption1 = randomString();
    const chooseOneOption2 = randomString();
    const question2Title = randomString();
    const question3Title = randomString();
    const question4Title = randomString();
    const page2Title = randomString();
    const page3Title = randomString();
    const page4Title = randomString();
    const multipleChoiceChooseOneTitle = 'multiplechoicechooseonefield';

    cy.visit(`admin/projects/${projectId}/native-survey`);
    cy.get('[data-cy="e2e-edit-survey-content"]').click();
    cy.get('[data-cy="e2e-short-answer"]').click();

    cy.get('#e2e-title-multiloc').type(questionTitle, { force: true });

    cy.get('[data-cy="e2e-single-choice"]').click();
    cy.get('#e2e-title-multiloc').type(multipleChoiceChooseOneTitle, {
      force: true,
    });
    cy.get('#e2e-option-input-0').type(chooseOneOption1, { force: true });
    cy.get('[data-cy="e2e-add-answer"]').click();
    cy.get('#e2e-option-input-1').type(chooseOneOption2, { force: true });

    // Add second page
    cy.get('[data-cy="e2e-page"]').click();
    cy.get('#e2e-field-group-title-multiloc').type(page2Title, { force: true });
    cy.get('[data-cy="e2e-short-answer"]').click();
    cy.get('#e2e-title-multiloc').type(question2Title, { force: true });

    // Add third page
    cy.get('[data-cy="e2e-page"]').click();
    cy.get('#e2e-field-group-title-multiloc').type(page3Title, { force: true });
    cy.get('[data-cy="e2e-short-answer"]').click();
    cy.get('#e2e-title-multiloc').type(question3Title, { force: true });

    // Add fourth page
    cy.get('[data-cy="e2e-page"]').click();
    cy.get('#e2e-field-group-title-multiloc').type(page4Title, { force: true });
    cy.get('[data-cy="e2e-short-answer"]').click();
    cy.get('#e2e-title-multiloc').type(question4Title, { force: true });

    // Add page logic to page 2 to go to survey end
    cy.contains(page2Title).should('exist');
    cy.contains(page2Title).click();
    cy.get('[data-cy="e2e-form-builder-logic-tab"]').click();
    cy.get('[data-cy="e2e-add-rule-button"]').click();
    cy.get('[data-cy="e2e-rule-input-select"]').should('exist');
    cy.get('[data-cy="e2e-rule-input-select"]').get('select').select(5);

    // Save the survey
    cy.get('form').submit();

    // Try filling in the survey
    cy.visit(`/projects/${projectSlug}/ideas/new`);
    cy.acceptCookies();
    // First page
    cy.contains(questionTitle).should('exist');
    cy.contains(multipleChoiceChooseOneTitle).should('exist');
    cy.contains(chooseOneOption1).should('exist');
    cy.contains(chooseOneOption1).click();

    // Check to see that we are on the second page
    cy.get('[data-cy="e2e-next-page"]').click();
    cy.contains(page2Title).should('exist');

    // Click next and check to see that the user is redirected to the last page
    cy.get('[data-cy="e2e-next-page"]').click();
    cy.get('[data-cy="e2e-submit-form"]').should('exist');
    cy.get('[data-cy="e2e-submit-form"]').click();
    cy.wait('@saveSurvey').then((interception) => {
      const keys = Object.keys(interception.request.body.idea);
      const value: string = interception.request.body.idea[keys[0]];
      expect(value).to.equal(chooseOneOption1);
    });

    cy.get('[data-cy="e2e-survey-success-message"]').should('exist');
    cy.get('.e2e-modal-close-button').click();
    cy.get('#e2e-modal-container').should('have.length', 0);
  });

  it('creates survey with page logic and question logic where question logic takes precedence over page logic', () => {
    cy.intercept('POST', '**/ideas').as('saveSurvey');

    const chooseOneOption1 = randomString();
    const chooseOneOption2 = randomString();
    const question2Title = randomString();
    const question3Title = randomString();
    const question4Title = randomString();
    const page2Title = randomString();
    const page3Title = randomString();
    const page4Title = randomString();
    const multipleChoiceChooseOneTitle = 'multiplechoicechooseonefield';

    cy.visit(`admin/projects/${projectId}/native-survey`);
    cy.get('[data-cy="e2e-edit-survey-content"]').click();
    cy.get('[data-cy="e2e-short-answer"]').click();

    cy.get('#e2e-title-multiloc').type(questionTitle, { force: true });

    // Add second page
    cy.get('[data-cy="e2e-page"]').click();
    cy.get('#e2e-field-group-title-multiloc').type(page2Title, { force: true });
    cy.get('[data-cy="e2e-short-answer"]').click();
    cy.get('#e2e-title-multiloc').type(question2Title, { force: true });

    // Add multiple choice question to the second page
    cy.get('[data-cy="e2e-single-choice"]').click();
    cy.get('#e2e-title-multiloc').type(multipleChoiceChooseOneTitle, {
      force: true,
    });
    cy.get('#e2e-option-input-0').type(chooseOneOption1, { force: true });
    cy.get('[data-cy="e2e-add-answer"]').click();
    cy.get('#e2e-option-input-1').type(chooseOneOption2, { force: true });

    // Add third page
    cy.get('[data-cy="e2e-page"]').click();
    cy.get('#e2e-field-group-title-multiloc').type(page3Title, { force: true });
    cy.get('[data-cy="e2e-short-answer"]').click();
    cy.get('#e2e-title-multiloc').type(question3Title, { force: true });

    // Add fourth page
    cy.get('[data-cy="e2e-page"]').click();
    cy.get('#e2e-field-group-title-multiloc').type(page4Title, { force: true });
    cy.get('[data-cy="e2e-short-answer"]').click();
    cy.get('#e2e-title-multiloc').type(question4Title, { force: true });

    // Add logic to the multiple choice question
    cy.contains(multipleChoiceChooseOneTitle).should('exist');
    cy.contains(multipleChoiceChooseOneTitle).click();
    cy.get('[data-cy="e2e-form-builder-logic-tab"]').click();
    cy.get('[data-cy="e2e-add-rule-button"]').first().click();
    cy.get('[data-cy="e2e-rule-input-select"]').should('exist');
    // Add rule to go to survey end
    cy.get('[data-cy="e2e-rule-input-select"]').get('select').select(4);

    // Add page logic to page 2 to go to page 3
    cy.contains(page2Title).should('exist');
    cy.contains(page2Title).click();
    cy.get('[data-cy="e2e-form-builder-logic-tab"]').click();
    cy.get('[data-cy="e2e-add-rule-button"]').click();
    cy.get('[data-cy="e2e-rule-input-select"]').should('exist');
    cy.get('[data-cy="e2e-rule-input-select"]').get('select').select(3);

    // Save the survey
    cy.get('form').submit();

    // Try filling in the survey
    cy.visit(`/projects/${projectSlug}/ideas/new`);
    cy.acceptCookies();
    // First page
    cy.contains(questionTitle).should('exist');

    // Check to see that we are on the second page
    cy.get('[data-cy="e2e-next-page"]').click();
    cy.contains(page2Title).should('exist');

    // Go through option 2 flow first and enter data
    cy.contains(chooseOneOption2).click({ force: true });
    cy.get('[data-cy="e2e-next-page"]').click();
    cy.contains(page3Title).should('exist');
    cy.contains(question3Title).should('exist');
    cy.get(`[data-testid="inputControl"]`).click().type('question3');

    // Go back to page 2
    cy.get('[data-cy="e2e-previous-page"]').click();

    // Select the first option and click next
    cy.contains(chooseOneOption1).click({ force: true });
    cy.get('[data-cy="e2e-next-page"]').click();

    // Check to see that we are on the fourth page and on the last page as indicated by the page logic
    cy.contains(page4Title).should('exist');
    cy.contains(question4Title).should('exist');
    cy.get('[data-cy="e2e-next-page"]').click();

    // Check that page 3 answer (not in final page path) is not sent to server
    cy.get('[data-cy="e2e-submit-form"]').should('exist');
    cy.get('[data-cy="e2e-submit-form"]').click();
    cy.wait('@saveSurvey').then((interception) => {
      const keys = Object.keys(interception.request.body.idea);
      keys.forEach((key) => {
        const value = interception.request.body.idea[key];
        expect(value).not.to.equal('question3');
      });
    });
  });
});
