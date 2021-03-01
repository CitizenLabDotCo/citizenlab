import { randomString, randomEmail } from '../support/commands';

describe('Idea edit page', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  const ideaTitle = randomString(40);
  const ideaContent = randomString(60);
  const newIdeaTitle = randomString(40);
  const newIdeaContent = randomString(60);
  let jwt: string;
  let projectId: string;
  let ideaId: string;
  let ideaSlug: string;

  before(() => {
    cy.apiSignup(firstName, lastName, email, password)
      .then(() => {
        return cy.apiLogin(email, password);
      })
      .then((user) => {
        jwt = user.body.jwt;
        return cy.getProjectBySlug('an-idea-bring-it-to-your-council');
      })
      .then((project) => {
        projectId = project.body.data.id;
        return cy.apiCreateIdea(
          projectId,
          ideaTitle,
          ideaContent,
          undefined,
          undefined,
          jwt
        );
      })
      .then((idea) => {
        ideaId = idea.body.data.id;
        ideaSlug = idea.body.data.attributes.slug;
        cy.wait(2000);
      });
  });

  it('has a working idea edit form', () => {
    cy.setLoginCookie(email, password);

    // check original values
    cy.visit(`/ideas/${ideaSlug}`);
    cy.get('#e2e-idea-show');
    cy.get('#e2e-idea-title').contains(ideaTitle);
    cy.get('#e2e-idea-description').contains(ideaContent);

    // go to form
    cy.visit(`/ideas/edit/${ideaId}`);
    cy.acceptCookies();

    cy.get('#e2e-idea-edit-page');
    cy.get('#idea-form', { timeout: 100000 });
    cy.get('#e2e-idea-title-input #title').as('titleInput');
    cy.get('#e2e-idea-description-input .ql-editor').as('descriptionInput');

    // check initial form values
    cy.get('@titleInput').should('contain.value', ideaTitle);
    cy.get('@descriptionInput').contains(ideaContent);

    // edit title and description
    cy.get('@titleInput').clear().type(newIdeaTitle);
    cy.get('@descriptionInput').clear().type(newIdeaContent);

    // verify the new values
    cy.get('@titleInput').should('contain.value', newIdeaTitle);
    cy.get('@descriptionInput').contains(newIdeaContent);

    // add a topic
    cy.get('.e2e-topics-picker').find('button').eq(3).click();

    // verify that the topic has been selected
    cy.get('.e2e-topics-picker')
      .find('button.selected')
      .should('have.length', 1);

    // add a location
    cy.get('.e2e-idea-form-location-input-field input').type(
      'Boulevard Anspach Brussels{enter}'
    );
    cy.get(
      '.e2e-idea-form-location-input-field #PlacesAutocomplete__autocomplete-container div'
    )
      .first()
      .click();
    cy.wait(500);
    cy.get('.e2e-idea-form-location-input-field input').should(
      'contain.value',
      'Belgium'
    );

    // verify that image and file upload components are present
    cy.get('#e2e-idea-image-upload');
    cy.get('#e2e-idea-file-upload');

    // save the form
    cy.get('#e2e-idea-edit-save-button').click();

    // verify updated idea page
    cy.location('pathname').should('eq', `/en/ideas/${ideaSlug}`);
    cy.get('#e2e-idea-show');
    cy.get('#e2e-idea-show #e2e-idea-title').contains(newIdeaTitle);
    cy.get('#e2e-idea-show #e2e-idea-description').contains(newIdeaContent);
    cy.get('#e2e-idea-show')
      .find('#e2e-idea-topics')
      .find('.e2e-idea-topic')
      .should('have.length', 1);
    cy.get('#e2e-idea-show #e2e-map-popup').contains('Boulevard Anspach');
    cy.get('#e2e-idea-show .e2e-author-link .e2e-username').contains(
      `${firstName} ${lastName}`
    );
  });

  after(() => {
    cy.apiRemoveIdea(ideaId);
  });
});
