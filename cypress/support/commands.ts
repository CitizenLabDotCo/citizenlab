declare global {
  namespace Cypress {
    interface Chainable {
      login: typeof login;
      apiLogin: typeof apiLogin;
      apiSignup: typeof apiSignup;
      apiCreateAdmin: typeof apiCreateAdmin;
      logout: typeof logout;
      signup: typeof signup;
      acceptCookies: typeof acceptCookies;
      getProjectBySlug: typeof getProjectBySlug;
      getUserBySlug: typeof getUserBySlug;
      getAuthUser: typeof getAuthUser;
      apiCreateIdea: typeof apiCreateIdea;
      apiRemoveIdea: typeof apiRemoveIdea;
      apiCreateOfficialFeedback: typeof apiCreateOfficialFeedback;
      apiAddComment: typeof apiAddComment;
      apiRemoveComment: typeof apiRemoveComment;
      apiCreateProject: typeof apiCreateProject;
      apiRemoveProject: typeof apiRemoveProject;
      apiCreatePhase: typeof apiCreatePhase;
      apiCreateCustomField: typeof apiCreateCustomField;
      apiRemoveCustomField: typeof apiRemoveCustomField;
    }
  }
}

export function randomString(length: number = 15) {
  let text = '';
  const possible = 'abcdefghijklmnopqrstuvwxyz0123456789';

  // tslint:disable-next-line
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

export function randomEmail() {
  return `${Math.random().toString(36).substr(2, 12).toLowerCase()}@${Math.random().toString(36).substr(2, 12).toLowerCase()}.com`;
}

export function login(email: string, password: string) {
  cy.visit('/sign-in');
  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.get('.e2e-submit-signin').click();
  cy.wait(1000);
  cy.visit('/');
  cy.wait(1000);
  cy.get('#e2e-landing-page');
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
        last_name: lastName,
      }
    }
  });
}

export function apiCreateAdmin(firstName: string, lastName: string, email: string, password: string) {
  return cy.apiLogin('admin@citizenlab.co', 'testtest').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`

      },
      method: 'POST',
      url: 'web_api/v1/users',
      body: {
        user: {
          email,
          password,
          locale: 'en-GB',
          first_name: firstName,
          last_name: lastName,
          roles: [{ type: 'admin' }],
        }
      }
    });
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
  cy.get('#e2e-cookie-banner').as('cookieBanner');
  cy.get('@cookieBanner').find('.e2e-accept-cookies-btn').click();
}

export function getProjectBySlug(projectSlug: string) {
  return cy.apiLogin('admin@citizenlab.co', 'testtest').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`
      },
      method: 'GET',
      url: `web_api/v1/projects/by_slug/${projectSlug}`
    });
  });
}

export function getAuthUser() {
  return cy.apiLogin('admin@citizenlab.co', 'testtest').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`
      },
      method: 'GET',
      url: 'web_api/v1/users/me'
    });
  });
}

export function getUserBySlug(userSlug: string) {
  return cy.apiLogin('admin@citizenlab.co', 'testtest').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`
      },
      method: 'GET',
      url: `web_api/v1/users/by_slug/${userSlug}`
    });
  });
}

export function apiCreateIdea(
  projectId: string,
  ideaTitle: string,
  ideaContent: string,
  locationGeoJSON?: {'type': string, 'coordinates': number[]},
  locationDescription?: string,
  jwt?: string
) {
  let headers: { 'Content-Type': string; Authorization: string; } | null = null;

  if (jwt) {
    headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`
    };
  }

  return cy.apiLogin('admin@citizenlab.co', 'testtest').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: headers || {
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
          },
          location_point_geojson: locationGeoJSON,
          location_description: locationDescription
        }
      }
    });
  });
}

export function apiRemoveIdea(ideaId: string) {
  return cy.apiLogin('admin@citizenlab.co', 'testtest').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`
      },
      method: 'DELETE',
      url: `web_api/v1/ideas/${ideaId}`,
    });
  });
}

export function apiCreateOfficialFeedback(
  ideaId: string,
  officialFeedbackContent: string,
  officialFeedbackAuthor: string
) {
  return cy.apiLogin('admin@citizenlab.co', 'testtest').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`
      },
      method: 'POST',
      url: `web_api/v1/ideas/${ideaId}/official_feedback`,
      body: {
        official_feedback: {
          body_multiloc: {
            'en-GB': officialFeedbackContent,
            'nl-BE': officialFeedbackContent
          },
          author_multiloc: {
            'en-GB': officialFeedbackAuthor,
            'nl-BE': officialFeedbackAuthor
          },
        }
      }
    });
  });
}

export function apiAddComment(ideaId: string, commentContent: string, commentParentId?: string, jwt?: string) {
  if (jwt) {
    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`
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
  } else {
    return cy.apiLogin('admin@citizenlab.co', 'testtest').then((response) => {
      const adminJwt = response.body.jwt;

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
    });
  }
}

