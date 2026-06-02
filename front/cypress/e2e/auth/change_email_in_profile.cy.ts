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

  const signUpAndGoToProfile = (password?: string) => {
    const email = randomEmail();
    signUpEmailConformation(cy, email);
    enterUserInfo(cy, { password });

    // Verify that we are logged in
    cy.get('#e2e-user-menu-container');

    // Go to profile
    cy.visit('/profile/edit');
  }

  it('allows changing the email', () => {
    const password = randomString();
    signUpAndGoToProfile(password);

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

  it('shows error if email already in use', () => {
    signUpAndGoToProfile();

    // Click 'Change email' button
    cy.get('a[href="/en/profile/change-email"]').click();

    // Enter existing email
    const existingEmail = 'admin@govocal.com';
    cy.get('input[name="email"]').type(existingEmail);
    cy.dataCy('change-email-submit-button').click();

    // Expect error message to visible
    cy.get('.e2e-error-message')
      .first()
      .should('contain.text', 'This email is already in use.');
  });

  it('allows resending code', () => {
    signUpAndGoToProfile();

    // Click 'Change email' button
    cy.get('a[href="/en/profile/change-email"]').click();

    // Enter new email
    const newEmail = randomEmail();
    cy.get('input[name="email"]').type(newEmail);
    cy.dataCy('change-email-submit-button').click();

    // Re-request code
    cy.dataCy('resend-code').click();
    cy.dataCy('confirmation-code-sent-message').should('be.visible');

    // Confirm email
    confirmEmail(cy);

    // Verify change was successful
    cy.get('.e2e-success-message')
      .first()
      .should('contain.text', 'Your email has been successfully updated.');
  });

  it('is possible to exit flow without getting in a weird limbo', () => {
    signUpAndGoToProfile();

    // Click 'Change email' button
    cy.get('a[href="/en/profile/change-email"]').click();

    // Enter new email
    const newEmail = randomEmail();
    cy.get('input[name="email"]').type(newEmail);
    cy.dataCy('change-email-submit-button').click();

    // Exit flow
    cy.get('.e2e-modal-close-button').first().click();

    // Expect to be able to visit profile page from navbar without issues
    cy.get('#e2e-user-menu-dropdown-button').click();
    cy.get('a[href="/en/profile/edit"]').click();
    cy.url().should('include', '/en/profile/edit');
  })
});
