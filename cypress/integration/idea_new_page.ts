import { randomString, randomEmail } from '../support/commands';

describe('Idea new page', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  const ideaTitle = randomString(40);
  const ideaContent = randomString(60);

  before(() => {
    cy.apiSignup(firstName, lastName, email, password);
  });

  beforeEach(() => {
    cy.login(email, password);
    cy.visit('/projects/an-idea-bring-it-to-your-council/ideas/new');
    cy.wait(1000);
    cy.acceptCookies();
  });

  it('shows an error when no title is provided', () => {
    cy.get('#idea-form');
    cy.get('.e2e-submit-idea-form').click();
    cy.get('#e2e-idea-title-input .e2e-error-message').should('contain', 'Please provide a title');
  });

  it('shows an error when no description is provided', () => {
    cy.get('#idea-form');
    cy.get('.e2e-submit-idea-form').click();
    cy.get('#e2e-idea-description-input .e2e-error-message').should('contain', 'Please provide a description');
  });

  it('shows an error when the title is less than 10 characters long', () => {
    cy.get('#idea-form');
    cy.get('#e2e-idea-title-input #title').type(randomString(9));
    cy.get('.e2e-submit-idea-form').click();
    cy.get('#e2e-idea-title-input .e2e-error-message').should('contain', 'The idea title must be at least 10 characters long');
  });

  it('shows an error when the description is less than 30 characters long', () => {
    cy.get('#idea-form');
    cy.get('#e2e-idea-description-input .ql-editor').type(randomString(20));
    cy.get('.e2e-submit-idea-form').click();
    cy.get('#e2e-idea-description-input .e2e-error-message').should('contain', 'The idea description must be at least 30 characters long');
  });

  it('has a working idea form', () => {
    cy.get('#e2e-idea-new-page');
    cy.get('#idea-form');

    // add a title and description
    cy.get('#e2e-idea-title-input #title').type(ideaTitle);
    cy.get('#e2e-idea-description-input .ql-editor').type(ideaContent);

    // verify the title and description
    cy.get('#e2e-idea-title-input #title').should('have.value', ideaTitle);
    cy.get('#e2e-idea-description-input .ql-editor').contains(ideaContent);

    // add a topic
    cy.get('.e2e-topics-picker').find('button').eq(3).click();

    // verify that the topic has been selected
    cy.get('.e2e-topics-picker').find('button.selected').should('have.length', 1);

    // add a location
    cy.get('.e2e-idea-form-location-input-field input').type('antwerp{enter}');
    cy.get('.e2e-idea-form-location-input-field #PlacesAutocomplete__autocomplete-container div').first().click();

    // verify the location
    cy.get('.e2e-idea-form-location-input-field input').its('val').should('not.equal', 'antwerp');
    cy.get('.e2e-idea-form-location-input-field input').its('val').should('not.be.empty');

    // verify that image and file upload components are present
    cy.get('#e2e-idea-image-upload');
    cy.get('#e2e-idea-file-upload');

    // save the form
    cy.get('.e2e-submit-idea-form').click();
    cy.wait(3000);

    // verify the content of the newly created idea page
    cy.location('pathname').should('eq', `/en-GB/ideas/${ideaTitle}`);
    cy.get('#e2e-idea-show');
    cy.get('#e2e-idea-show').find('.e2e-ideatitle').contains(ideaTitle);
    cy.get('#e2e-idea-show').find('#e2e-idea-description').contains(ideaContent);
    cy.get('#e2e-idea-show').find('#e2e-idea-topics').find('.e2e-idea-topic').should('have.length', 1);
    cy.get('#e2e-idea-show').find('#e2e-map-toggle').contains('Antwerpen, Belgium');
    cy.get('#e2e-idea-show').find('.e2e-author-link .e2e-username').contains(`${firstName} ${lastName}`);
  });

});
