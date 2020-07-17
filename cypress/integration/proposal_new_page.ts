import { randomString, randomEmail } from '../support/commands';

describe('Initiative new page', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();

  before(() => {
    cy.apiSignup(firstName, lastName, email, password);
  });

  beforeEach(() => {
    cy.setLoginCookie(email, password);
    cy.visit('/initiatives/new');
    cy.get('#initiative-form');
    cy.acceptCookies();
  });

  it('shows an error when no title is provided', () => {
    cy.get('.e2e-initiative-publish-button').find('.e2e-submit-form').click();
    cy.get('#e2e-initiative-form-title-section .e2e-error-message').contains(
      'Please provide a title'
    );
  });

  it('shows an error when no description is provided', () => {
    cy.get('.e2e-initiative-publish-button').find('.e2e-submit-form').click();
    cy.get(
      '#e2e-initiative-form-description-section .e2e-error-message'
    ).contains('Please provide a description');
  });

  it('shows an error when the title is less than 10 characters long', () => {
    cy.get('#e2e-initiative-title-input').type(randomString(9)).blur();
    cy.get('.e2e-initiative-publish-button').find('.e2e-submit-form').click();
    cy.get('#e2e-initiative-form-title-section .e2e-error-message').contains(
      'The proposal title must be at least 10 characters long'
    );
  });

  it('shows an error when the description is less than 300 characters long ()', () => {
    cy.get('#e2e-initiative-form-description-section .ql-editor')
      .type(randomString(9))
      .blur()
      .wait(200);
    cy.get('.e2e-initiative-publish-button').find('.e2e-submit-form').click();
    cy.get(
      '#e2e-initiative-form-description-section .e2e-error-message'
    ).contains('The proposal description must be at least 500 characters long');
  });

  it('has a working initiative form', () => {
    const initiativeTitle = randomString(40);
    const initiativeContent = randomString(501);

    cy.get('#e2e-initiative-title-input').as('titleInput');
    cy.get('#e2e-initiative-form-description-section .ql-editor').as(
      'descriptionInput'
    );

    // add title and description
    cy.get('@titleInput').type(initiativeTitle);
    cy.get('@descriptionInput').type(initiativeContent, { delay: 1 });

    // verify the values
    cy.get('@titleInput').should('contain.value', initiativeTitle);
    cy.get('@descriptionInput').contains(initiativeContent);

    // add a topic
    cy.get('.e2e-topics-picker').find('button').eq(3).click();

    // verify that the topic has been selected
    cy.get('.e2e-topics-picker')
      .find('button.selected')
      .should('have.length', 1);

    // add a location
    cy.get('.e2e-initiative-location-input input').type(
      'Boulevard Anspach Brussels{enter}'
    );
    cy.get(
      '.e2e-initiative-location-input #PlacesAutocomplete__autocomplete-container div'
    )
      .first()
      .click();
    cy.wait(500);
    cy.get('.e2e-initiative-location-input input').should(
      'contain.value',
      'Belgium'
    );

    // verify that image and file upload components are present
    cy.get('#e2e-iniatiative-banner-dropzone');
    cy.get('#e2e-initiative-file-upload');

    // add an image
    cy.fixture('cy.png', 'base64')
      .then((fileContent) => {
        return cy.get('#e2e-iniatiative-img-dropzone').upload(
          {
            fileContent,
            fileName: 'cy.png',
            mimeType: 'image/png',
          },
          {
            subjectType: 'drag-n-drop',
          }
        );
      })
      .then(() => {
        cy.get('#e2e-iniatiative-img-dropzone input').should('have.length', 0);

        // save the form
        cy.get('.e2e-initiative-publish-button .e2e-submit-form').click();

        // wait 3s for page redirection to finish
        cy.wait(3000);

        // verify the content of the newly created initiative page
        cy.location('pathname').should(
          'eq',
          `/en-GB/initiatives/${initiativeTitle}`
        );
        cy.get('#e2e-initiative-show');
        cy.get('#e2e-initiative-show')
          .find('#e2e-initiative-title')
          .contains(initiativeTitle);
        cy.get('#e2e-initiative-show')
          .find('#e2e-initiative-description')
          .contains(initiativeContent);
        cy.get('#e2e-initiative-show')
          .find('#e2e-initiative-topics')
          .find('.e2e-initiative-topic')
          .should('have.length', 1);
        cy.get('#e2e-initiative-show')
          .find('#e2e-map-toggle')
          .contains('Boulevard Anspach');
      });
  });
});
