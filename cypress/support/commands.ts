import 'cypress-file-upload';

declare global {
  namespace Cypress {
    interface Chainable {
      unregisterServiceWorkers: typeof unregisterServiceWorkers;
      goToLandingPage: typeof goToLandingPage;
      login: typeof login;
      apiLogin: typeof apiLogin;
      setAdminLoginCookie: typeof setAdminLoginCookie;
      setLoginCookie: typeof setLoginCookie;
      apiSignup: typeof apiSignup;
      apiCreateAdmin: typeof apiCreateAdmin;
      apiRemoveUser: typeof apiRemoveUser;
      logout: typeof logout;
      acceptCookies: typeof acceptCookies;
      getIdeaById: typeof getIdeaById;
      getProjectBySlug: typeof getProjectBySlug;
      getProjectById: typeof getProjectById;
      getTopics: typeof getTopics;
      getInitiativeStatuses: typeof getInitiativeStatuses;
      getUserBySlug: typeof getUserBySlug;
      getAuthUser: typeof getAuthUser;
      getArea: typeof getArea;
      apiCreateIdea: typeof apiCreateIdea;
      apiCreateInitiative: typeof apiCreateInitiative;
      apiRemoveIdea: typeof apiRemoveIdea;
      apiRemoveInitiative: typeof apiRemoveInitiative;
      apiUpvoteInitiative: typeof apiUpvoteInitiative;
      apiCreateOfficialFeedbackForIdea: typeof apiCreateOfficialFeedbackForIdea;
      apiCreateOfficialFeedbackForInitiative: typeof apiCreateOfficialFeedbackForInitiative;
      apiAddComment: typeof apiAddComment;
      apiRemoveComment: typeof apiRemoveComment;
      apiCreateProject: typeof apiCreateProject;
      apiCreateFolder: typeof apiCreateFolder;
      apiRemoveFolder: typeof apiRemoveFolder;
      apiRemoveProject: typeof apiRemoveProject;
      apiAddProjectsToFolder: typeof apiAddProjectsToFolder;
      apiCreatePhase: typeof apiCreatePhase;
      apiCreateCustomField: typeof apiCreateCustomField;
      apiRemoveCustomField: typeof apiRemoveCustomField;
      apiAddPoll: typeof apiAddPoll;
      apiVerifyBogus: typeof apiVerifyBogus;
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
  return `${Math.random()
    .toString(36)
    .substr(2, 12)
    .toLowerCase()}@${Math.random()
    .toString(36)
    .substr(2, 12)
    .toLowerCase()}.com`;
}

export function unregisterServiceWorkers() {
  if (navigator.serviceWorker) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
      });
    });
  }
}

export function goToLandingPage() {
  cy.wait(500);
  cy.visit('/');
  cy.get('#e2e-landing-page');
  cy.wait(500);
}

export function login(email: string, password: string) {
  cy.wait(500);
  cy.visit('/');
  cy.get('#e2e-landing-page');
  cy.get('#e2e-navbar');
  cy.get('#e2e-navbar-login-menu-item').click();
  cy.get('#e2e-sign-in-container');
  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.get('#e2e-signin-password-submit-button').click();
  cy.get('#e2e-sign-up-in-modal').should('not.exist');
  cy.get('#e2e-user-menu-container');
  cy.wait(500);
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
        password,
      },
    },
  });
}

export function setLoginCookie(email: string, password: string) {
  cy.apiLogin(email, password).then((res) => {
    cy.setCookie('cl2_jwt', res.body.jwt);
  });
}

export function setAdminLoginCookie() {
  cy.setLoginCookie('admin@citizenlab.co', 'democracy2.0');
}

export function apiSignup(
  firstName: string,
  lastName: string,
  email: string,
  password: string
) {
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
        locale: 'en',
        first_name: firstName,
        last_name: lastName,
      },
    },
  });
}

export function apiCreateAdmin(
  firstName: string,
  lastName: string,
  email: string,
  password: string
) {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'POST',
      url: 'web_api/v1/users',
      body: {
        user: {
          email,
          password,
          locale: 'en',
          first_name: firstName,
          last_name: lastName,
          roles: [{ type: 'admin' }],
        },
      },
    });
  });
}

export function apiRemoveUser(userId: string) {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'DELETE',
      url: `web_api/v1/users/${userId}`,
    });
  });
}

export function apiCreateModeratorForProject(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  projectId: string
) {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'POST',
      url: 'web_api/v1/users',
      body: {
        user: {
          email,
          password,
          locale: 'en',
          first_name: firstName,
          last_name: lastName,
          roles: [
            {
              type: 'project_moderator',
              project_id: projectId,
            },
          ],
        },
      },
    });
  });
}

export function logout() {
  cy.get('#e2e-user-menu-container button').click();
  cy.get('#e2e-sign-out-link').click();
}

