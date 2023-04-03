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

  it('allows user to turn on / off the proposed budget default field but not edit its question title', () => {
    // Check that the tags field is not present on the idea form before turning it off
    cy.visit(`/projects/${projectSlug}/ideas/new`);
    cy.acceptCookies();

    cy.get('#propertiesproposed_budget').should('not.exist');

    cy.visit(`admin/projects/${projectId}/ideaform`);
    cy.get('[data-cy="e2e-edit-input-form"]').click();

    cy.get('[data-cy="e2e-proposed-budget-item"]').as(
      'proposedBudgetToolboxItem'
    );
    cy.get('@proposedBudgetToolboxItem').should('exist');

    // The proposed budget tool box item should be enabled as it is not on the canvas
    cy.get('@proposedBudgetToolboxItem').should('not.have.attr', 'disabled');
    cy.get('[data-cy="e2e-field-row"]').within(() => {
      cy.contains('Proposed Budget').should('not.exist');
    });

    cy.get('@proposedBudgetToolboxItem').click();

    // It should now be disabled as it is in the canvas
    cy.get('@proposedBudgetToolboxItem').should('have.attr', 'disabled');

    // Check to see that the proposed budget is added to the canvas
    cy.get('[data-cy="e2e-field-row"]').within(() => {
      cy.contains('Proposed Budget').should('exist');
      cy.contains('Proposed Budget').click();
    });

    // Title should not be present or editable
    cy.get('#e2e-title-multiloc').should('not.exist');

    // Save the form
    cy.get('form').submit();
    // Should show success message on saving
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Fill in the form
    cy.visit(`/projects/${projectSlug}/ideas/new`);

    cy.get('#propertiesproposed_budget').should('exist');
  });
});
