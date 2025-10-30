import { randomEmail } from '../../support/commands';
import { signUp, signUpEmailConformation } from '../../support/auth';

describe('Sign up - built in fields step', () => {
  beforeEach(() => {
    cy.goToLandingPage();
    cy.get('#e2e-navbar-login-menu-item').click();
    cy.get('#e2e-authentication-modal').should('exist');
  });

  it('has working fields', () => {
    signUpEmailConformation(cy);

    // first name field
    cy.get('#firstName').type('test').should('have.value', 'test');
    cy.get('#firstName').clear().should('have.value', '');

    // last name field
    cy.get('#lastName').type('test').should('have.value', 'test');
    cy.get('#lastName').clear().should('have.value', '');

    // password field
    cy.get('#password')
      .type('democracy2.0')
      .should('have.value', 'democracy2.0');
    cy.get('#password').clear().should('have.value', '');

    // shows errors when the fields are empty
    cy.get('#e2e-built-in-fields-submit-button > button')
      .wait(500)
      .click()
      .wait(500);
    cy.get('#e2e-firstName-container .e2e-error-message').should('exist');
    cy.get('#e2e-lastName-container .e2e-error-message').should('exist');
    cy.get('#e2e-password-container .e2e-error-message').should('exist');
    cy.get('#e2e-firstName-container .e2e-error-message').should(
      'contain',
      'Enter your first name'
    );
    cy.get('#e2e-lastName-container .e2e-error-message').should(
      'contain',
      'Enter your last name'
    );

    // shows an error when no valid password is provided
    cy.get('#password').type('test').should('have.value', 'test');
    cy.get('#e2e-built-in-fields-submit-button > button')
      .wait(500)
      .click()
      .wait(500);
    cy.get('#e2e-password-container .e2e-error-message').should(
      'contain',
      'Provide a password that is at least 8 characters long'
    );
  });

  it('signs up and confirms code successfully', () => {
    signUpEmailConformation(cy);
    cy.get('.e2e-modal-close-button').first().click();
    cy.clearCookies();
  });

  it('fails to confirm account with an invalid code', () => {
    signUp(cy);
    cy.get('#code').click().type('0000');
    cy.get('#e2e-verify-email-button > button').click({ force: true });
    cy.get('.e2e-error-message');
  });

  it.only('allows changing email during sign-up flow', () => {
    const oldEmail = randomEmail();
    signUp(cy, oldEmail);

    cy.contains(oldEmail).should('exist');

    cy.get('#e2e-go-to-change-email').click();

    const newEmail = randomEmail();
    cy.get('#email').focus().type(newEmail);
    cy.get('#e2e-change-email-submit').click();

    cy.contains(newEmail).should('exist');
    cy.contains(oldEmail).should('not.exist');
  });
});
