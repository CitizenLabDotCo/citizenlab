import { randomString, randomEmail } from '../support/commands';

describe('Idea form page', () => {
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
    cy.apiSignup(firstName, lastName, email, password);
    cy.apiLogin(email, password).then((user) => {
      jwt = user.body.jwt;
      return cy.getProjectBySlug('an-idea-bring-it-to-your-council');
    }).then((project) => {
      projectId = project.body.data.id;
      return cy.apiCreateIdea(projectId, ideaTitle, ideaContent, undefined, undefined, jwt);
    }).then((idea) => {
      ideaId = idea.body.data.id;
      ideaSlug = idea.body.data.attributes.slug;
    });
  });

  beforeEach(() => {
    cy.login(email, password);
    cy.visit(`/ideas/edit/${ideaId}`);
    cy.acceptCookies();
    cy.get('#e2e-idea-edit-page');
  });

  it('has a working idea edit form', () => {
    cy.get('#e2e-idea-edit-page');
    cy.get('#idea-form');
    cy.get('#e2e-idea-title-input #title').as('titleInput');
    cy.get('#e2e-idea-description-input .ql-editor').as('descriptionInput');

    // check initial values
    cy.get('@titleInput').should('have.value', ideaTitle);
    cy.get('@descriptionInput').contains(ideaContent);

    // edit title and description
    cy.get('@titleInput').clear().type(newIdeaTitle);
    cy.get('@descriptionInput').clear().type(newIdeaContent);

    // verify the new values
    cy.get('@titleInput').should('have.value', newIdeaTitle);
    cy.get('@descriptionInput').contains(newIdeaContent);

    // add a topic
    cy.get('.e2e-idea-form-topics-multiple-select-box input').click({ force: true }).type('Education and youth{enter}', { force: true });

    // verify that the topic has been selected
    cy.get('.e2e-idea-form-topics-multiple-select-box').contains('Education and youth');

    // add a location
    cy.get('.e2e-idea-form-location-input-field input').type('antwerp{enter}');
    cy.get('.e2e-idea-form-location-input-field #PlacesAutocomplete__autocomplete-container div').first().click();

    // verify location
    cy.get('.e2e-idea-form-location-input-field input').its('val').should('not.equal', 'antwerp');
    cy.get('.e2e-idea-form-location-input-field input').its('val').should('not.be.empty');

    // verify that image and file upload components are present
    cy.get('#e2e-idea-image-upload');
    cy.get('#e2e-idea-file-upload');

    // save the form
    cy.get('#e2e-idea-edit-save-button').click();
    cy.wait(3000);

    // verify updated idea page
    cy.location('pathname').should('eq', `/en-GB/ideas/${ideaSlug}`);
    cy.get('#e2e-idea-show');
    cy.get('#e2e-idea-show').find('.e2e-ideatitle').contains(newIdeaTitle);
    cy.get('#e2e-idea-show').find('#e2e-idea-description').contains(newIdeaContent);
    cy.get('#e2e-idea-show').find('#e2e-idea-topics').find('.e2e-idea-topic').should('have.length', 1).contains('Education and youth');
    cy.get('#e2e-idea-show').find('#e2e-map-toggle').contains('Antwerpen, Belgium');
    cy.get('#e2e-idea-show').find('.e2e-author-link .e2e-username').contains(`${firstName} ${lastName}`);
    cy.get('#e2e-idea-show').find('.e2e-idea-last-modified-button').contains('Last modified');

    // verify modal with edit changelog
    cy.get('#e2e-idea-show').find('.e2e-idea-last-modified-button').click();
    cy.wait(1000);
    cy.get('.e2e-activities-changelog').find('.e2e-activities-changelog-entry').should('have.length', 2);
  });

  after(() => {
    cy.apiRemoveIdea(ideaId);
  });

});
