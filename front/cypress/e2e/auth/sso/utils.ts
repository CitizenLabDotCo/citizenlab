const FAKE_SSO_ORIGIN = 'http://host.docker.internal:8081';

// See https://github.com/CitizenLabDotCo/fake_sso/blob/main/utils/profiles.js
type ProfileName =
  | 'john_doe'
  | 'jane_doe'
  | 'tracy_smith'
  | 'billy_fixed'
  | 'jenny_fixed'
  | 'bradley_fixed';

type Overrides = {
  email?: string;
  sub?: string;
};

export const fakeSSOGlobalSignup = (
  cy: Cypress.Chainable,
  profileName: ProfileName,
  { email, sub }: Overrides = {}
) => {
  cy.visit('/');

  // Sanity check: no session cookie before the SSO flow starts.
  cy.getCookie('cl2_jwt').should('be.null');

  cy.get('#e2e-navbar-login-menu-item').click();
  cy.get('#e2e-login-with-fake-sso').click();

  // Browser is now on the fake_sso authorize page.
  cy.origin(
    FAKE_SSO_ORIGIN,
    { args: { profileName, email, sub } },
    ({ profileName, email, sub }) => {
      cy.get('select#profile-select').select(profileName);
      cy.get('select#profile-select').should('have.value', profileName);
      if (email) {
        cy.get('input#email-input').clear().type(email);
      }
      if (sub) {
        cy.get('input#sub-input').clear().type(sub);
      }
      cy.get('#submit-button').click();
    }
  );

  // The back-end /auth/fake_sso/callback set the JWT cookie and redirected
  // the browser to the front-end with `sso_success=true`. The front-end
  // picks up that param and resumes the auth flow in a modal.
  cy.getCookie('cl2_jwt', { timeout: 10000 }).should('not.be.null');
  cy.location('search', { timeout: 20000 }).should(
    'include',
    'sso_success=true'
  );

  // Unfortunate that we have to do this, but cypress
  // is just super weird and slow with cookies. After
  // reloading the page the cookies are properly set and the user
  // will be logged in correctly
  cy.reload();
};