export function acceptCookies() {
  cy.get('#e2e-cookie-banner');
  cy.get('#e2e-cookie-banner .e2e-accept-cookies-btn').click();
  cy.wait(200);
}

export function getIdeaById(ideaId: string) {
  return cy.request({
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'GET',
    url: `web_api/v1/ideas/${ideaId}`,
  });
}

export function getProjectBySlug(projectSlug: string) {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'GET',
      url: `web_api/v1/projects/by_slug/${projectSlug}`,
    });
  });
}

export function getProjectById(projectId: string) {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'GET',
      url: `web_api/v1/projects/${projectId}`,
    });
  });
}

export function getTopics() {
  return cy.request({
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'GET',
    url: 'web_api/v1/topics',
  });
}

export function getInitiativeStatuses() {
  return cy.request({
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'GET',
    url: 'web_api/v1/topics',
  });
}

export function getAuthUser() {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'GET',
      url: 'web_api/v1/users/me',
    });
  });
}

export function getArea(areaId: string) {
  return cy.request({
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'GET',
    url: `web_api/v1/areas/${areaId}`,
  });
}

export function getUserBySlug(userSlug: string) {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'GET',
      url: `web_api/v1/users/by_slug/${userSlug}`,
    });
  });
}

export function apiCreateIdea(
  projectId: string,
  ideaTitle: string,
  ideaContent: string,
  locationGeoJSON?: { type: string; coordinates: number[] },
  locationDescription?: string,
  jwt?: string
) {
  let headers: { 'Content-Type': string; Authorization: string } | null = null;

  if (jwt) {
    headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    };
  }

  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: headers || {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'POST',
      url: 'web_api/v1/ideas',
      body: {
        idea: {
          project_id: projectId,
          publication_status: 'published',
          title_multiloc: {
            en: ideaTitle,
            'nl-BE': ideaTitle,
          },
          body_multiloc: {
            en: ideaContent,
            'nl-BE': ideaContent,
          },
          location_point_geojson: locationGeoJSON,
          location_description: locationDescription,
        },
      },
    });
  });
}

export function apiRemoveIdea(ideaId: string) {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'DELETE',
      url: `web_api/v1/ideas/${ideaId}`,
    });
  });
}

export function apiCreateInitiative({
  initiativeTitle,
  initiativeContent,
  assigneeId,
  locationGeoJSON,
  locationDescription,
  jwt,
  topicIds,
}: {
  initiativeTitle: string;
  initiativeContent: string;
  assigneeId?: string;
  locationGeoJSON?: { type: string; coordinates: number[] };
  locationDescription?: string;
  jwt?: string;
  topicIds?: string[];
}) {
  let adminJwt: string;
  let headers: { 'Content-Type': string; Authorization: string } | null = null;

  if (jwt) {
    headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    };
  }

  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    adminJwt = response.body.jwt;

    return cy.request({
      headers: headers || {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'POST',
      url: 'web_api/v1/initiatives',
      body: {
        initiative: {
          publication_status: 'published',
          title_multiloc: {
            en: initiativeTitle,
            'nl-BE': initiativeTitle,
          },
          body_multiloc: {
            en: initiativeContent,
            'nl-BE': initiativeContent,
          },
          location_point_geojson: locationGeoJSON,
          location_description: locationDescription,
          assignee_id: assigneeId,
          topic_ids: topicIds,
        },
      },
    });
  });
}

export function apiRemoveInitiative(initiativeId: string) {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'DELETE',
      url: `web_api/v1/initiatives/${initiativeId}`,
    });
  });
}

export function apiUpvoteInitiative(
  email: string,
  password: string,
  initiativeId: string
) {
  return cy.apiLogin(email, password).then((response) => {
    const jwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      method: 'POST',
      url: `web_api/v1/initiatives/${initiativeId}/votes/up`,
    });
  });
}

export function apiCreateOfficialFeedbackForIdea(
  ideaId: string,
  officialFeedbackContent: string,
  officialFeedbackAuthor: string
) {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'POST',
      url: `web_api/v1/ideas/${ideaId}/official_feedback`,
      body: {
        official_feedback: {
          body_multiloc: {
            en: officialFeedbackContent,
            'nl-BE': officialFeedbackContent,
          },
          author_multiloc: {
            en: officialFeedbackAuthor,
            'nl-BE': officialFeedbackAuthor,
          },
        },
      },
    });
  });
}

export function apiCreateOfficialFeedbackForInitiative(
  initiativeId: string,
  officialFeedbackContent: string,
  officialFeedbackAuthor: string
) {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'POST',
      url: `web_api/v1/initiatives/${initiativeId}/official_feedback`,
      body: {
        official_feedback: {
          body_multiloc: {
            en: officialFeedbackContent,
            'nl-BE': officialFeedbackContent,
          },
          author_multiloc: {
            en: officialFeedbackAuthor,
            'nl-BE': officialFeedbackAuthor,
          },
        },
      },
    });
  });
}

