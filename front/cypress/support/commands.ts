import 'cypress-file-upload';
import './dnd';
import {
  ParticipationMethod,
  VotingMethod,
} from '../../app/utils/participationContexts';
import { IUserUpdate } from '../../app/api/users/types';
import { IUpdatedAppConfigurationProperties } from '../../app/api/app_configuration/types';

import jwtDecode from 'jwt-decode';
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      unregisterServiceWorkers: typeof unregisterServiceWorkers;
      goToLandingPage: typeof goToLandingPage;
      login: typeof login;
      signUp: typeof signUp;
      apiLogin: typeof apiLogin;
      setAdminLoginCookie: typeof setAdminLoginCookie;
      setConsentCookie: typeof setConsentCookie;
      setConsentAndAdminLoginCookies: typeof setConsentAndAdminLoginCookies;
      setLoginCookie: typeof setLoginCookie;
      apiSignup: typeof apiSignup;
      apiCreateAdmin: typeof apiCreateAdmin;
      apiUpdateCurrentUser: typeof apiUpdateCurrentUser;
      apiRemoveUser: typeof apiRemoveUser;
      apiGetUsersCount: typeof apiGetUsersCount;
      apiGetSeats: typeof apiGetSeats;
      apiGetAppConfiguration: typeof apiGetAppConfiguration;
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
      apiLikeInitiative: typeof apiLikeInitiative;
      apiDislikeIdea: typeof apiDislikeIdea;
      apiCreateOfficialFeedbackForIdea: typeof apiCreateOfficialFeedbackForIdea;
      apiCreateOfficialFeedbackForInitiative: typeof apiCreateOfficialFeedbackForInitiative;
      apiAddComment: typeof apiAddComment;
      apiRemoveComment: typeof apiRemoveComment;
      apiCreateProject: typeof apiCreateProject;
      apiEditProject: typeof apiEditProject;
      apiCreateFolder: typeof apiCreateFolder;
      apiRemoveFolder: typeof apiRemoveFolder;
      apiRemoveProject: typeof apiRemoveProject;
      apiRemoveCustomPage: typeof apiRemoveCustomPage;
      apiCreateCustomPage: typeof apiCreateCustomPage;
      apiAddProjectsToFolder: typeof apiAddProjectsToFolder;
      apiCreatePhase: typeof apiCreatePhase;
      apiCreateCustomField: typeof apiCreateCustomField;
      apiRemoveCustomField: typeof apiRemoveCustomField;
      apiAddPoll: typeof apiAddPoll;
      apiVerifyBogus: typeof apiVerifyBogus;
      apiCreateEvent: typeof apiCreateEvent;
      apiEnableProjectDescriptionBuilder: typeof apiEnableProjectDescriptionBuilder;
      apiCreateReportBuilder: typeof apiCreateReportBuilder;
      apiRemoveReportBuilder: typeof apiRemoveReportBuilder;
      intersectsViewport: typeof intersectsViewport;
      notIntersectsViewport: typeof notIntersectsViewport;
      apiUpdateHomepageSettings: typeof apiUpdateHomepageSettings;
      apiUpdateAppConfiguration: typeof apiUpdateAppConfiguration;
      clickLocaleSwitcherAndType: typeof clickLocaleSwitcherAndType;
    }
  }
}

export function randomString(length = 15) {
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
  cy.get('#e2e-authentication-modal');
  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.get('#e2e-signin-password-submit-button').click();
  cy.get('#e2e-user-menu-container');
  cy.wait(500);
}

