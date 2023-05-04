import { randomString, randomEmail } from '../support/commands';

describe('Sign in page', () => {
  beforeEach(() => {
    cy.goToLandingPage();
    cy.get('#e2e-navbar-login-menu-item').click();
    cy.get('#e2e-authentication-modal').should('exist');
  });

  it('has a working email field', () => {
    cy.get('#email').type('test').should('have.value', 'test');
  });

  it('has a working password field', () => {
    cy.get('#password').type('test').should('have.value', 'test');
  });

  it('shows an error when no email is provided', () => {
    cy.get('#password').type('test');
    cy.get('#e2e-signin-password-submit-button').click();

    cy.get('#e2e-email-container').should('exist');
    cy.get('#e2e-email-container').within(() => {
      cy.get('[data-testid="error-message-text"]').should('exist');
    });
  });

  it('shows an error when no valid email is provided', () => {
    cy.get('#email').type('test@t');
    cy.get('#password').type('test');
    cy.get('#e2e-signin-password-submit-button').click();

    cy.get('#e2e-email-container').should('exist');
    cy.get('#e2e-email-container').within(() => {
      cy.get('[data-testid="error-message-text"]').should('exist');
    });
  });

  it('shows an error when no password is provided', () => {
    cy.get('#email').type('test@test.com');
    cy.get('#e2e-signin-password-submit-button').click();

    cy.get('#e2e-password-container').should('exist');
    cy.get('#e2e-password-container').within(() => {
      cy.get('[data-testid="error-message-text"]').should('exist');
    });
  });

  it('has a working link to the password recovery page', () => {
    cy.get('.e2e-password-recovery-link').click();
    cy.location('pathname').should('eq', '/en/password-recovery');
  });

  it('has a working link to the sign up flow', () => {
    cy.get('#e2e-goto-signup').click();
    cy.get('#e2e-sign-up-email-password-container');
  });

  it('logs in with valid credentials', () => {
    const email = 'admin@citizenlab.co';
    const password = 'democracy2.0';

    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('#e2e-signin-password-submit-button').click();
    cy.get('#e2e-user-menu-container');
  });

  it('shows an error when trying to log in with invalid credentials', () => {
    const email = randomEmail();
    const password = randomString();

    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('#e2e-signin-password-submit-button').click();
    cy.get('.e2e-error-message').should(
      'contain',
      'The provided information is not correct'
    );
  });
});