export function apiAddComment(
  postId: string,
  postType: 'idea' | 'initiative',
  commentContent: string,
  commentParentId?: string,
  jwt?: string
) {
  if (jwt) {
    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      method: 'POST',
      url: `web_api/v1/${postType}s/${postId}/comments`,
      body: {
        comment: {
          body_multiloc: {
            en: commentContent,
            'nl-BE': commentContent,
          },
          parent_id: commentParentId,
        },
      },
    });
  } else {
    return cy
      .apiLogin('admin@citizenlab.co', 'democracy2.0')
      .then((response) => {
        const adminJwt = response.body.jwt;

        return cy.request({
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminJwt}`,
          },
          method: 'POST',
          url: `web_api/v1/${postType}s/${postId}/comments`,
          body: {
            comment: {
              body_multiloc: {
                en: commentContent,
                'nl-BE': commentContent,
              },
              parent_id: commentParentId,
            },
          },
        });
      });
  }
}

export function apiRemoveComment(commentId: string) {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'POST',
      url: `web_api/v1/comments/${commentId}/mark_as_deleted`,
      body: {
        comment: {
          reason_code: 'irrelevant',
        },
      },
    });
  });
}

export function apiCreateProject({
  type,
  title,
  descriptionPreview,
  description,
  publicationStatus = 'published',
  participationMethod,
  assigneeId,
  surveyUrl,
  surveyService,
}: {
  type: 'timeline' | 'continuous';
  title: string;
  descriptionPreview: string;
  description: string;
  publicationStatus?: 'draft' | 'published' | 'archived';
  participationMethod?:
    | 'ideation'
    | 'information'
    | 'survey'
    | 'budgeting'
    | 'poll';
  assigneeId?: string;
  surveyUrl?: string;
  surveyService?: 'typeform' | 'survey_monkey' | 'google_forms';
}) {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'POST',
      url: 'web_api/v1/projects',
      body: {
        project: {
          process_type: type,
          admin_publication_attributes: {
            publication_status: publicationStatus,
          },
          title_multiloc: {
            en: title,
            'nl-BE': title,
          },
          description_preview_multiloc: {
            en: descriptionPreview,
            'nl-BE': descriptionPreview,
          },
          description_multiloc: {
            en: description,
            'nl-BE': description,
          },
          default_assignee_id: assigneeId,
          participation_method:
            type === 'continuous' && !participationMethod
              ? 'ideation'
              : participationMethod,
          survey_embed_url: surveyUrl,
          survey_service: surveyService,
        },
      },
    });
  });
}

export function apiCreateFolder({
  type,
  title,
  descriptionPreview,
  description,
  publicationStatus = 'published',
}: {
  type: 'timeline' | 'continuous';
  title: string;
  descriptionPreview: string;
  description: string;
  publicationStatus?: 'draft' | 'published' | 'archived';
  projectIds?: string[];
}) {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'POST',
      url: 'web_api/v1/project_folders',
      body: {
        project_folder: {
          process_type: type,
          admin_publication_attributes: {
            publication_status: publicationStatus,
          },
          title_multiloc: {
            en: title,
            'nl-BE': title,
          },
          description_preview_multiloc: {
            en: descriptionPreview,
            'nl-BE': descriptionPreview,
          },
          description_multiloc: {
            en: description,
            'nl-BE': description,
          },
        },
      },
    });
  });
}

export function apiAddProjectsToFolder(projectIds: string[], folderId: string) {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    projectIds.map((projectId) => {
      cy.request({
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminJwt}`,
        },
        method: 'PATCH',
        url: `web_api/v1/projects/${projectId}`,
        body: { project: { folder_id: folderId } },
      });
    });
  });
}
export function apiRemoveProject(projectId: string) {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'DELETE',
      url: `web_api/v1/projects/${projectId}`,
    });
  });
}

export function apiRemoveFolder(folderId: string) {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'DELETE',
      url: `web_api/v1/project_folders/${folderId}`,
    });
  });
}

export function apiAddPoll(
  type: 'Project' | 'Phase',
  id: string,
  questions: { title: string; type: 'single_option' | 'multiple_options' }[],
  options: string[][]
) {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    questions.forEach((question, index) => {
      cy.request({
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminJwt}`,
        },
        method: 'POST',
        url: 'web_api/v1/poll_questions',
        body: {
          participation_context_id: id,
          participation_context_type: type,
          title_multiloc: { en: question.title },
          question_type: question.type,
          max_options: question.type === 'single_option' ? null : '2',
        },
      }).then((question) => {
        options[index].forEach((option) => {
          cy.request({
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${adminJwt}`,
            },
            method: 'POST',
            url: `web_api/v1/poll_questions/${question.body.data.id}/poll_options`,
            body: {
              title_multiloc: { en: option },
            },
          });
        });
      });
    });
  });
}