export function signUp() {
  cy.goToLandingPage();
  cy.get('#e2e-navbar-signup-menu-item').click();
  cy.get('#e2e-sign-up-container');
  cy.get('#e2e-sign-up-email-password-container');

  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();

  cy.get('#firstName').type(firstName);
  cy.get('#lastName').type(lastName);
  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.get('.e2e-terms-and-conditions .e2e-checkbox').click();
  cy.get('.e2e-privacy-checkbox .e2e-checkbox').click();
  cy.get('#e2e-signup-password-submit-button').wait(500).click().wait(500);

  cy.get('#e2e-confirmation-code-input').type('1234');
  cy.get('#e2e-confirmation-button').click();

  cy.get('.e2e-signup-success-close-button').wait(500).click();
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
  return cy.apiLogin(email, password).then((res) => {
    cy.setCookie('cl2_jwt', res.body.jwt);
  });
}

export function setAdminLoginCookie() {
  cy.setLoginCookie('admin@citizenlab.co', 'democracy2.0');
}

export function setConsentCookie() {
  cy.setCookie(
    'cl2_consent',
    '{%22analytics%22:true%2C%22advertising%22:true%2C%22functional%22:true%2C%22savedChoices%22:{%22google_tag_manager%22:true%2C%22matomo%22:true%2C%22google_analytics%22:true%2C%22intercom%22:true%2C%22segment%22:true}}'
  );
}

export function setConsentAndAdminLoginCookies() {
  cy.setConsentCookie();
  cy.setAdminLoginCookie();
}

function emailSignup(
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

function emailConfirmation(jwt: any) {
  return cy.request({
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    method: 'POST',
    url: 'web_api/v1/user/confirm',
    body: {
      confirmation: { code: '1234' },
    },
  });
}

export function apiSignup(
  firstName: string,
  lastName: string,
  email: string,
  password: string
) {
  let originalResponse: Cypress.Response<any>;

  return emailSignup(firstName, lastName, email, password).then((response) => {
    originalResponse = response;

    return cy.apiLogin(email, password).then((response) => {
      const jwt = response.body.jwt;

      return emailConfirmation(jwt).then(() => {
        return originalResponse;
      });
    });
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

export function apiUpdateCurrentUser(attrs: IUserUpdate) {
  cy.getCookie('cl2_jwt').then((cookie) => {
    if (!cookie) {
      return;
    }
    const jwt = cookie.value;
    const userId = jwtDecode<{ sub: string }>(jwt).sub;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      method: 'PATCH',
      url: `web_api/v1/users/${userId}`,
      body: {
        user: attrs,
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

export function apiGetUsersCount() {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'GET',
      url: `web_api/v1/stats/users_count`,
    });
  });
}

export function apiGetSeats() {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'GET',
      url: `web_api/v1/users/seats`,
    });
  });
}

export function apiGetAppConfiguration() {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'GET',
      url: `web_api/v1/app_configuration`,
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
  cy.clearCookies();
  cy.reload();
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
  jwt?: string,
  budget?: number,
  anonymous?: boolean
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
          budget,
          anonymous,
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

export function apiLikeInitiative(
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
      url: `web_api/v1/initiatives/${initiativeId}/reactions/up`,
    });
  });
}

export function apiDislikeIdea(
  email: string,
  password: string,
  ideaId: string
) {
  return cy.apiLogin(email, password).then((response) => {
    const jwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      method: 'POST',
      url: `web_api/v1/ideas/${ideaId}/reactions/down`,
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
  votingMethod,
  assigneeId,
  surveyUrl,
  surveyService,
  votingMaxTotal,
  votingMaxVotesPerIdea,
  postingEnabled,
  allow_anonymous_participation,
}: {
  type: 'timeline' | 'continuous';
  title: string;
  descriptionPreview: string;
  description: string;
  publicationStatus?: 'draft' | 'published' | 'archived';
  participationMethod?: ParticipationMethod;
  votingMethod?: VotingMethod;
  assigneeId?: string;
  surveyUrl?: string;
  votingMaxTotal?: number;
  votingMaxVotesPerIdea?: number;
  surveyService?: 'typeform' | 'survey_monkey' | 'google_forms';
  postingEnabled?: boolean;
  allow_anonymous_participation?: boolean;
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
            'nl-NL': title,
            'fr-BE': title,
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
          voting_method: votingMethod,
          survey_embed_url: surveyUrl,
          survey_service: surveyService,
          voting_max_total: votingMaxTotal,
          voting_max_votes_per_idea: votingMaxVotesPerIdea,
          posting_enabled: postingEnabled,
          allow_anonymous_participation: allow_anonymous_participation,
        },
      },
    });
  });
}

