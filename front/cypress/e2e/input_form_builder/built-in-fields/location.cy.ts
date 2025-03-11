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

  it('allows user to turn on / off the location default field but not edit its question title', () => {
    const title = randomString(12);
    const description = randomString(42);
    // Check that the location field is present on the idea form before turning it off
    cy.visit(`/projects/${projectSlug}/ideas/new?phase_id=${phaseId}`);
    cy.acceptCookies();

    // Fill in the title and description since these are required
    cy.get('#e2e-idea-title-input input').type(title);
    cy.get('#e2e-idea-title-input input').should('contain.value', title);
    cy.get('#e2e-idea-description-input .ql-editor').type(description);
    cy.get('#e2e-idea-description-input .ql-editor').contains(description);

    // Go to the next page of the idea form
    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();

    // Location field is on page three
    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();

    cy.get('.e2e-idea-form-location-input-field input').should('exist');

    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/form`);
    cy.get('[data-cy="e2e-edit-input-form"]').click();

    // The location tool box item should be disabled as it is already on the canvas
    cy.get('[data-cy="e2e-location-item"]').as('locationToolboxItem');
    cy.get('@locationToolboxItem').should('exist');
    cy.get('@locationToolboxItem').should('have.attr', 'disabled');

    cy.get('[data-cy="e2e-form-fields"]').within(() => {
      cy.contains('Location').should('exist');
      cy.contains('Location').click();
    });

    // Title should not be present or editable
    cy.get('#e2e-title-multiloc').should('not.exist');

    cy.get('[data-cy="e2e-more-field-actions"]').eq(4).click({ force: true });
    cy.get('.e2e-more-actions-list button').contains('Delete').click();

    // The location tool box item should be enabled as it has been removed from the canvas
    cy.get('@locationToolboxItem').should('not.have.attr', 'disabled');

    // Check to see that location is removed from the canvas
    cy.get('[data-cy="e2e-form-fields"]').within(() => {
      cy.contains('Location').should('not.exist');
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
    cy.get('#e2e-idea-description-input .ql-editor').type(description);
    cy.get('#e2e-idea-description-input .ql-editor').contains(description);

    // Go to the next page of the idea form
    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();

    // Go to the page that initially had the location field
    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();

    cy.get('.e2e-idea-form-location-input-field input').should('not.exist');
  });
});
