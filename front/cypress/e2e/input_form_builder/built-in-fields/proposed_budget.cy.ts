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

  it('allows user to turn on / off the proposed budget default field but not edit its question title', () => {
    const title = randomString(12);
    const description = randomString(42);

    // Visit the project page and accept cookies. This is needed because the cookie banner is not interactive on the input form
    cy.visit(`/projects/${projectSlug}`);
    cy.acceptCookies();

    // Check that the proposed budget field is not present on the idea form before turning it off
    cy.visit(`/projects/${projectSlug}/ideas/new?phase_id=${phaseId}`);

    // Fill in the title and description since these are required
    cy.get('#e2e-idea-title-input input').type(title);
    cy.get('#e2e-idea-title-input input').should('contain.value', title);

    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();

    cy.get('#e2e-idea-description-input .ql-editor').type(description);
    cy.get('#e2e-idea-description-input .ql-editor').contains(description);

    // Go to the next page of the idea form
    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();

    // Page 3 should have the proposed budget field but does not
    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();

    cy.get('#propertiesproposed_budget').should('not.exist');

    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/form`);
    cy.get('[data-cy="e2e-edit-input-form"]').click();

    cy.get('[data-cy="e2e-proposed-budget-item"]').as(
      'proposedBudgetToolboxItem'
    );
    cy.get('@proposedBudgetToolboxItem').should('exist');

    // The proposed budget tool box item should be enabled as it is not on the canvas
    cy.get('@proposedBudgetToolboxItem').should('not.have.attr', 'disabled');
    cy.get('[data-cy="e2e-form-fields"]').within(() => {
      cy.contains('Proposed Budget').should('not.exist');
    });

    cy.get('@proposedBudgetToolboxItem').click();

    // It should now be disabled as it is in the canvas
    cy.get('@proposedBudgetToolboxItem').should('have.attr', 'disabled');

    // Check to see that the proposed budget is added to the canvas
    cy.get('[data-cy="e2e-form-fields"]').within(() => {
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
    cy.visit(`/projects/${projectSlug}/ideas/new?phase_id=${phaseId}`);

    // Fill in the title and description since these are required
    cy.get('#e2e-idea-title-input input').type(title);
    cy.get('#e2e-idea-title-input input').should('contain.value', title);

    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();

    cy.get('#e2e-idea-description-input .ql-editor').type(description);
    cy.get('#e2e-idea-description-input .ql-editor').contains(description);

    // Go to the next page of the idea form
    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();

    // Page 3 should have the proposed budget field
    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();

    cy.get('#propertiesproposed_budget').should('exist');
  });
});
