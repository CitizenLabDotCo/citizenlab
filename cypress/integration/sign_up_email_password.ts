import { randomString, randomEmail } from '../support/commands';

describe('Sign up - Email + password step', () => {
  beforeEach(() => {
    cy.goToLandingPage();
    cy.get('#e2e-navbar-signup-menu-item').click();
    cy.get('#e2e-sign-up-container');
  });

  it('has a working first name field', () => {
    cy.get('#firstName').type('test').should('have.value', 'test');
  });

  it('shows an error when no first name is provided', () => {
    cy.get('#e2e-signup-password-button').click();
    cy.get('#e2e-firstName-container .e2e-error-message').should(
      'contain',
      'This cannot be empty'
    );
  });

  it('has a working last name field', () => {
    cy.get('#lastName').type('test').should('have.value', 'test');
  });

  it('shows an error when no last name is provided', () => {
    cy.get('#e2e-signup-password-button').click();
    cy.get('#e2e-lastName-container .e2e-error-message').should(
      'contain',
      'This cannot be empty'
    );
  });

  it('has a working email field', () => {
    cy.get('#email').type('test').should('have.value', 'test');
  });

  it('shows an error when no email is provided', () => {
    cy.get('#e2e-signup-password-button').click();
    cy.get('#e2e-email-container .e2e-error-message').should(
      'contain',
      'This cannot be empty'
    );
  });

  it('shows an error when no valid email is provided', () => {
    cy.get('#email').type('test');
    cy.get('#e2e-signup-password-button').click();
    cy.get('#e2e-email-container .e2e-error-message').should(
      'contain',
      "This doesn't look like a valid email"
    );
  });

  it('has a working password field', () => {
    cy.get('#password')
      .type('democracy2.0')
      .should('have.value', 'democracy2.0');
  });

  it('shows an error when no password is provided', () => {
    cy.get('#e2e-login-with-email').click();
    cy.get('#e2e-signup-password-submit-button').click();
    cy.get('#e2e-password-container .e2e-error-message').should(
      'contain',
      'Your password needs to be at least 8 characters long.'
    );
  });

  it('shows an error when no valid password is provided', () => {
    cy.get('#password').type('test');
    cy.get('#e2e-signup-password-button').click();
    cy.get('#e2e-password-container .e2e-error-message').should(
      'contain',
      'The password must be at least 8 characters long'
    );
  });

  it('has working legal concerns checkboxes', () => {
    cy.get('.e2e-terms-and-conditions .e2e-checkbox')
      .click()
      .should('have.class', 'checked');
    cy.get('.e2e-privacy-checkbox .e2e-checkbox')
      .click()
      .should('have.class', 'checked');
  });

  it('shows an error when the terms and conditions checkbox is not checked', () => {
    cy.get('#e2e-signup-password-button').click();
    cy.get('#e2e-terms-and-conditions-container .e2e-error-message');
  });

  it('shows an error when the privacy checkbox is not checked', () => {
    cy.get('#e2e-signup-password-button').click();
    cy.get('#e2e-privacy-container .e2e-error-message');
  });

  it('signs up with valid credentials and navigates to the landing page', () => {
    const firstName = randomString();
    const lastName = randomString();
    const email = randomEmail();
    const password = randomString();

    cy.goToLandingPage();
    cy.get('#e2e-navbar-signup-menu-item').click();
    cy.get('#e2e-sign-up-container');
    cy.get('#firstName').type(firstName);
    cy.get('#lastName').type(lastName);
    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('.e2e-terms-and-conditions .e2e-checkbox').click();
    cy.get('.e2e-privacy-checkbox .e2e-checkbox').click();
    cy.get('#e2e-signup-password-button').click();
    cy.get('#e2e-signup-success-container', { timeout: 20000 });
    cy.get('.e2e-signup-success-close-button').click();
    cy.get('#e2e-sign-up-in-modal').should('not.exist');
    cy.get('#e2e-user-menu-container');
  });
});
