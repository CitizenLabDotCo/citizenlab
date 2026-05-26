/*
  Exercises the full cross-domain OIDC redirect against the local fake_sso
  provider:

    front (e2e.front / localhost) ──► back (/auth/fake_sso)
       └── 302 ──► fake_sso (http://host.docker.internal:8081/oauth2/authorize)
            └── user submits ──► back (/auth/fake_sso/callback)
                 └── 302 ──► front (sso_success=true...)

  Prerequisites for this test to pass (see e2e/docker-compose.yml,
  e2e/docker-compose.test.yml, .circleci/config.yml, and the project README):
    1. The fake_sso container is reachable at http://host.docker.internal:8081
       from both the browser and the back-end (network alias in CI, /etc/hosts
       entry locally).
    2. The fake_sso feature is enabled on the e2etests_template tenant (see
       back/engines/commercial/multi_tenancy/lib/tasks/core/create_tenant.rake).
*/

const FAKE_SSO_ORIGIN = 'http://host.docker.internal:8081';

describe('SSO: user with confirmed email', () => {
  it('signs the user in after a round-trip through the fake OIDC provider', () => {
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
    // In this case, it's just the success message.
    cy.getCookie('cl2_jwt', { timeout: 10000 }).should('not.be.null');
    cy.location('search', { timeout: 20000 }).should(
      'include',
      'sso_success=true'
    );
    cy.get('#e2e-authentication-modal').should('exist');
    cy.get('#e2e-sign-up-success-modal').should('exist');
  });
});
