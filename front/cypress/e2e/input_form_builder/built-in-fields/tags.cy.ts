import { randomString } from '../../../support/commands';

describe('Input form builder', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  let questionTitle = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;
  let projectSlug: string;

  beforeEach(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }

    cy.setAdminLoginCookie();
    questionTitle = randomString();

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

  it('allows user to turn off the tags default field', () => {
    // Check that the tags field is present on the idea form before turning it off
    cy.visit(`/projects/${projectSlug}/ideas/new`);
    cy.acceptCookies();

    cy.get('.e2e-topics-picker').should('exist');

    cy.visit(`admin/projects/${projectId}/ideaform`);
    cy.get('[data-cy="e2e-edit-input-form"]').click();

    // The tags tool box item should be disabled as it is already on the canvas
    cy.get('[data-cy="e2e-tags-item"]').as('tagsToolboxItem');
    cy.get('@tagsToolboxItem').should('exist');
    cy.get('@tagsToolboxItem').should('have.attr', 'disabled');

    cy.get('[data-cy="e2e-field-row"]').within(() => {
      cy.contains('Tags').should('exist');
      cy.contains('Tags').click();
    });

    cy.get('[data-cy="e2e-delete-field"]').click();

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
    cy.visit(`/projects/${projectSlug}/ideas/new`);

    cy.get('.e2e-topics-picker').should('not.exist');
  });
});
