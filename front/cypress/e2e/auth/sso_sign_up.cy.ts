describe('SSO Sign Up', () => {
  it('works for global visiting action', () => {
    cy.visit('/');

    cy.get('#e2e-navbar-login-menu-item').click();
    cy.get('#e2e-login-with-fake-sso').click();

    // Now we are on the fake-sso page
    cy.origin('http://host.docker.internal:8081/oauth/authorize', () => {
      cy.get('#submit-button').click();
    });

    // Make sure we're redirected back to the correct page
    cy.location('pathname').should('eq', '/en/');

    // Now something goes wrong with cypress: we are on the correct page,
    // but the token is not set for some reason. This can be solved
    // by manually doing the redirect another time.
    // No idea why it works like this, but it does.
    cy.visit(
      '/en/complete-signup?sso_response=true&sso_flow=signup&sso_pathname=%2Fen%2F&sso_verification_action=visiting&sso_verification_type=global'
    );

    // Make sure that custom fields window is opened
    cy.get('#e2e-signup-custom-fields-container');

    // Skip custom fields
    cy.get('#e2e-signup-custom-fields-skip-btn').click();

    // Make sure we're at success screen
    cy.get('#e2e-sign-up-success-modal').should('exist');
  });
});
