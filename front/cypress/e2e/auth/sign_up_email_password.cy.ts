import { randomString, randomEmail } from '../../support/commands';

function signUp(email = randomEmail()) {
  const firstName = randomString();
  const lastName = randomString();
  const password = randomString();

  cy.get('#firstName').type(firstName);
  cy.get('#lastName').type(lastName);
  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.get('[data-testid="termsAndConditionsAccepted"] .e2e-checkbox')
    .click()
    .should('have.class', 'checked');
  cy.get('[data-testid="privacyPolicyAccepted"] .e2e-checkbox')
    .wait(500)
    .click()
    .wait(500)
    .should('have.class', 'checked');
  cy.get('#e2e-signup-password-submit-button').wait(500).click().wait(500);
}

describe('Sign up - Email + password step', () => {
  beforeEach(() => {
    cy.goToLandingPage();
    cy.get('#e2e-navbar-login-menu-item').click();
    cy.get('#e2e-goto-signup').click();
    cy.get('#e2e-authentication-modal').should('exist');
  });

  it('has a working first name field', () => {
    cy.get('#firstName').type('test').should('have.value', 'test');
  });

  it('shows an error when no first name is provided', () => {
    cy.get('#e2e-signup-password-submit-button').should('exist');
    cy.get('#e2e-signup-password-submit-button').click();
    cy.scrollTo('top');
    cy.wait(500);
    cy.get('#e2e-firstName-container .e2e-error-message').should('exist');
    cy.get('#e2e-firstName-container .e2e-error-message').should(
      'contain',
      'Enter your first name'
    );
  });

  it('has a working last name field', () => {
    cy.get('#lastName').type('test').should('have.value', 'test');
  });

  it('shows an error when no last name is provided', () => {
    cy.get('#e2e-signup-password-submit-button').wait(500).click().wait(500);
    cy.get('#e2e-lastName-container .e2e-error-message').should(
      'contain',
      'Enter your last name'
    );
  });

  it('has a working email field', () => {
    cy.get('#email').type('test').should('have.value', 'test');
  });

  it('shows an error when no email is provided', () => {
    cy.get('#e2e-signup-password-submit-button').wait(500).click().wait(500);
    cy.get('#e2e-email-container .e2e-error-message').should(
      'contain',
      'Provide an email address'
    );
  });

  it('shows an error when no valid email is provided', () => {
    cy.get('#email').type('test@t');
    cy.get('#e2e-signup-password-submit-button').wait(500).click().wait(500);
    cy.get('#e2e-email-container .e2e-error-message').should(
      'contain',
      'Provide an email address in the correct format'
    );
  });

  it('has a working password field', () => {
    cy.get('#password')
      .type('democracy2.0')
      .should('have.value', 'democracy2.0');
  });

  it('shows an error when too short password is provided', () => {
    cy.get('#password').type('test').should('have.value', 'test');
    cy.get('#e2e-signup-password-submit-button').wait(500).click().wait(500);
    cy.get('#e2e-password-container .e2e-error-message').should(
      'contain',
      'Provide a password that is at least 8 characters long'
    );
  });

  it('shows an error when no valid password is provided', () => {
    cy.get('#password').type('test');
    cy.get('#e2e-signup-password-submit-button').wait(500).click().wait(500);
    cy.get('#e2e-password-container .e2e-error-message').should(
      'contain',
      'Provide a password that is at least 8 characters long'
    );
  });

  it('has working legal concerns checkboxes', () => {
    cy.get('[data-testid="termsAndConditionsAccepted"] .e2e-checkbox')
      .click()
      .should('have.class', 'checked');
    cy.get('[data-testid="privacyPolicyAccepted"] .e2e-checkbox')
      .wait(500)
      .click()
      .wait(500)
      .should('have.class', 'checked');
  });

  it('shows an error when the terms and conditions checkbox is not checked', () => {
    cy.get('#e2e-signup-password-submit-button').wait(500).click().wait(500);
    cy.get('#e2e-terms-conditions-container .e2e-error-message');
    cy.get('#e2e-terms-conditions-container .e2e-error-message').should(
      'contain',
      'Accept our terms and conditions to proceed'
    );
  });

  it('shows an error when the privacy checkbox is not checked', () => {
    cy.get('#e2e-signup-password-submit-button').wait(500).click().wait(500);
    cy.get('#e2e-privacy-policy-container .e2e-error-message');
    cy.get('#e2e-privacy-policy-container .e2e-error-message').should(
      'contain',
      'Accept our privacy policy to proceed'
    );
  });

  it('signs up successfully', () => {
    signUp();
    cy.get('.e2e-modal-close-button').first().click();
    cy.clearCookies();
  });

  it('confirms the account successfully', () => {
    signUp();
    cy.get('#code').click().type('1234');
    cy.get('#e2e-verify-email-button').click();
    cy.wait(5000);
    cy.get('#e2e-verify-email-button').should('not.exist');
    cy.get('.e2e-error-message').should('not.exist');
    cy.clearCookies();
  });

  it('fails to confirm account with an invalid code', () => {
    signUp();
    cy.get('#code').click().type('0000');
    cy.get('#e2e-verify-email-button').click();
    cy.get('.e2e-error-message');
  });

  it('allows changing email during sign-up flow', () => {
    const oldEmail = randomEmail();
    signUp(oldEmail);

    cy.contains(oldEmail).should('exist');

    cy.get('#e2e-go-to-change-email').click();

    const newEmail = randomEmail();
    cy.get('#email').focus().type(newEmail);
    cy.get('#e2e-change-email-submit').click();

    cy.contains(newEmail).should('exist');
    cy.contains(oldEmail).should('not.exist');
  });
});
