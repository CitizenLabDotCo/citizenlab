import { randomString } from '../../../support/commands';
import moment = require('moment');

describe('Input form builder', () => {
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

    cy.setAdminLoginCookie();

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
          endAt: moment().subtract(3, 'month').format('DD/MM/YYYY'),
          participationMethod: 'ideation',
          canPost: true,
          canComment: true,
          canReact: true,
        });
      })
      .then((phase) => {
        phaseId = phase.body.data.id;
      });
  });

  it('allows user to turn off the tags default field but not edit its question title', () => {
    // Check that the tags field is present on the idea form before turning it off
    cy.visit(`/projects/${projectSlug}/ideas/new?phase_id=${phaseId}`);
    cy.acceptCookies();

    cy.get('.e2e-topics-picker').should('exist');

    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/ideaform`);
    cy.get('[data-cy="e2e-edit-input-form"]').click();

    // The tags tool box item should be disabled as it is already on the canvas
    cy.get('[data-cy="e2e-tags-item"]').as('tagsToolboxItem');
    cy.get('@tagsToolboxItem').should('exist');
    cy.get('@tagsToolboxItem').should('have.attr', 'disabled');

    cy.get('[data-cy="e2e-field-row"]').within(() => {
      cy.contains('Tags').should('exist');
      cy.contains('Tags').click();
    });

    // Title should not be present or editable
    cy.get('#e2e-title-multiloc').should('not.exist');

    cy.get('[data-cy="e2e-more-field-actions"]').eq(3).click({ force: true });
    cy.get('.e2e-more-actions-list button').contains('Delete').click();

    // The tags tool box item should be enabled as it has been removed from the canvas
    cy.get('@tagsToolboxItem').should('not.have.attr', 'disabled');

    // Check to see that tags is removed from the canvas
    cy.get('[data-cy="e2e-field-row"]').within(() => {
      cy.contains('Tags').should('not.exist');
    });

    // Save the form
    cy.get('form').submit();
    // Should show success message on saving
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Fill in the form
    cy.visit(`/projects/${projectSlug}/ideas/new?phase_id=${phaseId}`);

    cy.get('.e2e-topics-picker').should('not.exist');
  });
});