export function apiCreatePhase(
  projectId: string,
  title: string,
  startAt: string,
  endAt: string,
  participationMethod:
    | 'ideation'
    | 'information'
    | 'survey'
    | 'budgeting'
    | 'poll',
  canPost: boolean,
  canVote: boolean,
  canComment: boolean,
  description?: string,
  surveyUrl?: string,
  surveyService?: 'typeform' | 'survey_monkey' | 'google_forms'
) {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'POST',
      url: `web_api/v1/projects/${projectId}/phases`,
      body: {
        phase: {
          start_at: startAt,
          end_at: endAt,
          title_multiloc: {
            en: title,
            'nl-BE': title,
          },
          participation_method: participationMethod,
          posting_enabled: canPost,
          voting_enabled: canVote,
          commenting_enabled: canComment,
          description_multiloc: { en: description },
          survey_embed_url: surveyUrl,
          survey_service: surveyService,
        },
      },
    });
  });
}

export function apiCreateCustomField(
  fieldName: string,
  enabled: boolean,
  required: boolean
) {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'POST',
      url: 'web_api/v1/users/custom_fields',
      body: {
        custom_field: {
          enabled,
          required,
          input_type: 'text',
          title_multiloc: {
            en: fieldName,
            'nl-BE': fieldName,
          },
        },
      },
    });
  });
}

export function apiRemoveCustomField(fieldId: string) {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'DELETE',
      url: `web_api/v1/users/custom_fields/${fieldId}`,
    });
  });
}

export function apiVerifyBogus(jwt: string, error?: string) {
  return cy.request({
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    method: 'POST',
    url: 'web_api/v1/verification_methods/bogus/verification',
    body: {
      verification: {
        desired_error: error || '',
      },
    },
  });
}

Cypress.Commands.add('unregisterServiceWorkers', unregisterServiceWorkers);
Cypress.Commands.add('goToLandingPage', goToLandingPage);
Cypress.Commands.add('login', login);
Cypress.Commands.add('apiLogin', apiLogin);
Cypress.Commands.add('apiSignup', apiSignup);
Cypress.Commands.add('apiCreateAdmin', apiCreateAdmin);
Cypress.Commands.add('apiRemoveUser', apiRemoveUser);
Cypress.Commands.add('logout', logout);
Cypress.Commands.add('acceptCookies', acceptCookies);
Cypress.Commands.add('getIdeaById', getIdeaById);
Cypress.Commands.add('getProjectBySlug', getProjectBySlug);
Cypress.Commands.add('getProjectById', getProjectById);
Cypress.Commands.add('getTopics', getTopics);
Cypress.Commands.add('getInitiativeStatuses', getInitiativeStatuses);
Cypress.Commands.add('getUserBySlug', getUserBySlug);
Cypress.Commands.add('getAuthUser', getAuthUser);
Cypress.Commands.add('getArea', getArea);
Cypress.Commands.add('apiCreateIdea', apiCreateIdea);
Cypress.Commands.add('apiRemoveIdea', apiRemoveIdea);
Cypress.Commands.add('apiCreateInitiative', apiCreateInitiative);
Cypress.Commands.add('apiRemoveInitiative', apiRemoveInitiative);
Cypress.Commands.add('apiUpvoteInitiative', apiUpvoteInitiative);
Cypress.Commands.add(
  'apiCreateOfficialFeedbackForIdea',
  apiCreateOfficialFeedbackForIdea
);
Cypress.Commands.add(
  'apiCreateOfficialFeedbackForInitiative',
  apiCreateOfficialFeedbackForInitiative
);
Cypress.Commands.add('apiAddComment', apiAddComment);
Cypress.Commands.add('apiRemoveComment', apiRemoveComment);
Cypress.Commands.add('apiCreateProject', apiCreateProject);
Cypress.Commands.add('apiCreateFolder', apiCreateFolder);
Cypress.Commands.add('apiRemoveFolder', apiRemoveFolder);
Cypress.Commands.add('apiRemoveProject', apiRemoveProject);
Cypress.Commands.add('apiAddProjectsToFolder', apiAddProjectsToFolder);
Cypress.Commands.add('apiCreatePhase', apiCreatePhase);
Cypress.Commands.add('apiCreateCustomField', apiCreateCustomField);
Cypress.Commands.add('apiRemoveCustomField', apiRemoveCustomField);
Cypress.Commands.add('apiAddPoll', apiAddPoll);
Cypress.Commands.add('setAdminLoginCookie', setAdminLoginCookie);
Cypress.Commands.add('setLoginCookie', setLoginCookie);
Cypress.Commands.add('apiVerifyBogus', apiVerifyBogus);
