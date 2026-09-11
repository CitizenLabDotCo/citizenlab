import { randomEmail, randomString } from '../../../support/commands';
import { fakeSSOGlobalSignup } from './utils';
import { confirmEmail, signUp } from '../../../support/auth';

describe('SSO: user with unconfirmed email', () => {
  it('signs the user in after a round-trip through the fake OIDC provider', () => {
    fakeSSOGlobalSignup(cy, 'tracy_smith');

    // Expect to be on email confirmation step
    confirmEmail(cy);

    // After confirming email, we expect to arrive on the success message
    cy.get('#e2e-authentication-modal').should('exist');
    cy.get('#e2e-sign-up-success-modal').should('exist');
  });

  it('allows user to re-request a code', () => {
    fakeSSOGlobalSignup(cy, 'tracy_smith');

    // Re-request code
    cy.dataCy('resend-code').click();
    cy.get('#e2e-authentication-modal').should('include.text', 'New code sent');

    // Confirm email with the new code (which is always the same in the e2e env)
    confirmEmail(cy);
  });

  // The other shape of "this email exists": a fully established account. The SSO
  // says the address is unverified, so the user must prove the inbox with a code.
  it('merges into an established account when the SSO email is already taken', () => {
    const email = randomEmail();
    cy.apiSignup(randomString(), randomString(), email, randomString());

    fakeSSOGlobalSignup(cy, 'tracy_smith', { email });

    cy.get('#e2e-built-in-fields-container')
      .find('input[type="email"]')
      .should('have.value', email);
    cy.get('#e2e-built-in-fields-submit-button').click();

    confirmEmail(cy);
    cy.get('#e2e-sign-up-success-modal').should('exist');

    // Signed in as the account that survived, now carrying the SSO verification.
    cy.getAuthUser().then((user) => {
      expect(user.body.data.attributes.email).to.eq(email);
      expect(user.body.data.attributes.verified).to.eq(true);
    });
  });

  it('allows user to change email', () => {
    fakeSSOGlobalSignup(cy, 'tracy_smith');

    // Go to change email screen
    cy.get('#e2e-go-to-change-email').click();

    // Enter new email and continue
    const newEmail = randomEmail();
    cy.get('#e2e-authentication-modal')
      .get('input[type="email"]')
      .clear()
      .type(newEmail);
    cy.get('#e2e-change-email-submit-button').click();

    // Confirm email with the new code (which is always the same in the e2e env)
    confirmEmail(cy);

    // After confirming email, we expect to arrive on the success message
    cy.get('#e2e-sign-up-success-modal').should('exist');

    // Confirm user has new email
    cy.getAuthUser().then((user) => {
      expect(user.body.data.attributes.email).to.equal(newEmail);
    });
  });
});

describe('SSO: user with unconfirmed email - edge cases', () => {
  beforeEach(() => {
    cy.goToLandingPage();
    cy.get('#e2e-navbar-login-menu-item').click();
    cy.get('#e2e-authentication-modal').should('exist');
  });

  // The account is only created once the policies are accepted, so signing up has to
  // run that far for there to be one to collide with.
  it('works if user signs up, does not confirm email, then logs in with SSO with same confirmed email', () => {
    const email = randomEmail();

    // Create account with unconfirmed email and no password
    signUp(cy, email);

    // Close modal, log out
    cy.get('.e2e-modal-close-button').first().click();
    cy.clearCookies();

    // Sign up through Fake SSO (return confirmed email)
    fakeSSOGlobalSignup(cy, 'john_doe', { email });

    // Signed in as the existing account, not a second one alongside it.
    //
    // No posting check, unlike the merge case: signing in imports none of the
    // provider's registration answers, so participation stays blocked until the
    // user fills in the profile.
    cy.getAuthUser().then((user) => {
      expect(user.body.data.attributes.email).to.eq(email);
    });
  });

  it('works if user signs up, does not confirm email, then logs in with SSO with same unconfirmed email', () => {
    const email = randomEmail();

    // Create account with unconfirmed email and no password
    signUp(cy, email);

    // Close modal, log out
    cy.get('.e2e-modal-close-button').first().click();
    cy.clearCookies();

    // Sign up through Fake SSO (return unconfirmed email)
    fakeSSOGlobalSignup(cy, 'tracy_smith', { email });

    // The SSO says the address is unverified and it belongs to the account above, so
    // it is not saved. The form opens pre-filled, and submitting offers the merge.
    cy.get('#e2e-built-in-fields-container')
      .find('input[type="email"]')
      .should('have.value', email);
    cy.get('#e2e-built-in-fields-submit-button').click();

    // Confirm email
    confirmEmail(cy);

    // Merged into the account that already had this address. Same as above, the
    // profile it inherits is incomplete, so the flow does not reach success.
    cy.getAuthUser().then((user) => {
      expect(user.body.data.attributes.email).to.eq(email);
    });

    // Confirm that I can post idea
    cy.visit('/projects/an-idea-bring-it-to-your-council');
    cy.acceptCookies();
    cy.dockProjectCtaBar();
    cy.get('.e2e-idea-button').first().find('button').should('exist');
    cy.get('.e2e-idea-button').first().find('button').click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/en/projects/an-idea-bring-it-to-your-council/ideas/new'
    );
  });

  it('allows user to sign up, exit flow, and then return to the flow and confirm email', () => {
    fakeSSOGlobalSignup(cy, 'tracy_smith');

    // Exit flow
    cy.get('.e2e-modal-close-button').click();

    // Re-enter flow
    cy.get('#e2e-user-menu-container').click();
    cy.get('#e2e-confirm-email-link > button').click();

    // Confirm email
    confirmEmail(cy);

    // After confirming email, we expect to arrive on the success message
    cy.get('#e2e-authentication-modal').should('exist');
    cy.get('#e2e-sign-up-success-modal').should('exist');
  });
});
