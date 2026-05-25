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
    2. The fake_sso feature is enabled on the e2etests_template tenant
       (see back/engines/commercial/multi_tenancy/lib/tasks/core/create_tenant.rake).
    3. BASE_DEV_URI on the back points at the front-end origin so the OIDC
       redirect_uri (e.g. http://e2e.front:3000/auth/fake_sso/callback) and the
       session cookie share the front-end origin.
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
    // Use the deterministic `billy_fixed` profile so the sub claim is stable.
    cy.origin(FAKE_SSO_ORIGIN, () => {
      cy.get('select#profile-select').select('billy_fixed');
      cy.get('#submit-button').click();
    });

    // After the back-end processes the OIDC callback it redirects back to the
    // front-end with sso_success query params.
    cy.location('search', { timeout: 20000 }).should(
      'include',
      'sso_success=true'
    );

    // The JWT session cookie set by the OAuth callback must be visible to the
    // front-end origin -- this is what the BASE_DEV_URI override above ensures.
    cy.getCookie('cl2_jwt', { timeout: 10000 }).should('not.be.null');

    // Resolves the JWT to the actual user record on the back-end. Asserting on
    // the email proves the fake_sso id_token was actually consumed and not
    // just a same-origin redirect.
    cy.getCookie('cl2_jwt').then((cookie) => {
      expect(cookie).to.not.be.null;
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
        expect(response.body.data.attributes.email).to.eq(
          'billy_fixed@example.com'
        );
      });
    });
  });
});
