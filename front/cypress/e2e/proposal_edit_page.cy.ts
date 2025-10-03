import { randomString, randomEmail } from '../support/commands';
import moment = require('moment');

describe('Proposal edit page', () => {
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString();
  const projectDescription = randomString();
  const oldTitle = randomString(40);
  const newTitle = randomString(40);
  const ideaContent = randomString(60);
  const locationGeoJSON = {
    type: 'Point',
    coordinates: [4.351710300000036, 50.8503396],
  };
  const locationDescription = 'Brussel, België';
  const extraFieldTitle = randomString();
  const extraFieldAnswer = randomString();
  let projectId: string;
  let phaseId: string;
  let inputId: string;
  let inputSlug: string;

  beforeEach(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
    cy.setAdminLoginCookie();

    // Create proposals project
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
      // projectSlug = project.body.data.attributes.slug;
      return cy
        .apiCreatePhase({
          projectId: projectId,
          title: 'Proposals',
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          participationMethod: 'proposals',
          canPost: true,
          canComment: true,
          canReact: true,
        })
        .then((phase) => {
          phaseId = phase.body.data.id;
          // Create a proposal with location
          return cy
            .apiCreateIdea({
              projectId,
              ideaTitle: oldTitle,
              ideaContent: ideaContent,
              locationGeoJSON,
              locationDescription,
            })
            .then((idea) => {
              inputId = idea.body.data.id;
              inputSlug = idea.body.data.attributes.slug;
            });
        });
    });
  });

  it('edit a proposal after form changes while adding an image and cosponsors', () => {
    cy.intercept('GET', `**/ideas/${inputSlug}**`).as('idea');

    // Check original values
    cy.visit(`/ideas/${inputSlug}`);
    cy.get('#e2e-idea-show');
    cy.get('#e2e-idea-title').should('exist').contains(oldTitle);
    cy.get('#e2e-idea-description').should('exist').contains(ideaContent);
    cy.get('#e2e-idea-location-map').should('exist');

    // Edit input form
    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/form/edit`);
    // Delete the Details page
    cy.dataCy('e2e-form-fields')
      .contains('Details')
      .parents('[data-cy="e2e-field-row"]')
      .find('[data-cy="e2e-more-field-actions"]')
      .click();
    cy.get('.e2e-more-actions-list button').contains('Delete').click();
    // Delete the Location field
    cy.dataCy('e2e-form-fields')
      .contains('Location')
      .parents('[data-cy="e2e-field-row"]')
      .find('[data-cy="e2e-more-field-actions"]')
      .click();
    cy.get('.e2e-more-actions-list button').contains('Delete').click();
    cy.dataCy('e2e-confirm-delete-location-field').should('be.visible').click();

    // Add an extra field
    cy.addItemToFormBuilder('#toolbox_text');
    cy.get('#e2e-title-multiloc').type(extraFieldTitle, {
      force: true,
      delay: 0,
    });
    // Save the form
    cy.get('form').submit();
    cy.wait(1000);

    // Edit proposal
    cy.visit(`/ideas/edit/${inputId}`);

    cy.wait('@idea');
    cy.get('#e2e-idea-edit-page');
    cy.get('#idea-form').should('exist');

    // Edit title
    cy.get('#title_multiloc ').as('titleInput');
    cy.get('@titleInput').should('exist');
    cy.get('@titleInput').should('have.value', oldTitle);
    cy.wait(1000); // So typing the title doesn't get interrupted
    cy.get('@titleInput')
      .clear()
      .should('exist')
      .should('not.be.disabled')
      .type(newTitle, { delay: 0 });
    cy.get('@titleInput').should('exist');
    cy.get('@titleInput').should('contain.value', newTitle);

    // Go to body page
    cy.dataCy('e2e-next-page').should('be.visible').click();

    // Go to uploads page and add an image
    cy.dataCy('e2e-next-page').should('be.visible').click();
    cy.get('#e2e-idea-image-upload input').attachFile('icon.png');
    cy.wait(1000);
    // check that the base64 image was added to the dropzone component
    cy.get('#e2e-idea-image-upload input').should('have.length', 0);
    // Check that the tags field was not removed
    cy.get('.e2e-topics-picker').should('exist');
    // Answer the extra field
    cy.contains(extraFieldTitle).should('exist');
    cy.get(`*[id^="${extraFieldTitle}"]`).type(extraFieldAnswer, {
      force: true,
    });

    // Submit
    cy.dataCy('e2e-submit-form').click();
    cy.get('#e2e-accept-disclaimer').click();
    cy.wait(1000);

    // Check new values
    cy.visit(`/ideas/${inputSlug}`);
    cy.get('#e2e-idea-show');
    cy.get('#e2e-idea-title').should('exist').contains(newTitle);
    cy.get('#e2e-idea-description').should('exist').contains(ideaContent);
    cy.get('#e2e-idea-location-map').should('not.exist');
  });
});
