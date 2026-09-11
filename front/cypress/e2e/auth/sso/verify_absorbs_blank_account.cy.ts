import { randomEmail, randomString } from '../../../support/commands';
import { fakeSSOVerify } from '../utils';
import { fakeSSOGlobalSignup } from './utils';

// The mirror of the merge flow in user_no_email.cy.ts: there the SSO account is
// absorbed into the email one, here the email account absorbs the SSO one. The
// provider returning the same subject for both is what ties them together.
//
// The refusal side is settled by AccountMergeEligibilityService and covered by the
// backend specs.
describe('SSO: verifying an email account that already has a blank SSO account', () => {
  it('absorbs the blank account into the one being verified', () => {
    const email = randomEmail();
    const password = randomString();
    const sub = randomString();

    // A blank SSO account: identity and verification, no email or password, because
    // the user abandoned the flow before supplying one.
    fakeSSOGlobalSignup(cy, 'jane_doe', { sub });
    cy.get('.e2e-modal-close-button').click();
    cy.clearCookies();

    cy.apiSignup(randomString(), randomString(), email, password);
    cy.setLoginCookie(email, password);
    cy.visit('/profile/edit');
    // clearCookies dropped the consent choice, so the banner is back and holds a
    // focus lock over the page.
    cy.acceptCookies();
    cy.get('#e2e-verify-user-button').click();
    cy.get('#e2e-verification-wizard-method-selection-step').should('exist');

    fakeSSOVerify(cy, 'jane_doe', { sub });

    // An SSO method verifies through a full redirect, so it lands on the profile page
    // rather than the wizard's success step.
    cy.location('search').should('include', 'verification_success=true');
    cy.get('.e2e-verified').should('exist');

    // Still the email account, now verified, holding everything the blank one owned.
    cy.getAuthUser().then((user) => {
      expect(user.body.data.attributes.email).to.eq(email);
      expect(user.body.data.attributes.verified).to.eq(true);
    });
  });
});
