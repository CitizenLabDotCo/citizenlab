const FAKE_SSO_ORIGIN = 'http://host.docker.internal:8081';

// See https://github.com/CitizenLabDotCo/fake_sso/blob/main/utils/profiles.js
type ProfileName =
  | 'john_doe'
  | 'jane_doe'
  | 'tracy_smith'
  | 'billy_fixed'
  | 'jenny_fixed';

export const fakeSSOSignup = (cy: Cypress.Chainable, profileName: ProfileName) => {
  cy.visit('/');

  // Sanity check: no session cookie before the SSO flow starts.
  cy.getCookie('cl2_jwt').should('be.null');

  cy.get('#e2e-navbar-login-menu-item').click();
  cy.get('#e2e-login-with-fake-sso').click();

  // Browser is now on the fake_sso authorize page.
  cy.origin(FAKE_SSO_ORIGIN, () => {
    cy.get('select#profile-select').select('john_doe');
    cy.get('#submit-button').click();
  });

  // The back-end /auth/fake_sso/callback set the JWT cookie and redirected
  // the browser to the front-end with `sso_success=true`. The front-end
  // picks up that param and resumes the auth flow in a modal.
  cy.getCookie('cl2_jwt', { timeout: 10000 }).should('not.be.null');
  cy.location('search', { timeout: 20000 }).should(
    'include',
    'sso_success=true'
  );
}
