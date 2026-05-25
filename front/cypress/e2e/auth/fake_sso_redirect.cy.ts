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

describe('Fake SSO cross-domain redirect', () => {
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
    // back to the front-end with sso_success=true. We assert the cookie is
    // present, but seeing it in `cy.getCookie` isn't sufficient -- the
    // front-end's auth query already ran (and 401'd) before the cookie
    // existed, so the React state still thinks the user is logged out and
    // the navbar shows the login button. A clean `cy.visit('/')` re-mounts
    // the app with the cookie in place from the start.
    cy.location('search', { timeout: 20000 }).should(
      'include',
      'sso_success=true'
    );
    cy.getCookie('cl2_jwt', { timeout: 10000 }).should('not.be.null');

    cy.visit('/');

    // The real assertion: the UI now reflects an authenticated user. The
    // navbar's login menu item is replaced by the user menu container.
    cy.get('#e2e-user-menu-container', { timeout: 15000 }).should('exist');
    cy.get('#e2e-navbar-login-menu-item').should('not.exist');

    // Cross-check via API that the JWT identifies the SSO user (proves the
    // id_token was actually consumed and the user record matches the
    // fake_sso profile -- not just any pre-existing logged-in session).
    cy.getCookie('cl2_jwt').then((cookie) => {
      const jwt = cookie!.value;
      cy.request({
        method: 'GET',
        url: 'web_api/v1/users/me',
        headers: {
          Authorization: `Bearer ${jwt}`,
          'Content-Type': 'application/json',
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data.attributes.email.endsWith('@example.com')).to.be.true;
      });
    });
  });
});
