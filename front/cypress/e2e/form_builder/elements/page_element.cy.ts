import { randomString } from '../../../support/commands';
import moment = require('moment');

describe('Form builder page element', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;
  let projectSlug: string;
  let phaseId: string;

  beforeEach(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }

    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    })
      .then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;
        return cy.apiCreatePhase({
          projectId,
          title: 'firstPhaseTitle',
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          participationMethod: 'native_survey',
          canPost: true,
          canComment: true,
          canReact: true,
        });
      })
      .then((phase) => {
        phaseId = phase.body.data.id;
      });

    cy.setAdminLoginCookie();
  });

  it('adds page element and tests settings', () => {
    cy.visit(
      `admin/projects/${projectId}/phases/${phaseId}/native-survey/edit`
    );
    cy.get('[data-cy="e2e-page"]').click();
    cy.get('#e2e-field-group-title-multiloc').type('Page title', {
      force: true,
    });
    cy.get('[data-cy="e2e-field-group-description-multiloc"]')
      .click()
      .type('Page description');
    cy.get('[data-cy="e2e-form-builder-close-settings"]')
      .find('button')
      .click({ force: true });

    // Add number field to the next page
    cy.get('[data-cy="e2e-number-field"]').click();
    cy.get('#e2e-title-multiloc').type('Number', { force: true });

    // Should show success message on saving
    cy.get('form').submit();
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Reload page
    cy.visit(
      `admin/projects/${projectId}/phases/${phaseId}/native-survey/edit`
    );
    cy.contains('Page title').click();

    // Confirm the settings are loaded correctly
    cy.contains('Page title').should('exist');
    cy.contains('Page description').should('exist');

    // Go to the survey page
    cy.visit(`/projects/${projectSlug}/ideas/new?phase_id=${phaseId}`);

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
    cy.visit(
      `admin/projects/${projectId}/phases/${phaseId}/native-survey/edit`
    );

    // Add a second page
    cy.get('[data-cy="e2e-page"]').click();
    cy.get('#e2e-field-group-title-multiloc').type('Page title', {
      force: true,
    });
    cy.get('[data-cy="e2e-field-group-description-multiloc"]')
      .click()
      .type('Page description');
    cy.get('[data-cy="e2e-form-builder-close-settings"]').click({
      force: true,
    });

    // Check that we have options to delete the first page since we have two pages
    cy.get('[data-cy="e2e-field-row"]')
      .first()
      .find('[data-cy="e2e-more-field-actions"]')
      .should('exist');
    cy.get('[data-cy="e2e-more-field-actions"]').eq(0).click({ force: true });
    cy.get('.e2e-more-actions-list button').contains('Delete');

    // Delete the second page
    cy.get('[data-cy="e2e-more-field-actions"]').eq(2).click({ force: true });
    cy.get('.e2e-more-actions-list button').contains('Delete').click();

    // Check that we don't have options to delete the first page since we only have one page
    cy.get('[data-cy="e2e-field-row"]')
      .first()
      .find('[data-cy="e2e-more-field-actions"]')
      .should('not.exist');
  });
});
