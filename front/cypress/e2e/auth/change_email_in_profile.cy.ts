import {
  signUpEmailConformation,
  confirmEmail,
  enterUserInfo,
  logIn,
} from '../../support/auth';
import { randomEmail, randomString } from '../../support/commands';

describe('Change email in profile', () => {
  beforeEach(() => {
    cy.goToLandingPage();
    cy.get('#e2e-navbar-login-menu-item').click();
    cy.get('#e2e-authentication-modal').should('exist');
  });

  it('allows changing the email during sign-up', () => {
    const email = randomEmail();
    const password = randomString();
    signUpEmailConformation(cy, email);
    enterUserInfo(cy, { password });

    // Verify that we are logged in
    cy.get('#e2e-user-menu-container');

    // Go to profile
    cy.visit('/profile/edit');

    // Click 'Change email' button
    cy.get('a[href="/en/profile/change-email"]').click();

    // Enter new email
    const newEmail = randomEmail();
    cy.get('input[name="email"]').type(newEmail);
    cy.dataCy('change-email-submit-button').click();

    // Confirm new email
    confirmEmail(cy);

    // Verify change was successful
    cy.get('.e2e-success-message')
      .first()
      .should('contain.text', 'Your email has been successfully updated.');

    // Log and log back in with new email to verify
    cy.logout();
    cy.goToLandingPage();
    cy.get('#e2e-navbar-login-menu-item').click();
    cy.get('#e2e-authentication-modal').should('exist');
    logIn(cy, newEmail, password);

    // Verify that we are logged in
    cy.get('#e2e-user-menu-container');
  });
});
