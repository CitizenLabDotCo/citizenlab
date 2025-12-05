import {
  enterUserInfo,
  signUpEmailConformation,
  logIn,
} from '../../support/auth';
import { randomString, randomEmail } from '../../support/commands';

const signUp = (email = randomEmail(), password = randomString()) => {
  cy.goToLandingPage();
  cy.get('#e2e-navbar-login-menu-item').click();
  signUpEmailConformation(cy, email);
  enterUserInfo(cy, { password });
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
    cy.acceptCookies();

    cy.get('#e2e-navbar-login-menu-item').click();
    cy.get('#e2e-authentication-modal').should('exist');
    logIn(cy, email, password);

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
