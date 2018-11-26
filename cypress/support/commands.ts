declare global {
  namespace Cypress {
    interface Chainable {
      loginAsAdmin: typeof loginAsAdmin;
      logOut: typeof logOut;
      createNewContinuousProject: typeof createNewContinuousProject;
      acceptCookies: typeof acceptCookies;
    }
  }
}

export function loginAsAdmin() {
  cy.visit('/sign-in');
  cy.get('#email').type('koen@citizenlab.co');
  cy.get('#password').type('testtest');
  cy.get('.e2e-submit-signin').click();
}

export function logOut() {
  cy.get('#e2e-user-menu-container').click();
  cy.get('#e2e-sign-out-link').click();
}

export function createNewContinuousProject(projectName: string) {
  cy.visit('/admin/projects');
  cy.get('.e2e-admin-add-project').click();
  cy.get('#project-title-en').type(projectName);
  cy.get('#project-title-nl-BE').type(projectName);
  cy.get('.e2e-project-type-continuous').click();
  cy.get('.e2e-submit-wrapper-button').click();
}

export function acceptCookies() {
  cy.get('.e2e-accept-cookies-btn').then((button) => {
    if (button) {
      button.click();
    }
  });
}

Cypress.Commands.add('loginAsAdmin', loginAsAdmin);
Cypress.Commands.add('logOut', logOut);
Cypress.Commands.add('createNewContinuousProject', createNewContinuousProject);
Cypress.Commands.add('acceptCookies', acceptCookies);
