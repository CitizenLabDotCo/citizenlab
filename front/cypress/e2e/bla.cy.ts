describe('Bla', () => {
  it('redirects', () => {
    // cy.origin('https://fake-sso.onrender.com', () => {
    //   cy.visit('/');
    //   cy.wait(2000);
    // });

    cy.visit('/');

    cy.get('#e2e-navbar-login-menu-item').click();
    cy.get('#e2e-login-with-fake-sso').click();

    // Now we are on the fake-sso page
    // here we submit the form and get redirected back to the platform
    cy.get('#submit-button').click();

    // Now we're back on the platform
    // TODO confirm we're logged in
  });
});
