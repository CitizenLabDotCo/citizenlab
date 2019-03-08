declare global {
  namespace Cypress {
    interface Chainable {
      login: typeof login;
      apiLogin: typeof apiLogin;
      apiSignup: typeof apiSignup;
      logout: typeof logout;
      signup: typeof signup;
      acceptCookies: typeof acceptCookies;
      getProjectBySlug: typeof getProjectBySlug;
      apiCreateIdea: typeof apiCreateIdea;
      apiAddComment: typeof apiAddComment;
      apiRemoveComment: typeof apiRemoveComment;
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

export function getProjectBySlug(adminJwt: string, projectSlug: string) {
  return cy.request({
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminJwt}`
    },
    method: 'GET',
    url: `web_api/v1/projects/by_slug/${projectSlug}`
  });
}

export function apiCreateIdea(adminJwt: string, projectId: string, ideaTitle: string, ideaContent: string) {
  return cy.request({
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminJwt}`
    },
    method: 'POST',
    url: 'web_api/v1/ideas',
    body: {
      idea: {
        project_id: projectId,
        publication_status: 'published',
        title_multiloc: {
          'en-GB': ideaTitle,
          'nl-BE': ideaTitle
        },
        body_multiloc: {
          'en-GB': ideaContent,
          'nl-BE': ideaContent
        }
      }
    }
  });
}

export function apiAddComment(adminJwt: string, ideaId: string, commentContent: string, commentParentId?: string) {
  return cy.request({
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminJwt}`
    },
    method: 'POST',
    url: `web_api/v1/ideas/${ideaId}/comments`,
    body: {
      comment: {
        body_multiloc: {
          'en-GB': commentContent,
          'nl-BE': commentContent
        },
        parent_id: commentParentId
      }
    }
  });
}

export function apiRemoveComment(adminJwt: string, commentId: string) {
  return cy.request({
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminJwt}`
    },
    method: 'POST',
    url: `web_api/v1/comments/${commentId}/mark_as_deleted`,
  });
}

Cypress.Commands.add('login', login);
Cypress.Commands.add('apiLogin', apiLogin);
Cypress.Commands.add('apiSignup', apiSignup);
Cypress.Commands.add('logout', logout);
Cypress.Commands.add('signup', signup);
Cypress.Commands.add('acceptCookies', acceptCookies);
Cypress.Commands.add('getProjectBySlug', getProjectBySlug);
Cypress.Commands.add('apiCreateIdea', apiCreateIdea);
Cypress.Commands.add('apiAddComment', apiAddComment);
Cypress.Commands.add('apiRemoveComment', apiRemoveComment);
