import { randomString } from '../support/commands';

describe('Idea form page', () => {
  beforeEach(() => {
    cy.visit('/projects/an-idea-bring-it-to-your-council/ideas/new');
    cy.acceptCookies();
  });

  it('shows the page', () => {
    cy.get('.e2e-idea-form-page');
  });

  it('shows the idea form', () => {
    cy.get('#idea-form');
  });

  it('has a working title field', () => {
    cy.get('#title').type('test').should('have.value', 'test');
  });

  it('has a working description field', () => {
    cy.get('.ql-editor').type('test').should('contain', 'test');
  });

  it('has a working topics select box', () => {
    cy.get('.e2e-idea-form-topics-multiple-select-box input').click({ force: true }).type('Education and youth{enter}', { force: true });
    cy.get('.e2e-idea-form-topics-multiple-select-box').contains('Education and youth');
  });

  it('has a working location field', () => {
    cy.get('.e2e-idea-form-location-input-field input').type('antwerp{enter}');
    cy.get('.e2e-idea-form-location-input-field #PlacesAutocomplete__autocomplete-container div').first().click();
    cy.get('.e2e-idea-form-location-input-field input').its('val').should('not.equal', 'antwerp');
    cy.get('.e2e-idea-form-location-input-field input').its('val').should('not.be.empty');
  });

  it('shows an error when no title is provided', () => {
    cy.get('.e2e-submit-idea-form').click();
    cy.get('.e2e-error-message').should('contain', 'Please provide a title');
  });

  it('shows an error when no description is provided', () => {
    cy.get('.e2e-submit-idea-form').click();
    cy.get('.e2e-error-message').should('contain', 'Please provide a description');
  });

  it('creates an idea when submitting the form with a title and description, and redirects to the sign-in form', () => {
    const ideaTtle = randomString();
    const ideaDescription = randomString(40);

    cy.get('#title').type(ideaTtle);
    cy.get('.ql-editor').type(ideaDescription);
    cy.get('.e2e-submit-idea-form').click();
    cy.wait(1000);
    cy.get('.e2e-lazy-idea-flow-sign-in-form');
    cy.request({
      method: 'GET',
      url: `/web_api/v1/ideas/by_slug/${ideaTtle}`
    });
  });
});
