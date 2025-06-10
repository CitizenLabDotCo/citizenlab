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

    // Visit the project page and accept cookies. This is needed because the cookie banner is not interactive on the input form
    cy.visit(`/projects/${projectSlug}`);
    cy.acceptCookies();

    // Check that the location field is present on the idea form before turning it off
    cy.visit(`/projects/${projectSlug}/ideas/new?phase_id=${phaseId}`);

    // Fill in the title and description since these are required
    cy.get('#title_multiloc ').type(title, { delay: 0 });
    cy.get('#title_multiloc ').should('contain.value', title);

    cy.dataCy('e2e-next-page').should('be.visible').click();

    cy.dataCy('e2e-page-number-2').should('exist');

    cy.get('#body_multiloc .ql-editor').type(description, {
      delay: 0,
    });
    cy.get('#body_multiloc .ql-editor').contains(description);
    cy.wait(1000);

    // Go to the next page of the idea form
    cy.dataCy('e2e-next-page').should('be.visible').click();

    cy.dataCy('e2e-page-number-3').should('exist');

    // Location field is on next page
    cy.dataCy('e2e-next-page').should('be.visible').click();

    cy.dataCy('e2e-page-number-4').should('exist');
    cy.get('.e2e-idea-form-location-input-field', { timeout: 10000 }).should(
      'exist'
    );
    cy.get('.e2e-idea-form-location-input-field input').should('exist');

    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/form`);
    cy.dataCy('e2e-edit-input-form').click();

    // The location tool box item should be disabled as it is already on the canvas
    cy.dataCy('e2e-location-item').as('locationToolboxItem');
    cy.get('@locationToolboxItem').should('exist');
    cy.get('@locationToolboxItem').should('have.attr', 'disabled');

    cy.dataCy('e2e-form-fields').within(() => {
      cy.contains('Location').should('exist');
      cy.contains('Location').click();
    });

    // Title should not be present or editable
    cy.get('#e2e-title-multiloc').should('not.exist');

    cy.dataCy('e2e-more-field-actions').eq(4).click({ force: true });
    cy.get('.e2e-more-actions-list button').contains('Delete').click();

    // The location tool box item should be enabled as it has been removed from the canvas
    cy.get('@locationToolboxItem').should('not.have.attr', 'disabled');

    // Check to see that location is removed from the canvas
    cy.dataCy('e2e-form-fields').within(() => {
      cy.contains('Location').should('not.exist');
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

    // Go to the next page of the idea form
    cy.dataCy('e2e-next-page').should('be.visible').click();

    // Go to the page that initially had the location field
    cy.dataCy('e2e-next-page').should('be.visible').click();

    cy.get('.e2e-idea-form-location-input-field input').should('not.exist');
  });
});