export function apiRemoveComment(commentId: string) {
  return cy.apiLogin('admin@citizenlab.co', 'testtest').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`
      },
      method: 'POST',
      url: `web_api/v1/comments/${commentId}/mark_as_deleted`,
      body: {
        comment: {
          reason_code: 'irrelevant'
        }
      }
    });
  });
}

export function apiCreateProject(
  type: 'timeline' | 'continuous',
  title: string,
  descriptionPreview: string,
  description: string,
  publicationStatus: 'draft' | 'published' | 'archived' = 'published',
  assigneeId?: string
) {
  return cy.apiLogin('admin@citizenlab.co', 'testtest').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`
      },
      method: 'POST',
      url: 'web_api/v1/projects',
      body: {
        project: {
          process_type: type,
          publication_status: publicationStatus,
          title_multiloc: {
            'en-GB': title,
            'nl-BE': title
          },
          description_preview_multiloc: {
            'en-GB': descriptionPreview,
            'nl-BE': descriptionPreview
          },
          description_multiloc: {
            'en-GB': description,
            'nl-BE': description
          },
          default_assignee_id: assigneeId,
        }
      }
    });
  });
}

export function apiRemoveProject(projectId: string) {
  return cy.apiLogin('admin@citizenlab.co', 'testtest').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`
      },
      method: 'DELETE',
      url: `web_api/v1/projects/${projectId}`,
    });
  });
}

export function apiCreatePhase(
  projectId: string,
  title: string,
  startAt: string,
  endAt: string,
  participationMethod: 'ideation' | 'information' | 'survey' | 'budgeting',
  canPost: boolean,
  canVote: boolean,
  canComment: boolean,
  description?: string
) {
  return cy.apiLogin('admin@citizenlab.co', 'testtest').then((response) => {
    const adminJwt = response.body.jwt;
    console.log(description);

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`
      },
      method: 'POST',
      url: `web_api/v1/projects/${projectId}/phases`,
      body: {
        phase: {
          start_at: startAt,
          end_at: endAt,
          title_multiloc: {
            'en-GB': title,
            'nl-BE': title
          },
          participation_method: participationMethod,
          posting_enabled: canPost,
          voting_enabled: canVote,
          commenting_enabled: canComment,
          description_multiloc: { 'en-GB': description }
        }
      }
    });
  });
}

export function apiCreateCustomField(fieldName: string, enabled: boolean, required: boolean) {
  return cy.apiLogin('admin@citizenlab.co', 'testtest').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`
      },
      method: 'POST',
      url: 'web_api/v1/users/custom_fields',
      body: {
        custom_field: {
          enabled,
          required,
          input_type: 'text',
          title_multiloc: {
            'en-GB': fieldName,
            'nl-BE': fieldName
          }
        }
      }
    });
  });
}

export function apiRemoveCustomField(fieldId: string) {
  return cy.apiLogin('admin@citizenlab.co', 'testtest').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`
      },
      method: 'DELETE',
      url: `web_api/v1/users/custom_fields/${fieldId}`
    });
  });
}

Cypress.Commands.add('login', login);
Cypress.Commands.add('apiLogin', apiLogin);
Cypress.Commands.add('apiSignup', apiSignup);
Cypress.Commands.add('apiCreateAdmin', apiCreateAdmin);
Cypress.Commands.add('logout', logout);
Cypress.Commands.add('signup', signup);
Cypress.Commands.add('acceptCookies', acceptCookies);
Cypress.Commands.add('getProjectBySlug', getProjectBySlug);
Cypress.Commands.add('getUserBySlug', getUserBySlug);
Cypress.Commands.add('getAuthUser', getAuthUser);
Cypress.Commands.add('apiCreateIdea', apiCreateIdea);
Cypress.Commands.add('apiRemoveIdea', apiRemoveIdea);
Cypress.Commands.add('apiCreateOfficialFeedback', apiCreateOfficialFeedback);
Cypress.Commands.add('apiAddComment', apiAddComment);
Cypress.Commands.add('apiRemoveComment', apiRemoveComment);
Cypress.Commands.add('apiCreateProject', apiCreateProject);
Cypress.Commands.add('apiRemoveProject', apiRemoveProject);
Cypress.Commands.add('apiCreatePhase', apiCreatePhase);
Cypress.Commands.add('apiCreateCustomField', apiCreateCustomField);
Cypress.Commands.add('apiRemoveCustomField', apiRemoveCustomField);
