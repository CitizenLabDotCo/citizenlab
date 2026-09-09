import { randomEmail, randomString } from '../../../support/commands';
import { fakeSSOVerify } from '../utils';
import { fakeSSOGlobalSignup } from './utils';

// The mirror image of the merge flow in user_no_email.cy.ts: there the SSO
// account is signed in and is absorbed into the email account it names, here the
// email account is signed in and absorbs the SSO one. What ties the two together
// is the provider returning the same subject for both.
//
// The refusal side - an SSO account that is not blank blocks the verification -
// is settled by AccountMergeEligibilityService, so it is covered by the backend
// specs rather than repeated here.
describe('SSO: verifying an email account that already has a blank SSO account', () => {
  it('absorbs the blank account into the one being verified', () => {
    const email = randomEmail();
    const password = randomString();
    const sub = randomString();

    // A blank SSO account: an identity and a verification, but no email and no
    // password, because the user abandoned the flow before supplying one.
    fakeSSOGlobalSignup(cy, 'jane_doe', { sub });
    cy.get('.e2e-modal-close-button').click();
    cy.clearCookies();

    cy.apiSignup(randomString(), randomString(), email, password);
    cy.setLoginCookie(email, password);
    cy.visit('/profile/edit');
    cy.get('#e2e-verify-user-button').click();
    cy.get('#e2e-verification-wizard-method-selection-step').should('exist');

    fakeSSOVerify(cy, 'jane_doe', { sub });

    cy.get('#e2e-verification-success').should('exist');
    cy.get('#e2e-verification-success-close-button').click();

    // Still signed in as the email account, now verified. The blank account and
    // everything it owned have moved onto this one.
    cy.getAuthUser().then((user) => {
      expect(user.body.data.attributes.email).to.eq(email);
      expect(user.body.data.attributes.verified).to.eq(true);
    });
  });
});
