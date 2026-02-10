import { signUp, signUpEmailConformation } from '../../support/auth';
import { randomEmail } from '../../support/commands';

describe('Change email during sign-up', () => {
  beforeEach(() => {
    cy.goToLandingPage();
    cy.get('#e2e-navbar-login-menu-item').click();
    cy.get('#e2e-authentication-modal').should('exist');
  });

  it('allows changing the email during sign-up', () => {
    const email = randomEmail();
    signUp(cy, email);

    // On the email confirmation step, change the email
    const newEmail = randomEmail();
    cy.get('#e2e-go-to-change-email').click();

    // Enter the new email
    signUpEmailConformation(cy, newEmail);

    // Verify that we are logged in
    cy.get('#e2e-user-menu-container');
  });
});
