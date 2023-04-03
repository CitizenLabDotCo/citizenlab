import { randomString } from '../../../support/commands';

describe('Input form builder', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;
  let projectSlug: string;

  beforeEach(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }

    cy.setAdminLoginCookie();

    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
      participationMethod: 'ideation',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;
    });
  });

  it('allows user to turn on / off the attachments default field but not edit its question title', () => {
    // Check that the Attachments field is present on the idea form before turning it off
    cy.visit(`/projects/${projectSlug}/ideas/new`);
    cy.acceptCookies();

    cy.get('#e2e-idea-file-upload').should('exist');

    cy.visit(`admin/projects/${projectId}/ideaform`);
    cy.get('[data-cy="e2e-edit-input-form"]').click();

    // The attachments tool box item should be disabled as it is already on the canvas
    cy.get('[data-cy="e2e-attachments-item"]').as('attachmentsToolboxItem');
    cy.get('@attachmentsToolboxItem').should('exist');
    cy.get('@attachmentsToolboxItem').should('have.attr', 'disabled');

    cy.get('[data-cy="e2e-field-row"]').within(() => {
      cy.contains('Attachments').should('exist');
      cy.contains('Attachments').click();
    });

    // Title should not be present or editable
    cy.get('#e2e-title-multiloc').should('not.exist');

    cy.get('[data-cy="e2e-delete-field"]').click();

    // The Attachments tool box item should be enabled as it has been removed from the canvas
    cy.get('@attachmentsToolboxItem').should('not.have.attr', 'disabled');

    // Check to see that Attachments is removed from the canvas
    cy.get('[data-cy="e2e-field-row"]').within(() => {
      cy.contains('Attachments').should('not.exist');
    });

    // Save the form
    cy.get('form').submit();
    // Should show success message on saving
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Fill in the form
    cy.visit(`/projects/${projectSlug}/ideas/new`);

    cy.get('#e2e-idea-file-upload').should('not.exist');
  });
});