export function apiEditProject({
  projectId,
  type,
  title,
  descriptionPreview,
  description,
  publicationStatus = 'published',
  assigneeId,
  surveyUrl,
  surveyService,
  votingMaxTotal,
}: {
  projectId: string;
  type?: 'timeline' | 'continuous';
  title?: string;
  descriptionPreview?: string;
  description?: string;
  publicationStatus?: 'draft' | 'published' | 'archived';
  assigneeId?: string;
  surveyUrl?: string;
  votingMaxTotal?: number;
  surveyService?: 'typeform' | 'survey_monkey' | 'google_forms';
}) {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'PATCH',
      url: `web_api/v1/projects/${projectId}`,
      body: {
        project: {
          ...(type && { process_type: type }),
          ...(publicationStatus && {
            admin_publication_attributes: {
              publication_status: publicationStatus,
            },
          }),
          ...(title && {
            title_multiloc: {
              en: title,
              'nl-BE': title,
            },
          }),
          ...(descriptionPreview && {
            description_preview_multiloc: {
              en: descriptionPreview,
              'nl-BE': descriptionPreview,
            },
          }),
          ...(description && {
            description_multiloc: {
              en: description,
              'nl-BE': description,
            },
          }),
          ...(assigneeId && { default_assignee_id: assigneeId }),
          ...(surveyUrl && { survey_embed_url: surveyUrl }),
          ...(surveyService && { survey_service: surveyService }),
          ...(votingMaxTotal && { voting_max_total: votingMaxTotal }),
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

export function apiCreateCustomPage(title: string) {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'POST',
      url: `web_api/v1/static_pages`,
      body: {
        static_page: {
          projects_filter_type: 'no_filter',
          topic_ids: [],
          title_multiloc: {
            en: title,
            'nl-BE': title,
            'nl-NL': title,
            'fr-BE': title,
          },
        },
      },
    });
  });
}
export function apiRemoveCustomPage(customPageId: string) {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'DELETE',
      url: `web_api/v1/static_pages/${customPageId}`,
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

export function apiCreatePhase({
  projectId,
  title,
  startAt,
  endAt,
  participationMethod,
  canPost,
  canReact,
  canComment,
  description,
  surveyUrl,
  surveyService,
  votingMaxTotal,
  allow_anonymous_participation,
  votingMethod,
}: {
  projectId: string;
  title: string;
  startAt: string;
  endAt: string;
  participationMethod: ParticipationMethod;
  canPost: boolean;
  canReact: boolean;
  canComment: boolean;
  description?: string;
  surveyUrl?: string;
  surveyService?: 'typeform' | 'survey_monkey' | 'google_forms';
  votingMaxTotal?: number;
  allow_anonymous_participation?: boolean;
  votingMethod?: VotingMethod;
}) {
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
          voting_method: votingMethod,
          posting_enabled: canPost,
          reacting_enabled: canReact,
          commenting_enabled: canComment,
          description_multiloc: { en: description },
          survey_embed_url: surveyUrl,
          survey_service: surveyService,
          voting_max_total: votingMaxTotal,
          allow_anonymous_participation: allow_anonymous_participation,
          campaigns_settings: { project_phase_started: true },
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

export function apiCreateEvent({
  projectId,
  title,
  description,
  includeLocation,
  location,
  startDate,
  endDate,
  onlineLink,
}: {
  projectId: string;
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  includeLocation?: boolean;
  onlineLink?: string;
}) {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'POST',
      url: `web_api/v1/projects/${projectId}/events`,
      body: {
        event: {
          project_id: projectId,
          title_multiloc: {
            en: title,
            'nl-BE': title,
          },
          description_multiloc: {
            en: description,
            'nl-BE': description,
          },
          address_1: location,
          location_point_geojson: includeLocation
            ? {
                type: 'Point',
                coordinates: [4.418731568531502, 50.86899604801978],
              }
            : undefined,
          start_at: startDate.toJSON(),
          end_at: endDate.toJSON(),
          online_link: onlineLink,
        },
      },
    });
  });
}

