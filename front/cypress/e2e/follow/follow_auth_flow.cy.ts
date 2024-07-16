import { randomString, randomEmail } from '../../support/commands';

const signUp = (email = randomEmail(), password = randomString()) => {
  cy.goToLandingPage();
  cy.get('#e2e-navbar-login-menu-item').click();
  cy.get('#e2e-goto-signup').click();
  cy.get('#e2e-sign-up-email-password-container');

  const firstName = randomString();
  const lastName = randomString();

  cy.get('#firstName').type(firstName);
  cy.get('#lastName').type(lastName);
  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.get('[data-testid="termsAndConditionsAccepted"] .e2e-checkbox')
    .click()
    .should('have.class', 'checked');
  cy.get('[data-testid="privacyPolicyAccepted"] .e2e-checkbox')
    .click()
    .should('have.class', 'checked');
  cy.get('#e2e-signup-password-submit-button').wait(500).click().wait(500);

  cy.get('#code').should('exist');
  cy.get('#code').click().type('1234');
  cy.get('#e2e-verify-email-button').click();
};

describe('Follow: in auth flow', () => {
  before(() => {
    cy.apiUpdateAppConfiguration({ settings: { core: { onboarding: true } } });
  });

  after(() => {
    cy.apiUpdateAppConfiguration({ settings: { core: { onboarding: false } } });
  });

  it('shows onboarding during sign up flow', () => {
    signUp();
    cy.get('#e2e-follow-topics').should('exist');
  });

  it('shows onboarding during log in if not completed yet', () => {
    const email = randomEmail();
    const password = randomString();
    signUp(email, password);

    cy.logout();

    cy.get('#e2e-navbar-login-menu-item').click();
    cy.get('#e2e-authentication-modal').should('exist');
    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('#e2e-signin-password-submit-button').click();

    cy.get('#e2e-follow-topics').should('exist');
  });

  it('shows working "Complete onboarding" in user menu if onboarding not completed yet', () => {
    signUp();
    cy.get('#e2e-follow-topics').should('exist');

    cy.get('.e2e-modal-close-button').click();

    cy.get('#e2e-user-menu-dropdown-button').click();
    cy.get('#e2e-complete-onboarding-link').click();
    cy.get('#e2e-follow-topics').should('exist');
  });
});
