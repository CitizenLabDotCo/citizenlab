import { logIn } from '../../support/auth';
import { randomString } from '../../support/commands';

const adminEmail = 'admin@govocal.com';

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
    cy.dataCy('email-flow-start').get('input[type="email"]').type(adminEmail);
    cy.dataCy('email-flow-start-continue-button').click();
    cy.get('#e2e-password-input').type('test').should('have.value', 'test');
  });

  it('shows an error when no email is provided', () => {
    cy.dataCy('email-flow-start-continue-button').click();

    cy.dataCy('email-flow-start-email-input').should('exist');
    cy.dataCy('email-flow-start-email-input').within(() => {
      cy.get('[data-testid="error-message-text"]').should('exist');
    });
  });

  it('shows an error when no valid email is provided', () => {
    cy.dataCy('email-flow-start').get('input[type="email"]').type('test@x');
    cy.dataCy('email-flow-start-continue-button').click();

    cy.dataCy('email-flow-start-email-input').should('exist');
    cy.dataCy('email-flow-start-email-input').within(() => {
      cy.get('[data-testid="error-message-text"]').should('exist');
    });
  });

  it('shows an error when no password is provided', () => {
    cy.dataCy('email-flow-start').get('input[type="email"]').type(adminEmail);
    cy.dataCy('email-flow-start-continue-button').click();

    cy.get('#e2e-password-submit > button').click({ force: true });

    cy.get('.e2e-error-message').should('exist');
  });

  it('has a working link to the password recovery page', () => {
    cy.dataCy('email-flow-start').get('input[type="email"]').type(adminEmail);
    cy.dataCy('email-flow-start-continue-button').click();
    cy.get('a[href="/en/password-recovery"]').click();
    cy.location('pathname').should('eq', '/en/password-recovery');
  });

  it('logs in with valid credentials', () => {
    const password = 'democracy2.0';
    logIn(cy, adminEmail, password);
    cy.get('#e2e-user-menu-container');
  });

  it('shows an error when trying to log in with invalid credentials', () => {
    const password = randomString();
    logIn(cy, adminEmail, password);

    cy.get('.e2e-error-message').should(
      'contain',
      'The provided information is not correct'
    );
  });
});
