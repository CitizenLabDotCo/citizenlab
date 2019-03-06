declare global {
  namespace Cypress {
    interface Chainable {
      login: typeof login;
      apiLogin: typeof apiLogin;
      apiSignup: typeof apiSignup;
      logout: typeof logout;
      signup: typeof signup;
      acceptCookies: typeof acceptCookies;
    }
  }
}

export function login(email: string, password: string) {
  cy.visit('/sign-in');
  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.get('.e2e-submit-signin').click();
}

export function apiLogin(email: string, password: string) {
  return cy.request({
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    url: 'web_api/v1/user_token',
    body: {
      auth: {
        email,
        password
      }
    }
  });
}

export function apiSignup(firstName: string, lastName: string, email: string, password: string) {
  return cy.request({
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    url: 'web_api/v1/users',
    body: {
      user: {
        email,
        password,
        locale: 'en-GB',
        first_name: firstName,
        last_name: lastName
      }
    }
  });
}

export function logout() {
  cy.get('#e2e-user-menu-container button').click();
  cy.get('#e2e-sign-out-link').click();
}

export function signup(firstName: string, lastName: string, email: string, password: string) {
  cy.visit('/sign-up');
  cy.get('#firstName').type(firstName);
  cy.get('#lastName').type(lastName);
  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.get('.e2e-terms-and-conditions .e2e-checkbox').click();
  cy.get('#e2e-signup-step1-button').click();
}

export function acceptCookies() {
  cy.get('body').then(($body) => {
    if ($body.find('.e2e-accept-cookies-btn').length) {
      cy.get('.e2e-accept-cookies-btn').click();
    }
  });
}

Cypress.Commands.add('login', login);
Cypress.Commands.add('apiLogin', apiLogin);
Cypress.Commands.add('apiSignup', apiSignup);
Cypress.Commands.add('logout', logout);
Cypress.Commands.add('signup', signup);
Cypress.Commands.add('acceptCookies', acceptCookies);
