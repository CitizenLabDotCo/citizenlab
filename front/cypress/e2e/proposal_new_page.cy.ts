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
    cy.acceptCookies();
  });

  it('shows an error when no title is provided', () => {
    cy.get('#e2e-initiative-publish-button').click();
    cy.get('#e2e-initiative-form-title-section .e2e-error-message').contains(
      'Please provide a title'
    );
  });

  it('shows an error when no description is provided', () => {
    cy.get('#e2e-initiative-publish-button').click();
    cy.get(
      '#e2e-initiative-form-description-section .e2e-error-message'
    ).contains('Please provide a description');
  });

  it('shows an error when the title is less than 10 characters long', () => {
    cy.get('#e2e-initiative-form-title-section input')
      .type(randomString(9))
      .blur();
    cy.get('.e2e-error-message').contains(
      'The provided title is too short. Please add a title that is between 10 and 72 characters long.'
    );
  });

  it('shows an error when the description is less than 30 characters long', () => {
    cy.get('#e2e-initiative-form-description-section .ql-editor')
      .type(randomString(9))
      .blur()
      .wait(200);
    cy.get('#e2e-initiative-publish-button').click();
    cy.get(
      '#e2e-initiative-form-description-section .e2e-error-message'
    ).contains('at least 30 characters long');
  });

  it('has a working initiative form', () => {
    const initiativeTitle = randomString(10);
    const initiativeContent = randomString(30);

    cy.get('#e2e-initiative-form-title-section input').as('titleInput');
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
    cy.get('.e2e-initiative-location-input #position').type(
      'Boulevard Anspach Brussels'
    );
    cy.wait(5000);
    cy.get('.e2e-initiative-location-input #position').type('{enter}');

    // verify that image and file upload components are present
    cy.get('#e2e-iniatiative-banner-dropzone');
    cy.get('#local_initiative_files');

    // add an image
    cy.get('#e2e-iniatiative-img-dropzone input').attachFile('testimage.png');

    // check that the base64 image was added to the dropzone component
    cy.get('#e2e-iniatiative-img-dropzone input').should('have.length', 0);

    // save the form
    cy.get('#e2e-initiative-publish-button').click();
    cy.get('#e2e-accept-disclaimer').click();

    // verify redirect to the newly created initiative page
    cy.location('pathname').should('eq', `/en/initiatives/${initiativeTitle}`);
    cy.get('.e2e-modal-close-button').click();
    // verify the content of the newly created initiative page
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