export function apiEnableProjectDescriptionBuilder({
  projectId,
}: {
  projectId: string;
}) {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'POST',
      url: `web_api/v1/projects/${projectId}/content_builder_layouts/project_description/upsert`,
      body: {
        content_builder_layout: {
          enabled: true,
        },
      },
    });
  });
}

export function apiCreateReportBuilder() {
  const reportName = randomString();
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'POST',
      url: 'web_api/v1/reports',
      body: {
        report: {
          name: reportName,
        },
      },
    });
  });
}

export function apiRemoveReportBuilder(reportId: string) {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'DELETE',
      url: `web_api/v1/reports/${reportId}`,
    });
  });
}

export function apiUpdateAppConfiguration(
  updatedAttributes: IUpdatedAppConfigurationProperties
) {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'PATCH',
      url: `web_api/v1/app_configuration/`,
      body: {
        app_configuration: {
          updatedAttributes,
        },
      },
    });
  });
}

export function clickLocaleSwitcherAndType(title: string) {
  cy.get('.e2e-localeswitcher').each((button) => {
    cy.wrap(button).click();
    cy.get('#title_multiloc').clear().type(title);
  });
}

export function apiUpdateHomepageSettings({
  top_info_section_enabled,
  bottom_info_section_enabled,
  banner_avatars_enabled,
  events_widget_enabled,
  banner_layout,
  banner_signed_out_header_multiloc,
  banner_signed_out_subheader_multiloc,
  banner_signed_in_header_multiloc,
  banner_cta_signed_out_text_multiloc,
  banner_signed_out_header_overlay_color,
  banner_signed_out_header_overlay_opacity,
  banner_cta_signed_out_type,
  banner_cta_signed_in_type,
  header_bg,
}: {
  top_info_section_enabled?: boolean;
  bottom_info_section_enabled?: boolean;
  banner_avatars_enabled?: boolean;
  events_widget_enabled?: boolean;
  banner_layout?: string;
  banner_signed_out_header_multiloc?: Record<string, string>;
  banner_signed_out_subheader_multiloc?: Record<string, string>;
  banner_signed_in_header_multiloc?: Record<string, string>;
  banner_cta_signed_out_text_multiloc?: Record<string, string>;
  banner_signed_out_header_overlay_color?: string;
  banner_signed_out_header_overlay_opacity?: number;
  banner_cta_signed_out_type?: string;
  banner_cta_signed_in_type?: string;
  header_bg?: string;
}) {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'PATCH',
      url: `web_api/v1/home_page/`,
      body: {
        home_page: {
          top_info_section_enabled,
          bottom_info_section_enabled,
          banner_avatars_enabled,
          events_widget_enabled,
          banner_layout,
          banner_signed_out_header_multiloc,
          banner_signed_out_subheader_multiloc,
          banner_signed_in_header_multiloc,
          banner_cta_signed_out_text_multiloc,
          banner_signed_out_header_overlay_color,
          banner_signed_out_header_overlay_opacity,
          banner_cta_signed_in_type,
          banner_cta_signed_out_type,
          header_bg,
        },
      },
    });
  });
}

