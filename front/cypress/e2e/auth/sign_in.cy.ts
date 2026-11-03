import { logIn } from '../../support/auth';
import { randomEmail, randomString } from '../../support/commands';
import { fakeSSOAuth } from './utils';

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

describe('Sign in with SSO to an existing email account', () => {
  // Signed up with email (POST /users + email confirmation), then logged in with
  // an SSO that returns the same, verified email. The existing account is matched,
  // and the fields the SSO method locks must be filled in, custom fields included.
  it('fills in the locked attributes and custom fields returned by the SSO', () => {
    const email = randomEmail();
    cy.apiSignup(randomString(), randomString(), email, randomString());

    cy.goToLandingPage();
    cy.get('#e2e-navbar-login-menu-item').click();
    fakeSSOAuth(cy, 'john_doe', { email });

    cy.get('#e2e-user-menu-container').should('exist');

    cy.getAuthUser().then((user) => {
      const attributes = user.body.data.attributes;
      expect(attributes.email).to.eq(email);
      expect(attributes.verified).to.eq(true);
      expect(attributes.first_name).to.eq('John');
      expect(attributes.last_name).to.eq('Doe');
      expect(attributes.custom_field_values).to.include({
        gender: 'male',
        birthyear: 2000,
      });
    });
  });
});
