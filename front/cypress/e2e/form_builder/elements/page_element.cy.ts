import { randomString } from '../../../support/commands';

describe('Form builder page element', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;
  let projectSlug: string;

  beforeEach(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }

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

    cy.setAdminLoginCookie();
  });

  it('adds page element and tests settings', () => {
    cy.visit(`admin/projects/${projectId}/native-survey/edit`);
    cy.get('[data-cy="e2e-page"]').click();
    cy.get('#e2e-field-group-title-multiloc').type('Page title', {
      force: true,
    });
    cy.get('[data-cy="e2e-field-group-description-multiloc"]')
      .click()
      .type('Page description');
    cy.get('#e2e-settings-done-button').click();

    // Add number field to the next page
    cy.get('[data-cy="e2e-number-field"]').click();
    cy.get('#e2e-title-multiloc').type('Number', { force: true });

    // Should show success message on saving
    cy.get('form').submit();
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Reload page
    cy.visit(`admin/projects/${projectId}/native-survey/edit`);
    cy.contains('Page title').click();

    // Confirm the settings are loaded correctly
    cy.contains('Page title').should('exist');
    cy.contains('Page description').should('exist');

    // Go to the survey page
    cy.visit(`/projects/${projectSlug}/ideas/new`);

    // Go to the next page
    cy.get('[data-cy="e2e-next-page"]').click();

    // Go to the next page
    cy.get('[data-cy="e2e-next-page"]').click();

    // Save survey response
    cy.get('[data-cy="e2e-submit-form"]').should('exist');
    cy.get('[data-cy="e2e-submit-form"]').click();

    // Check that we show a success message on submit
    cy.get('[data-cy="e2e-survey-success-message"]').should('exist');
  });

  it('does not let the user delete the page if there is only one page', () => {
    cy.visit(`admin/projects/${projectId}/native-survey/edit`);
    cy.get('[data-cy="e2e-page"]').click();
    cy.get('#e2e-field-group-title-multiloc').type('Page title', {
      force: true,
    });
    cy.get('[data-cy="e2e-field-group-description-multiloc"]')
      .click()
      .type('Page description');
    cy.get('#e2e-settings-done-button').click();

    // Click to show the settings
    cy.contains('Page title').should('exist').click();
    cy.get(`[data-cy="e2e-delete-field"]`).click();

    // Check to see that the first and now only page is not deletable
    cy.get('[data-cy="e2e-field-row"]').first().click();
    cy.get('[data-cy="e2e-delete-field"]').should('have.attr', 'disabled');
  });
});
