import { signUp, signUpEmailConformation } from '../../support/auth';
import { randomEmail } from '../../support/commands';

describe('Change email in profile', () => {
  beforeEach(() => {
    cy.goToLandingPage();
    cy.get('#e2e-navbar-login-menu-item').click();
    cy.get('#e2e-authentication-modal').should('exist');
  });

  it('allows changing the email during sign-up', () => {
    const email = randomEmail();
    signUpEmailConformation(cy, email);

    // Verify that we are logged in
    cy.get('#e2e-user-menu-container');

    // Go to profile
    cy.visit('/profile/edit');

    // Click 'Change email' button
    cy.get('a[href="/en/profile/change-email"]').click();

    // Enter new email
    const newEmail = randomEmail();
    cy.get('input[name="email"]').clear().type(newEmail);
    cy.dataCy('change-email-submit-button').click();

    // Simulate email confirmation step
    cy.get('.e2e-email-confirmation-modal').should('exist');
    cy.get('input[name="confirmation_code"]').type('123456'); // Assuming '123456' is the code sent to the new email
    cy.get('.e2e-confirmation-submit-button').click();
  });
});
