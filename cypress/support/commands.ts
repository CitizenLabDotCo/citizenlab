declare global {
  namespace Cypress {
    interface Chainable {
      loginAsAdmin: typeof loginAsAdmin;
      logout: typeof logout;
    }
  }
}

export function loginAsAdmin() {
  cy.visit('/sign-in');
  cy.get('#email').type('koen@citizenlab.co');
  cy.get('#password').type('testtest');
  cy.get('.e2e-submit-signin').click();
}

export function logout() {
  cy.get('#e2e-user-menu-container').click();
  cy.get('#e2e-sign-out-link').click();
}

Cypress.Commands.add('loginAsAdmin', loginAsAdmin);
Cypress.Commands.add('logout', logout);
