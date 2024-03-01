// https://docs.cypress.io/guides/end-to-end-testing/azure-active-directory-authentication

export function loginViaAAD(username: string, password: string) {
  // cy.visit('http://localhost:3000/')
  // cy.get('button#signIn').click()
  cy.wait(500);
  cy.visit('/');
  cy.get('#e2e-landing-page');
  cy.get('#e2e-navbar');
  cy.get('#e2e-navbar-login-menu-item').click();
  cy.get('#e2e-authentication-modal');
  cy.get('#azure-ad-login-button').click();

  // Login to your AAD tenant.
  cy.origin(
    'login.microsoftonline.com',
    {
      args: {
        username,
      },
    },
    ({ username }) => {
      cy.get('input[type="email"]').type(username, {
        log: false,
      });
      cy.get('input[type="submit"]').click();
    }
  );

  // depending on the user and how they are registered with Microsoft, the origin may go to live.com
  cy.origin(
    'login.live.com',
    {
      args: {
        password,
      },
    },
    ({ password }) => {
      cy.get('input[type="password"]').type(password, {
        log: false,
      });
      cy.get('input[type="submit"]').click();
      cy.get('#idBtn_Back').click();
    }
  );

  // Ensure Microsoft has redirected us back to the sample app with our logged in user.
  cy.url().should('equal', 'http://localhost:3000/');
  cy.get('#welcome-div').should(
    'contain',
    `Welcome ${Cypress.env('aad_username')}!`
  );
}
