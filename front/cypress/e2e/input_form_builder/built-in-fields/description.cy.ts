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
    cy.visit(`admin/projects/${projectId}/form`);
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

  it('allows user to turn on / off the body default field and make it optional but not edit its field title', () => {
    // Go to the form builder
    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/form/edit`);

    // The body tool box item should be disabled as it is already on the canvas
    cy.dataCy('e2e-body-multiloc-item').as('bodyToolboxItem');
    cy.get('@bodyToolboxItem').should('exist');
    cy.get('@bodyToolboxItem').should('have.attr', 'disabled');

    cy.dataCy('e2e-form-fields').within(() => {
      cy.contains('Description').should('exist');
      cy.contains('Description').click();
    });

    // Title should not be present or editable
    cy.get('#e2e-title-multiloc').should('not.exist');

    // Remove the "Description" field
    cy.dataCy('e2e-form-fields')
      .find('[data-cy="e2e-field-row"]')
      .filter(':contains("Question"):contains("Description")')
      .find('[data-cy="e2e-more-field-actions"]')
      .click();
    cy.get('.e2e-more-actions-list button').contains('Delete').click();

    // The body tool box item should be enabled as it has been removed from the canvas
    cy.get('@bodyToolboxItem').should('not.have.attr', 'disabled');

    // Check to see that body field is removed from the canvas
    cy.dataCy('e2e-form-fields').within(() => {
      cy.contains('Description').should('not.exist');
    });

    // Remove the "Description" page
    cy.dataCy('e2e-form-fields')
      .find('[data-cy="e2e-field-row"]')
      .contains('Tell us more')
      .parents('[data-cy="e2e-field-row"]')
      .find('[data-cy="e2e-more-field-actions"]')
      .click();
    cy.get('.e2e-more-actions-list button').contains('Delete').click();

    // Check to see that body page is removed from the canvas
    cy.dataCy('e2e-form-fields').within(() => {
      cy.contains('Tell us more').should('not.exist');
    });

    // Save the form
    cy.get('form').submit();
    // Should show success message on saving
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Publish an idea without description
    const title1 = randomString(12);
    cy.visit(`/projects/${projectSlug}/ideas/new?phase_id=${phaseId}`);

    // Fill in the title since these are required
    cy.get('#title_multiloc ').type(title1, { delay: 0 });
    cy.get('#title_multiloc ').should('contain.value', title1);

    // The description field should not be present
    cy.dataCy('e2e-next-page').should('be.visible').click();
    cy.wait(1000);
    cy.get('#ql-editor-toolbar-body_multiloc').should('not.exist');

    // Submit
    cy.dataCy('e2e-next-page').should('be.visible').click();
    cy.dataCy('e2e-submit-form').click({ force: true });

    // Add back the description field and make it optional
    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/form/edit`);
    cy.addItemToFormBuilder('#toolbox_body_multiloc');
    cy.get('#e2e-required-toggle').find('input').click({ force: true });

    // The body tool box item should be disabled as it is back on the canvas
    cy.dataCy('e2e-body-multiloc-item').as('bodyToolboxItem');
    cy.get('@bodyToolboxItem').should('exist');
    cy.get('@bodyToolboxItem').should('have.attr', 'disabled');

    // Save the form
    cy.get('form').submit();
    // Should show success message on saving
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Publish an idea without description
    const title2 = randomString(12);
    cy.visit(`/projects/${projectSlug}/ideas/new?phase_id=${phaseId}`);

    // Fill in the title since these are required
    cy.get('#title_multiloc ').type(title2, { delay: 0 });
    cy.get('#title_multiloc ').should('contain.value', title2);

    // The description field should be present
    cy.dataCy('e2e-next-page').should('be.visible').click();
    cy.dataCy('e2e-next-page').should('be.visible').click();
    cy.get('#ql-editor-toolbar-body_multiloc').should('exist');

    // Submit
    cy.dataCy('e2e-submit-form').click({ force: true });
  });
});
