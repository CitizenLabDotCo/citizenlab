import { randomString, randomEmail } from '../support/commands';

describe('Initiative new page', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  const initiativeTitle = randomString(40);
  const initiativeContent = randomString(60);

  before(() => {
    cy.apiSignup(firstName, lastName, email, password);
  });

  beforeEach(() => {
    cy.login(email, password);
    cy.visit('/initiatives/new');
    cy.wait(1000);
    cy.acceptCookies();
    cy.get('#initiative-form');
  });

  it('shows an error when no title is provided', () => {
    cy.get('#e2e-initiative-title-input-en-GB').click();
    cy.get('.e2e-submit-form').should('have.class', 'disabled').click();

    cy.get('.e2e-error-message').should('contain', 'Please provide a title');
  });

  it('shows an error when no description is provided', () => {
    cy.get('#body .ql-editor').click();
    cy.get('.e2e-submit-form').should('have.class', 'disabled').click();

    cy.get('.e2e-error-message').should('contain', 'Please provide a description');
  });

  it('shows an error when the title is less than 10 characters long', () => {
    cy.get('#e2e-initiative-title-input-en-GB').type(randomString(9));
    cy.get('.e2e-submit-form').should('have.class', 'disabled').click().wait(200);
    cy.get('.e2e-error-message').should('contain', 'The initiative title must be at least 10 characters long');
  });

  it('shows an error when the description is less than 300 characters long ()', () => {
    cy.get('#body .ql-editor').type(randomString(9));
    cy.get('.e2e-submit-form').should('have.class', 'disabled').click().wait(200);
    cy.get('.e2e-error-message').should('contain', 'The initiative description must be at least 500 characters long');
  });

  it('has a working initiative form', () => {
    cy.get('#e2e-initiative-title-input-en-GB').as('titleInput');
    cy.get('#body .ql-editor').as('descriptionInput');

    // add title and description
    cy.get('@titleInput').type(initiativeTitle);
    cy.get('@descriptionInput').type(initiativeContent);

    // verify the values
    cy.get('@titleInput').should('have.value', initiativeTitle);
    cy.get('@descriptionInput').contains(initiativeContent);

    // add a topic
    cy.get('.e2e-topics-picker').find('button').eq(3).click();

    // verify that the topic has been selected
    cy.get('.e2e-topics-picker').find('button.selected').should('have.length', 1);

    // add a location
    cy.get('.e2e-initiative-location-input input').type('antwerp{enter}');
    cy.get('.e2e-initiative-location-input #PlacesAutocomplete__autocomplete-container div').first().click();

    // verify location
    cy.get('.e2e-initiative-location-input input').its('val').should('not.equal', 'antwerp');
    cy.get('.e2e-initiative-location-input input').its('val').should('not.be.empty');

    // verify that image and file upload components are present
    cy.get('#iniatiative-banner-dropzone');
    cy.get('#e2e-initiative-file-upload');

    // add an inamge
    cy.fixture('cy.png', 'base64').then(fileContent => {
      cy.get('#iniatiative-img-dropzone').upload(
        { fileContent, fileName: 'cy.png', mimeType: 'image/png' },
        { subjectType: 'drag-n-drop' },
      );
      cy.get('#iniatiative-img-dropzone input').should('have.length', 0);
    });

    // save the form
    cy.get('.e2e-initiative-publish-button').click();
    cy.wait(3000);

    // verify the content of the newly created initiative page
    // cy.location('pathname').should('eq', `/en-GB/initiatives/${initiativeTitle}`);
    // cy.get('#e2e-initiative-show');
    // cy.get('#e2e-initiative-show').find('.e2e-initiativetitle').contains(initiativeTitle);
    // cy.get('#e2e-initiative-show').find('#e2e-initiative-description').contains(initiativeContent);
    // cy.get('#e2e-initiative-show').find('#e2e-initiative-topics').find('.e2e-initiative-topic').should('have.length', 1);
    // cy.get('#e2e-initiative-show').find('#e2e-map-toggle').contains('Antwerpen, Belgium');
    // cy.get('#e2e-initiative-show').find('.e2e-initiative-author-link .e2e-username').contains(`${firstName} ${lastName}`);
  });

});
