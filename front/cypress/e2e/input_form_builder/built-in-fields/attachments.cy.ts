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

  it('allows user to turn on / off the attachments default field but not edit its question title', () => {
    const title = randomString(12);
    const description = randomString(42);

    // Visit the project page and accept cookies. This is needed because the cookie banner is not interactive on the input form
    cy.visit(`/projects/${projectSlug}`);
    cy.acceptCookies();

    // Check that the Attachments field is present on the idea form before turning it off
    cy.visit(`/projects/${projectSlug}/ideas/new?phase_id=${phaseId}`);

    // Fill in the title and description since these are required
    cy.get('#e2e-idea-title-input input').type(title);
    cy.get('#e2e-idea-title-input input').should('contain.value', title);

    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();

    cy.get('#e2e-idea-description-input .ql-editor').type(description);
    cy.get('#e2e-idea-description-input .ql-editor').contains(description);

    // Go to the next page of the idea form that has the attachments field
    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();

    cy.get('#e2e-idea-file-upload').should('exist');

    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/form`);
    cy.get('[data-cy="e2e-edit-input-form"]').click();

    // The attachments tool box item should be disabled as it is already on the canvas
    cy.get('[data-cy="e2e-attachments-item"]').as('attachmentsToolboxItem');
    cy.get('@attachmentsToolboxItem').should('exist');
    cy.get('@attachmentsToolboxItem').should('have.attr', 'disabled');

    cy.get('[data-cy="e2e-form-fields"]').within(() => {
      cy.contains('Attachments').should('exist');
      cy.contains('Attachments').click();
    });

    // Title should not be present or editable
    cy.get('#e2e-title-multiloc').should('not.exist');

    cy.get('[data-cy="e2e-more-field-actions"]').eq(1).click({ force: true });
    cy.get('.e2e-more-actions-list button').contains('Delete').click();

    // The Attachments tool box item should be enabled as it has been removed from the canvas
    cy.get('@attachmentsToolboxItem').should('not.have.attr', 'disabled');

    // Check to see that Attachments is removed from the canvas
    cy.get('[data-cy="e2e-form-fields"]').within(() => {
      cy.contains('Attachments').should('not.exist');
    });

    // Save the form
    cy.get('form').submit();
    // Should show success message on saving
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Fill in the form
    cy.visit(`/projects/${projectSlug}/ideas/new?phase_id=${phaseId}`);

    // Fill in the title and description since these are required
    cy.get('#e2e-idea-title-input input').type(title);
    cy.get('#e2e-idea-title-input input').should('contain.value', title);

    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();

    cy.get('#e2e-idea-description-input .ql-editor').type(description);
    cy.get('#e2e-idea-description-input .ql-editor').contains(description);

    // Go to the page that had the attachments field
    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();

    cy.get('#e2e-idea-file-upload').should('not.exist');
  });
});
