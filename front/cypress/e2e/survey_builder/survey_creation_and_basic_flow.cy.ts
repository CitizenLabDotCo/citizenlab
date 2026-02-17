import { randomString, randomEmail } from '../../support/commands';

const waitForCustomFormFields = () => {
  cy.intercept('**/phases/**/custom_fields**').as('customFields');
  cy.wait('@customFields', { timeout: 10000 });
  cy.wait(1000);
};

describe('Survey Builder - Creation and Basic Flow', () => {
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

  it('can create survey, save survey, and user can respond to survey', () => {
    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/survey-form`);
    cy.dataCy('e2e-edit-survey-form').click();
    waitForCustomFormFields();
    cy.addItemToFormBuilder('#toolbox_text');

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
    cy.visit(`/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`);

    cy.contains(questionTitle).should('exist');

    // Try going to the next page without filling in the survey
    cy.wait(1000);
    cy.dataCy('e2e-submit-form').should('be.visible').click();

    // verify that an error is shown and that we stay on the page
    cy.get('.e2e-error-message');
    cy.url().should(
      'eq',
      `${
        Cypress.config().baseUrl
      }/en/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`
    );

    cy.get(`*[id^="${questionTitle}"]:not([id$="-label"])`)
      .first()
      .type(answer, { force: true });

    // Submit the survey response
    cy.wait(1000);
    cy.dataCy('e2e-submit-form').should('be.visible').click();

    // Check that submission was successful
    cy.dataCy('e2e-page-number-1').should('exist');
    cy.dataCy('e2e-after-submission').should('exist');
  });

  it('can click button in survey page to navigate to the survey builder', () => {
    // Navigate to the survey
    cy.visit(`/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`);

    cy.dataCy('e2e-edit-survey-link').click();
    cy.location('pathname').should(
      'eq',
      `/en/admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`
    );
  });

  it('deletes a field when the delete button is clicked', () => {
    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`);
    waitForCustomFormFields();

    cy.dataCy('e2e-linear-scale');
    cy.wait(2000);
    cy.addItemToFormBuilder('#toolbox_linear_scale');
    cy.get('#e2e-title-multiloc').type(questionTitle, { force: true });

    // Save the survey
    cy.get('form').submit();
    // Should show success message on saving
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`);

    cy.contains(questionTitle).should('exist').click();

    // Click to delete the field
    cy.dataCy('e2e-more-field-actions').eq(1).click({ force: true });
    cy.get('.e2e-more-actions-list button').contains('Delete').click();

    // Save the survey
    cy.get('form').submit();

    // Check that field nolonger exists
    cy.get(`[data-cy="${`field-${questionTitle}`}"]`).should('not.exist');

    // Navigate to the survey page
    cy.visit(`/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`);
    cy.contains(questionTitle).should('not.exist');
  });

  it('navigates to live project in a new tab when view project button in content builder is clicked', () => {
    const projectUrl = `/en/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`;

    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/survey-form`);
    cy.dataCy('e2e-edit-survey-form').click();
    waitForCustomFormFields();

    cy.addItemToFormBuilder('#toolbox_number');
    cy.get('#e2e-title-multiloc').type(questionTitle, { force: true });
    cy.get('form').submit();

    cy.get('[data-cy="e2e-preview-form-button"] > a').should('exist');
    cy.get('[data-cy="e2e-preview-form-button"] > a')
      .should(($a) => {
        expect($a.attr('href'), 'href').to.equal(projectUrl);
        expect($a.attr('target'), 'target').to.equal('_blank');
        $a.attr('target', '_self');
      })
      .click({ force: true });
    cy.url().should(
      'eq',
      `${
        Cypress.config().baseUrl
      }/en/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`
    );
  });

  it('allows admins to fill in surveys as many times as they want when permissions are set to registered users', () => {
    cy.visit(`/admin/projects/${projectId}/phases/${phaseId}/access-rights`);

    cy.get('.e2e-action-accordion-posting_idea').click();
    cy.get('.e2e-action-form-posting_idea').within(() => {
      cy.get('.e2e-permission-registered-users').click();
    });

    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/survey-form`);
    cy.dataCy('e2e-edit-survey-form').click();
    waitForCustomFormFields();

    cy.addItemToFormBuilder('#toolbox_text');

    cy.get('#e2e-title-multiloc').type(questionTitle, { force: true });

    // Save the survey
    cy.get('form').submit();
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Take the survey
    cy.visit(`/projects/${projectSlug}`);

    cy.get('#project-survey-button')
      .find('button')
      .should('not.have.attr', 'disabled');
    cy.get('#project-survey-button').find('button').click({ force: true });
    cy.contains(questionTitle).should('exist');

    cy.wait(1000);
    cy.dataCy('e2e-submit-form').click();
    cy.dataCy('e2e-page-number-1').should('exist');
    cy.dataCy('e2e-after-submission').should('exist');

    // Take the survey again
    cy.visit(`/projects/${projectSlug}`);
    cy.get('#project-survey-button')
      .find('button')
      .should('not.have.attr', 'disabled');
    cy.get('#project-survey-button').find('button').click({ force: true });
    cy.contains(questionTitle).should('exist');

    cy.wait(1000);
    cy.dataCy('e2e-submit-form').click();
    cy.dataCy('e2e-page-number-1').should('exist');
    cy.dataCy('e2e-after-submission').should('exist');
  });

  it('does not allow non admin users to fill in a survey more than once when permissions are set to registered users', () => {
    const firstName = randomString();
    const lastName = randomString();
    const email = randomEmail();
    const password = randomString();

    cy.visit(`/admin/projects/${projectId}/phases/${phaseId}/access-rights`);

    cy.get('.e2e-action-accordion-posting_idea').click();
    cy.get('.e2e-action-form-posting_idea').within(() => {
      cy.get('.e2e-permission-registered-users').click();
    });

    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/survey-form`);
    cy.dataCy('e2e-edit-survey-form').click();
    waitForCustomFormFields();

    // Add a required single-select
    cy.addItemToFormBuilder('#toolbox_text');
    cy.get('#e2e-title-multiloc').type(questionTitle, { force: true });
    cy.get('#e2e-required-toggle').find('input').click({ force: true });

    cy.get('form').submit();
    // Should show success message on saving
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    cy.visit(`admin/projects/${projectId}`);
    cy.logout();
    cy.apiSignup(firstName, lastName, email, password);
    cy.setLoginCookie(email, password);
    cy.acceptCookies();

    // Take the survey
    cy.visit(`/projects/${projectSlug}`);

    cy.get('.e2e-idea-button')
      .first()
      .find('button')
      .should('not.have.class', 'disabled');
    cy.get('.e2e-idea-button').first().find('button').click({ force: true });
    cy.contains(questionTitle).should('exist');
    cy.get(`*[id^="${questionTitle}"]:not([id$="-label"])`)
      .first()
      .type(answer, { force: true });

    // Submit
    cy.wait(1000);
    cy.dataCy('e2e-submit-form').should('be.visible').click();
    cy.dataCy('e2e-page-number-2').should('exist');
    cy.dataCy('e2e-after-submission').should('exist');

    cy.intercept('GET', `**/projects/${projectId}/files`).as('getFiles');

    // Try filling in the survey again
    cy.visit(`/projects/${projectSlug}`);
    cy.wait('@getFiles');
    cy.get('.e2e-idea-button')
      .first()
      .find('button')
      .should('have.class', 'disabled');
  });
});
