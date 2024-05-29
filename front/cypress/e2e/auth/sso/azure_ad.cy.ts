describe('Azure Active Directory B2C Authentication', () => {
  // https://docs.cypress.io/guides/end-to-end-testing/azure-active-directory-authentication
  function loginViaAAD(username: string, password: string) {
    cy.visit('/');
    cy.get('#e2e-navbar');
    cy.get('#e2e-navbar-login-menu-item').click();
    cy.get('#e2e-authentication-modal');
    cy.get('#azure-ad-b2c-login-button').click();

    // Login to your AAD tenant.
    cy.origin(
      `${Cypress.env('DEFAULT_AZURE_AD_B2C_LOGIN_TENANT_NAME')}.b2clogin.com`,
      {
        args: {
          username,
          password,
        },
      },
      ({ username, password }) => {
        cy.get('input[type="email"]').type(username, {
          log: false,
        });
        cy.get('input[type="password"]').type(password, {
          log: false,
        });
        cy.get('[type="submit"]').click();
      }
    );
  }

  it('signs in with Azure AD B2C account', () => {
    loginViaAAD(
      Cypress.env('DEFAULT_AZURE_AD_B2C_LOGIN_E2E_EMAIL'),
      Cypress.env('DEFAULT_AZURE_AD_B2C_LOGIN_E2E_PASSWORD')
    );

    // Ensure Azure has redirected us back to the app with our logged in user.
    cy.url().should('equal', 'http://localhost:3000/en/');

    cy.visit('/'); // For some reason, cookies are not set on the first visit, and so the user is not logged in.
    cy.get('#e2e-user-menu-container').should('exist');
    cy.get('.e2e-not-verified').should('exist');
  });
});