// https://stackoverflow.com/a/16012490
interface Bbox {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

function bboxesIntersect(a: Bbox, b: Bbox) {
  return (
    a.right >= b.left &&
    a.left <= b.right &&
    a.top <= b.bottom &&
    a.bottom >= b.top
  );
}

export function intersectsViewport(subject?: any) {
  const viewportWidth = Cypress.config('viewportWidth');
  const viewportHeight = Cypress.config('viewportHeight');

  const bboxElement: Bbox = subject[0].getBoundingClientRect();
  const bboxViewport: Bbox = {
    left: 0,
    right: viewportWidth,
    top: 0,
    bottom: viewportHeight,
  };

  expect(bboxesIntersect(bboxElement, bboxViewport)).to.be.true;
}

export function notIntersectsViewport(subject?: any) {
  const viewportWidth = Cypress.config('viewportWidth');
  const viewportHeight = Cypress.config('viewportHeight');

  const bboxElement: Bbox = subject[0].getBoundingClientRect();
  const bboxViewport: Bbox = {
    left: 0,
    right: viewportWidth,
    top: 0,
    bottom: viewportHeight,
  };

  expect(bboxesIntersect(bboxElement, bboxViewport)).to.be.false;
}

Cypress.Commands.add('unregisterServiceWorkers', unregisterServiceWorkers);
Cypress.Commands.add('goToLandingPage', goToLandingPage);
Cypress.Commands.add('login', login);
Cypress.Commands.add('signUp', signUp);
Cypress.Commands.add('apiLogin', apiLogin);
Cypress.Commands.add('apiSignup', apiSignup);
Cypress.Commands.add('apiCreateAdmin', apiCreateAdmin);
Cypress.Commands.add('apiUpdateCurrentUser', apiUpdateCurrentUser);
Cypress.Commands.add('apiRemoveUser', apiRemoveUser);
Cypress.Commands.add('apiGetUsersCount', apiGetUsersCount);
Cypress.Commands.add('apiGetSeats', apiGetSeats);
Cypress.Commands.add('apiGetAppConfiguration', apiGetAppConfiguration);
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
Cypress.Commands.add('apiDislikeIdea', apiDislikeIdea);
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
Cypress.Commands.add('apiEditProject', apiEditProject);
Cypress.Commands.add('apiCreateFolder', apiCreateFolder);
Cypress.Commands.add('apiRemoveFolder', apiRemoveFolder);
Cypress.Commands.add('apiRemoveProject', apiRemoveProject);
Cypress.Commands.add('apiAddProjectsToFolder', apiAddProjectsToFolder);
Cypress.Commands.add('apiCreatePhase', apiCreatePhase);
Cypress.Commands.add('apiCreateCustomField', apiCreateCustomField);
Cypress.Commands.add('apiRemoveCustomField', apiRemoveCustomField);
Cypress.Commands.add('apiAddPoll', apiAddPoll);
Cypress.Commands.add('setAdminLoginCookie', setAdminLoginCookie);
Cypress.Commands.add(
  'setConsentAndAdminLoginCookies',
  setConsentAndAdminLoginCookies
);
Cypress.Commands.add('setConsentCookie', setConsentCookie);
Cypress.Commands.add('setLoginCookie', setLoginCookie);
Cypress.Commands.add('apiVerifyBogus', apiVerifyBogus);
Cypress.Commands.add('apiCreateEvent', apiCreateEvent);
Cypress.Commands.add(
  'apiEnableProjectDescriptionBuilder',
  apiEnableProjectDescriptionBuilder
);
Cypress.Commands.add('apiCreateReportBuilder', apiCreateReportBuilder);
Cypress.Commands.add('apiRemoveReportBuilder', apiRemoveReportBuilder);
Cypress.Commands.add(
  'intersectsViewport',
  { prevSubject: true },
  intersectsViewport
);
Cypress.Commands.add(
  'notIntersectsViewport',
  { prevSubject: true },
  notIntersectsViewport
);
Cypress.Commands.add('apiUpdateHomepageSettings', apiUpdateHomepageSettings);
Cypress.Commands.add('apiRemoveCustomPage', apiRemoveCustomPage);
Cypress.Commands.add('apiCreateCustomPage', apiCreateCustomPage);
Cypress.Commands.add('clickLocaleSwitcherAndType', clickLocaleSwitcherAndType);
