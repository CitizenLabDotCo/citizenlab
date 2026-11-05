import { confirmEmail, signUp } from '../../support/auth';
import { randomEmail } from '../../support/commands';

// 'Change your email' on the confirmation step sends the participant back to the
// flow start. Because an address is already known, that step has to open with it
// prefilled rather than with an empty input.
describe('Change email during sign-up', () => {
  const expectConfirmationEmail = (email: string) => {
    cy.dataCy('confirmation-email').should('have.text', email);
  };

  const goBackToPrefilledEmailForm = (email: string) => {
    cy.get('#e2e-go-to-change-email').click();

    cy.dataCy('email-flow-start-email-input').should('exist');
    cy.get('input[type="email"]').should('have.value', email);
  };

  beforeEach(() => {
    cy.goToLandingPage();
    cy.get('#e2e-navbar-login-menu-item').click();
    cy.get('#e2e-authentication-modal').should('exist');
  });

  it('gets back to the confirmation step when the email is kept', () => {
    const email = randomEmail();

    signUp(cy, email);
    expectConfirmationEmail(email);

    goBackToPrefilledEmailForm(email);

    // Submitting the same address again: the (unconfirmed) account already
    // exists, so the policies are not asked a second time and we land back on
    // the confirmation step for that same address.
    cy.dataCy('email-flow-start-continue-button').click();

    expectConfirmationEmail(email);
    confirmEmail(cy);

    // Verify that we are logged in
    cy.get('#e2e-user-menu-container');
  });

  it('shows the new email on the confirmation step when it is changed', () => {
    const email = randomEmail();
    const newEmail = randomEmail();

    signUp(cy, email);
    expectConfirmationEmail(email);

    goBackToPrefilledEmailForm(email);

    // Enter a different address - a new account, so the policies are asked again
    signUp(cy, newEmail);

    expectConfirmationEmail(newEmail);
    confirmEmail(cy);

    // Verify that we are logged in
    cy.get('#e2e-user-menu-container');
  });
});
