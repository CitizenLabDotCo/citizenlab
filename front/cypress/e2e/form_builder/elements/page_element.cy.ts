import { randomString } from '../../../support/commands';

describe('Form builder page element', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;
  let projectSlug: string;

  before(() => {
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

  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('adds page element and tests settings', () => {
    cy.visit(`admin/projects/${projectId}/native-survey/edit`);
    cy.get('[data-cy="e2e-page"]').click();
    cy.get('#e2e-page-title-multiloc').type('Page title', { force: true });
    cy.get('[data-cy="e2e-page-description-multiloc"]')
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
    cy.get('[data-cy="e2e-next-page"]').click();
    cy.get('[data-cy="e2e-submit-form"]').click();
    // Check that we show a success message on submit
    cy.get('[data-cy="e2e-survey-success-message"]').should('exist');
  });
});
