import { snakeCase } from 'lodash-es';
import { randomString } from '../../support/commands';

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
    cy.contains('Required').click();

    cy.get('form').submit();
    // Should show success message on saving
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Try filling in the survey
    cy.visit(`/projects/${projectSlug}/ideas/new`);
    cy.acceptCookies();
    cy.contains(questionTitle).should('exist');

    // Try saving without entering data for required field
    cy.get('.e2e-submit-idea-form').click();
    // verify that an error is shown and that we stay on the page
    cy.get('.e2e-error-message');
    cy.location('pathname').should(
      'eq',
      `/en/projects/${projectSlug}/ideas/new`
    );

    cy.get(`#properties${questionTitle}`).type(answer, { force: true });

    // Save survey response
    cy.get('.e2e-submit-idea-form').click();

    // Check that we show a success message
    cy.get('[data-cy="e2e-survey-success-message"]').should('exist');
    // close modal
    cy.get('.e2e-modal-close-button').click();
    // check that the modal is no longer on the page
    cy.get('#e2e-modal-container').should('have.length', 0);
  });

  it('deletes a field when the delete button is clicked', () => {
    const fieldIdentifier = snakeCase(questionTitle);
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

    // Check that field exists
    cy.get(`[data-cy="${`e2e-field-${fieldIdentifier}`}"]`).should('exist');

    // Click the edit button
    cy.get(`[data-cy="${`e2e-edit-${fieldIdentifier}`}"]`).click();

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
    cy.get('[data-cy="e2e-multiple-choice"]').click();
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
    cy.get('#e2e-multiselect-toggle').click();
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

    // Enter some data and save
    cy.get(`#${multipleChoiceChooseOneTitle}-radio-0`).click({ force: true });
    cy.get(`#${multipleChoiceChooseManyTitle}-checkbox-0`).click({
      force: true,
    });
    cy.get(`#${linearScaleTitle}-radio-1`).click({ force: true });
    cy.get('.e2e-submit-idea-form').click();
    cy.wait(1000);

    cy.visit(`/projects/${projectSlug}/ideas/new`);
    cy.get(`#${multipleChoiceChooseOneTitle}-radio-1`).click({ force: true });
    cy.get(`#${multipleChoiceChooseManyTitle}-checkbox-1`).click({
      force: true,
    });
    cy.get(`#${linearScaleTitle}-radio-0`).click({ force: true });
    cy.get('.e2e-submit-idea-form').click();
    cy.wait(1000);

    cy.visit(`/projects/${projectSlug}/ideas/new`);
    cy.get(`#${multipleChoiceChooseOneTitle}-radio-1`).click({ force: true });
    cy.get(`#${multipleChoiceChooseManyTitle}-checkbox-1`).click({
      force: true,
    });
    cy.get(`#${linearScaleTitle}-radio-0`).click({ force: true });
    cy.get('.e2e-submit-idea-form').click();
    cy.wait(1000);

    cy.visit(`admin/projects/${projectId}/native-survey/results`);
    cy.get(`[data-cy="e2e-${snakeCase(multipleChoiceChooseOneTitle)}"]`).should(
      'exist'
    );
    cy.get(
      `[data-cy="e2e-${snakeCase(multipleChoiceChooseManyTitle)}"]`
    ).should('exist');
    cy.get(`[data-cy="e2e-${snakeCase(linearScaleTitle)}"]`).should('exist');
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
    const fieldIdentifier = snakeCase(questionTitle);
    cy.visit(`admin/projects/${projectId}/native-survey/edit`);
    cy.get('[data-cy="e2e-short-answer"]').click();
    cy.get('#e2e-title-multiloc').type(questionTitle, { force: true });

    // Save the survey
    cy.get('form').submit();
    // Should show success message on saving
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Check that edit button is not disabled
    cy.get(`[data-cy="${`e2e-edit-${fieldIdentifier}`}"]`).should(
      'not.have.attr',
      'disabled'
    );

    // Navigate to the survey page
    cy.visit(`/projects/${projectSlug}/ideas/new`);
    cy.acceptCookies();
    cy.contains(questionTitle).should('exist');

    cy.get(`#properties${questionTitle}`).type(answer, { force: true });

    // Save survey response
    cy.get('.e2e-submit-idea-form').click();

    cy.visit(`admin/projects/${projectId}/native-survey/edit`);

    // Check that field exists
    cy.get(`[data-cy="${`e2e-field-${fieldIdentifier}`}"]`).should('exist');

    // Check that the edit button is disabled
    cy.get(`[data-cy="${`e2e-edit-${fieldIdentifier}`}"]`).should(
      'have.attr',
      'disabled'
    );

    cy.get('[data-cy="e2e-form-delete-results-notice"]').should('exist');
    cy.get('[data-cy="e2e-delete-form-results-notice-link"]').click();

    cy.get('[data-cy="e2e-form-delete-results-notice"]').should('exist');
  });
});
