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
    const title = randomString(12);
    const description = randomString(42);

    // Visit the project page and accept cookies. This is needed because the cookie banner is not interactive on the input form
    cy.visit(`/projects/${projectSlug}`);

    // Check that the tags field is present on the idea form before turning it off
    cy.visit(`/projects/${projectSlug}/ideas/new?phase_id=${phaseId}`);

    // Fill in the title since it is required
    cy.get('#title_multiloc ').type(title, { delay: 0 });
    cy.get('#title_multiloc ').should('contain.value', title);

    // Go to the next page of the input form
    cy.dataCy('e2e-next-page').should('be.visible').click();

    // Fill in the description since it is required
    cy.get('#body_multiloc .ql-editor').type(description);
    cy.get('#body_multiloc .ql-editor').contains(description);
    cy.wait(500);

    // Go to the next page of the idea form
    cy.dataCy('e2e-next-page').should('be.visible').click();

    // Tags are on page three
    cy.dataCy('e2e-next-page').should('be.visible').click();

    cy.get('.e2e-topics-picker').should('exist');

    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/form`);
    cy.dataCy('e2e-edit-input-form').click();

    // The tags tool box item should be disabled as it is already on the canvas
    cy.dataCy('e2e-topic_ids-item').as('tagsToolboxItem');
    cy.get('@tagsToolboxItem').should('exist');
    cy.get('@tagsToolboxItem').should('have.attr', 'disabled');

    cy.dataCy('e2e-form-fields').within(() => {
      cy.contains('Tags').should('exist');
      cy.contains('Tags').click();
    });

    // Title should not be present or editable
    cy.get('#e2e-title-multiloc').should('not.exist');

    // Find the row containing "Tags" and click its "more actions" button
    cy.dataCy('e2e-form-fields')
      .contains('Tags')
      .parents('[data-cy="e2e-field-row"]')
      .find('[data-cy="e2e-more-field-actions"]')
      .click();
    cy.get('.e2e-more-actions-list button').contains('Delete').click();

    // The tags tool box item should be enabled as it has been removed from the canvas
    cy.get('@tagsToolboxItem').should('not.have.attr', 'disabled');

    // Check to see that tags is removed from the canvas
    cy.dataCy('e2e-form-fields').within(() => {
      cy.contains('Tags').should('not.exist');
    });

    // Save the form
    cy.get('form').submit();
    // Should show success message on saving
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Fill in the form
    cy.visit(`/projects/${projectSlug}/ideas/new?phase_id=${phaseId}`);

    // Fill in the title and description since these are required
    cy.get('#title_multiloc ').type(title, { delay: 0 });
    cy.get('#title_multiloc ').should('contain.value', title);

    cy.dataCy('e2e-next-page').should('be.visible').click();

    cy.get('#body_multiloc .ql-editor').type(description);
    cy.get('#body_multiloc .ql-editor').contains(description);
    cy.wait(500);

    cy.dataCy('e2e-next-page').should('be.visible').click();

    // Tags was previously on page three so it should not be present
    cy.dataCy('e2e-next-page').should('be.visible').click();
    cy.get('.e2e-topics-picker').should('not.exist');
  });
});
