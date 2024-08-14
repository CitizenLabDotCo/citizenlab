describe('Bla', () => {
  let jwt = '';
  let TEST = '';

  it('redirects', () => {
    cy.visit('/');

    cy.get('#e2e-navbar-login-menu-item').click();
    cy.get('#e2e-login-with-fake-sso').click();

    // Now we are on the fake-sso page
    cy.intercept('**', (req) => {
      if (req.url.startsWith('http://localhost:4000/auth/fake_sso/callback')) {
        const cookieHeader = req.headers['cookie'];
        if (typeof cookieHeader !== 'string') {
          throw new Error('Wrong cookie header type');
        }

        throw new Error(cookieHeader.includes('cl2_jwt=').toString());
      }
    });

    cy.origin('http://host.docker.internal:8081/oauth/authorize', () => {
      cy.get('#submit-button').click();
    });

    cy.location('pathname').should('eq', '/en/');
    // cy.setCookie('cl2_jwt', jwt.slice(8, jwt.length))
  });
});
