import { randomString, randomEmail } from '../support/commands';

describe('Sign in page', () => {
  beforeEach(() => {
    cy.visit('/sign-in');
    cy.get('#e2e-sign-up-in-page');
    cy.get('#e2e-sign-in-email-password-container');
  });

  it('has a working email field', () => {
    cy.get('#email').type('test').should('have.value', 'test');
  });

  it('has a working password field', () => {
    cy.get('#password').type('test').should('have.value', 'test');
  });

  it('shows an error when no email is provided', () => {
    cy.get('.e2e-submit-signin').click();
    cy.get('.e2e-error-message').should('contain', 'This cannot be empty');
  });

  it('shows an error when no valid email is provided', () => {
    cy.get('#email').type('test');
    cy.get('.e2e-submit-signin').click();
    cy.get('.e2e-error-message').should('contain', 'This cannot be empty');
  });

  it('shows an error when no password is provided', () => {
    cy.get('.e2e-submit-signin').click();
    cy.get('.e2e-error-message').should('contain', 'This cannot be empty');
  });

  it('has a working link to the password recovery page', () => {
    cy.get('.e2e-password-recovery-link').click();
    cy.location('pathname').should('eq', '/en-GB/password-recovery');
  });

  it('has a working link to the sign up page', () => {
    cy.get('.e2e-sign-up-link').click();
    cy.location('pathname').should('eq', '/en-GB/sign-up');
  });

  it('logs in with valid credentials', () => {
    const email = 'admin@citizenlab.co';
    const password = 'testtest';

    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('.e2e-submit-signin').click();
    cy.location('pathname').should('eq', '/en-GB/');
    cy.get('#e2e-landing-page');
  });

  it('shows an error when trying to log in with invalid credentials', () => {
    const email = randomEmail();
    const password = randomString();

    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('.e2e-submit-signin').click();
    cy.get('.e2e-error-message').should('contain', 'The provided information is not correct');
  });
});
