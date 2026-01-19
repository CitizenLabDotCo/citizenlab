import {
  signUpEmailConformation,
  enterUserInfo,
  logIn,
} from '../../support/auth';
import { randomEmail, randomString } from '../../support/commands';

describe('Change password in profile', () => {
  it('allows changing the password', () => {
    cy.goToLandingPage();
    cy.get('#e2e-navbar-login-menu-item').click();
    cy.get('#e2e-authentication-modal').should('exist');

    // Sign up a new user
    const email = randomEmail();
    const password = randomString();
    signUpEmailConformation(cy, email);
    enterUserInfo(cy, { password });

    // Verify that we are logged in
    cy.get('#e2e-user-menu-container');

    // Go to profile
    cy.visit('/profile/edit');

    // Click 'Change password' button
    cy.get('a[href="/en/profile/change-password"]').click();

    // Enter new password
    const newPassword = randomString();
    cy.get('input#current_password').type(password);
    cy.get('input#password').type(newPassword);
    cy.get('#password-submit-button > button').click();

    // Verify that message is shown
    cy.contains('Your password has been successfully updated');
  });
});
