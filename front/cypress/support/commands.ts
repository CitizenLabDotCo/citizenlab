import 'cypress-file-upload';
import './dnd';
import * as moment from 'moment';
import { IUserUpdate } from '../../app/api/users/types';
import { IUpdatedAppConfigurationProperties } from '../../app/api/app_configuration/types';
import { IProjectAttributes } from '../../app/api/projects/types';
import { ICustomFieldInputType } from '../../app/api/custom_fields/types';
import { Multiloc } from '../../app/typings';

import jwtDecode from 'jwt-decode';
import { ParticipationMethod, VotingMethod } from '../../app/api/phases/types';
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      dataCy: typeof dataCy;
      unregisterServiceWorkers: typeof unregisterServiceWorkers;
      goToLandingPage: typeof goToLandingPage;
      login: typeof login;
      signUp: typeof signUp;
      apiLogin: typeof apiLogin;
      setAdminLoginCookie: typeof setAdminLoginCookie;
      setModeratorLoginCookie: typeof setModeratorLoginCookie;
      setConsentCookie: typeof setConsentCookie;
      setConsentAndAdminLoginCookies: typeof setConsentAndAdminLoginCookies;
      setLoginCookie: typeof setLoginCookie;
      apiSignup: typeof apiSignup;
      apiCreateAdmin: typeof apiCreateAdmin;
      apiConfirmUser: typeof apiConfirmUser;
      apiUpdateCurrentUser: typeof apiUpdateCurrentUser;
      apiRemoveUser: typeof apiRemoveUser;
      apiGetUsersCount: typeof apiGetUsersCount;
      apiGetSeats: typeof apiGetSeats;
      apiGetAppConfiguration: typeof apiGetAppConfiguration;
      apiGetCommunityMonitorProject: typeof apiGetCommunityMonitorProject;
      logout: typeof logout;
      acceptCookies: typeof acceptCookies;
      getIdeaById: typeof getIdeaById;
      getProjectBySlug: typeof getProjectBySlug;
      getProjectById: typeof getProjectById;
      getTopics: typeof getTopics;
      getUserBySlug: typeof getUserBySlug;
      getAuthUser: typeof getAuthUser;
      getArea: typeof getArea;
      apiCreateIdea: typeof apiCreateIdea;
      apiRemoveIdea: typeof apiRemoveIdea;
      apiLikeIdea: typeof apiLikeIdea;
      apiDislikeIdea: typeof apiDislikeIdea;
      apiCreateOfficialFeedbackForIdea: typeof apiCreateOfficialFeedbackForIdea;
      apiAddComment: typeof apiAddComment;
      apiRemoveComment: typeof apiRemoveComment;
      apiCreateProject: typeof apiCreateProject;
      apiEditProject: typeof apiEditProject;
      apiEditPhase: typeof apiEditPhase;
      apiCreateFolder: typeof apiCreateFolder;
      apiRemoveFolder: typeof apiRemoveFolder;
      apiRemoveProject: typeof apiRemoveProject;
      apiRemovePhase: typeof apiRemovePhase;
      apiRemoveCustomPage: typeof apiRemoveCustomPage;
      apiCreateCustomPage: typeof apiCreateCustomPage;
      apiAddProjectsToFolder: typeof apiAddProjectsToFolder;
      apiCreatePhase: typeof apiCreatePhase;
      apiCreateCustomField: typeof apiCreateCustomField;
      apiCreateCustomFieldOption: typeof apiCreateCustomFieldOption;
      apiRemoveCustomField: typeof apiRemoveCustomField;
      apiAddPoll: typeof apiAddPoll;
      apiVerifyBogus: typeof apiVerifyBogus;
      apiCreateEvent: typeof apiCreateEvent;
      apiToggleProjectDescriptionBuilder: typeof apiToggleProjectDescriptionBuilder;
      apiCreateReportBuilder: typeof apiCreateReportBuilder;
      apiRemoveReportBuilder: typeof apiRemoveReportBuilder;
      apiRemoveAllReports: typeof apiRemoveAllReports;
      apiSetPhasePermission: typeof apiSetPhasePermission;
      apiGetPhasePermission: typeof apiGetPhasePermission;
      intersectsViewport: typeof intersectsViewport;
      notIntersectsViewport: typeof notIntersectsViewport;
      apiUpdateHomepageLayout: typeof apiUpdateHomepageLayout;
      apiUpdateAppConfiguration: typeof apiUpdateAppConfiguration;
      clickLocaleSwitcherAndType: typeof clickLocaleSwitcherAndType;
      apiCreateSmartGroupCustomField: typeof apiCreateSmartGroupCustomField;
      apiRemoveSmartGroup: typeof apiRemoveSmartGroup;
      apiUpdatePermissionCustomField: typeof apiUpdatePermissionCustomField;
      apiCreateSurveyQuestions: typeof apiCreateSurveyQuestions;
      apiUpdateUserCustomFields: typeof apiUpdateUserCustomFields;
      apiCreateSurveyResponse: typeof apiCreateSurveyResponse;
      uploadSurveyImageQuestionImage: typeof uploadSurveyImageQuestionImage;
      apiGetSurveySchema: typeof apiGetSurveySchema;
      uploadProjectFolderImage: typeof uploadProjectFolderImage;
      uploadProjectImage: typeof uploadProjectImage;
      apiCreateModeratorForProject: typeof apiCreateModeratorForProject;
      apiCreateNativeSurveyPhase: typeof apiCreateNativeSurveyPhase;
      createProjectWithNativeSurveyPhase: typeof createProjectWithNativeSurveyPhase;
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

function unregisterServiceWorkers() {
  if (navigator.serviceWorker) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
      });
    });
  }
}

function goToLandingPage() {
  cy.visit('/');
}

function login(email: string, password: string) {
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

function signUp() {
  cy.goToLandingPage();
  cy.get('#e2e-navbar-login-menu-item').click();
  cy.get('#e2e-goto-signup').click();
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

function apiLogin(email: string, password: string) {
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

function setLoginCookie(email: string, password: string) {
  return cy.apiLogin(email, password).then((res) => {
    cy.setCookie('cl2_jwt', res.body.jwt);
  });
}

function setAdminLoginCookie() {
  cy.setLoginCookie('admin@govocal.com', 'democracy2.0');
}

function setModeratorLoginCookie() {
  cy.setLoginCookie('moderator@govocal.com', 'democracy2.0');
}

function setConsentCookie() {
  cy.setCookie(
    'cl2_consent',
    '{%22analytics%22:true%2C%22advertising%22:true%2C%22functional%22:true%2C%22savedChoices%22:{%22google_tag_manager%22:true%2C%22matomo%22:true%2C%22google_analytics%22:true%2C%22intercom%22:true%2C%22segment%22:true}}'
  );
}

function setConsentAndAdminLoginCookies() {
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

function apiSignup(
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
        return {
          ...originalResponse,
          _jwt: jwt,
        };
      });
    });
  });
}

function apiConfirmUser(email: string, password: string) {
  return cy.apiLogin(email, password).then((response) => {
    const jwt = response.body.jwt;

    return emailConfirmation(jwt);
  });
}

function apiCreateAdmin(
  firstName: string,
  lastName: string,
  email: string,
  password: string
) {
  /*
  IMPORTANT: at the time of writing, this does not increase additional_admins_number in appConfig correctly,
  so it's important to remove admins after creating them in order to not influence other tests.
  */
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
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

function apiUpdateCurrentUser(attrs: IUserUpdate) {
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

function apiUpdateUserCustomFields(
  email: string,
  password: string,
  custom_field_values: Record<string, any>,
  jwt?: any
) {
  const makeRequest = (jwt: any) => {
    const userId = jwtDecode<{ sub: string }>(jwt).sub;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      method: 'PATCH',
      url: `web_api/v1/users/${userId}`,
      body: {
        user: {
          custom_field_values,
        },
      },
    });
  };

  if (jwt) {
    return makeRequest(jwt);
  } else {
    return cy.apiLogin(email, password).then((response) => {
      const jwt = response.body.jwt;

      return makeRequest(jwt);
    });
  }
}

function apiRemoveUser(userId: string) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
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

function apiGetUsersCount() {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
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

function apiGetSeats() {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
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

function apiGetAppConfiguration() {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
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

function apiGetCommunityMonitorProject() {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'GET',
      url: `web_api/v1/projects/community_monitor`,
    });
  });
}

function apiCreateModeratorForProject({
  firstName,
  lastName,
  email,
  password,
  projectId,
}: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  projectId: string;
}) {
  return cy.apiSignup(firstName, lastName, email, password).then((response) => {
    const userId = response.body.data.id;
    return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
      const adminJwt = response.body.jwt;

      return cy.request({
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminJwt}`,
        },
        method: 'POST',
        url: `web_api/v1/projects/${projectId}/moderators`,
        body: {
          moderator: {
            user_id: userId,
          },
        },
      });
    });
  });
}

function logout() {
  cy.clearCookies();
  cy.reload();
}

function acceptCookies() {
  cy.get('#e2e-cookie-banner');
  cy.get('#e2e-cookie-banner .e2e-accept-cookies-btn').click();
  cy.wait(200);
}

function getIdeaById(ideaId: string) {
  return cy.request({
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'GET',
    url: `web_api/v1/ideas/${ideaId}`,
  });
}

function getProjectBySlug(projectSlug: string) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
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

function getProjectById(projectId: string) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
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

function getTopics({ excludeCode }: { excludeCode?: string }) {
  return cy.request({
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'GET',
    url: `web_api/v1/topics?exclude_code=${excludeCode}`,
  });
}

function getAuthUser() {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
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

function getArea(areaId: string) {
  return cy.request({
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'GET',
    url: `web_api/v1/areas/${areaId}`,
  });
}

function getUserBySlug(userSlug: string) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
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

type IdeaType = {
  projectId: string;
  ideaTitle: string;
  ideaContent: string;
  locationGeoJSON?: { type: string; coordinates: number[] };
  locationDescription?: string;
  jwt?: string;
  budget?: number;
  anonymous?: boolean;
  phaseIds?: string[];
};

function apiCreateIdea({
  projectId,
  ideaTitle,
  ideaContent,
  locationGeoJSON,
  locationDescription,
  jwt,
  budget,
  anonymous,
  phaseIds,
}: IdeaType) {
  const doRequest = (jwt: string) =>
    cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
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
          phase_ids: phaseIds,
        },
      },
    });

  if (jwt) {
    return doRequest(jwt);
  }

  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;
    return doRequest(adminJwt);
  });
}

function apiRemoveIdea(ideaId: string) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
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

function apiLikeIdea(email: string, password: string, ideaId: string) {
  return cy.apiLogin(email, password).then((response) => {
    const jwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      method: 'POST',
      url: `web_api/v1/ideas/${ideaId}/reactions/up`,
    });
  });
}

function apiDislikeIdea(email: string, password: string, ideaId: string) {
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

function apiCreateOfficialFeedbackForIdea(
  ideaId: string,
  officialFeedbackContent: string,
  officialFeedbackAuthor: string
) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
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

function apiAddComment(
  postId: string,
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
      url: `web_api/v1/ideas/${postId}/comments`,
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
    return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
      const adminJwt = response.body.jwt;

      return cy.request({
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminJwt}`,
        },
        method: 'POST',
        url: `web_api/v1/ideas/${postId}/comments`,
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

function apiRemoveComment(commentId: string) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
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

function apiCreateProject({
  title,
  descriptionPreview,
  description,
  publicationStatus = 'published',
  assigneeId,
  visibleTo,
}: {
  title: string;
  descriptionPreview?: string;
  description: string;
  publicationStatus?: IProjectAttributes['publication_status'];
  assigneeId?: string;
  visibleTo?: IProjectAttributes['visible_to'];
}) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
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
          visible_to: visibleTo,
        },
      },
    });
  });
}

// apiEditPhase can be extended with other phase attributes as needed.
function apiEditPhase({
  phaseId,
  submission_enabled,
}: {
  phaseId: string;
  submission_enabled?: boolean;
}) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'PATCH',
      url: `web_api/v1/phases/${phaseId}`,
      body: {
        phase: {
          submission_enabled,
        },
      },
    });
  });
}

function apiEditProject({
  projectId,
  title,
  descriptionPreview,
  description,
  publicationStatus = 'published',
  assigneeId,
  submission_enabled,
}: {
  projectId: string;
  title?: string;
  descriptionPreview?: string;
  description?: string;
  publicationStatus?: IProjectAttributes['publication_status'];
  assigneeId?: string;
  surveyUrl?: string;
  votingMaxTotal?: number;
  submission_enabled?: boolean;
  surveyService?: 'typeform' | 'survey_monkey' | 'google_forms';
}) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
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
          ...(publicationStatus && {
            admin_publication_attributes: {
              publication_status: publicationStatus,
            },
            submission_enabled,
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
          ...(submission_enabled && {
            submission_enabled,
          }),
          ...(assigneeId && { default_assignee_id: assigneeId }),
        },
      },
    });
  });
}

function apiCreateFolder({
  title,
  descriptionPreview,
  description,
  publicationStatus = 'published',
}: {
  title: string;
  descriptionPreview?: string;
  description: string;
  publicationStatus?: 'draft' | 'published' | 'archived';
}) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
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

function apiAddProjectsToFolder(projectIds: string[], folderId: string) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
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
function apiRemoveProject(projectId: string) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
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

function apiRemovePhase(phaseId: string) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'DELETE',
      url: `web_api/v1/phases/${phaseId}`,
    });
  });
}

function apiRemoveFolder(folderId: string) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
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

function apiCreateCustomPage(title: string) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
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
function apiRemoveCustomPage(customPageId: string) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
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

function apiAddPoll(
  phaseId: string,
  questions: { title: string; type: 'single_option' | 'multiple_options' }[],
  options: string[][]
) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
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
          phase_id: phaseId,
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

function apiCreatePhase({
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
  votingMaxVotesPerIdea,
  votingMinTotal,
  nativeSurveyButtonMultiloc,
  nativeSurveyTitleMultiloc,
  presentation_mode,
  reacting_dislike_enabled,
}: {
  projectId: string;
  title: string;
  startAt: string;
  endAt?: string;
  participationMethod: ParticipationMethod;
  canPost?: boolean;
  canReact?: boolean;
  canComment?: boolean;
  description?: string;
  surveyUrl?: string;
  surveyService?: 'typeform' | 'survey_monkey' | 'google_forms';
  presentation_mode?: 'card' | 'map';
  votingMaxTotal?: number;
  allow_anonymous_participation?: boolean;
  votingMethod?: VotingMethod;
  votingMaxVotesPerIdea?: number;
  votingMinTotal?: number;
  nativeSurveyButtonMultiloc?: Multiloc;
  nativeSurveyTitleMultiloc?: Multiloc;
  reacting_dislike_enabled?: boolean;
}) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
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
          submission_enabled: canPost,
          reacting_enabled: canReact,
          commenting_enabled: canComment,
          presentation_mode,
          description_multiloc: { en: description },
          survey_embed_url: surveyUrl,
          survey_service: surveyService,
          voting_max_total: votingMaxTotal,
          allow_anonymous_participation: allow_anonymous_participation,
          campaigns_settings: { project_phase_started: true },
          voting_max_votes_per_idea: votingMaxVotesPerIdea,
          voting_min_total: votingMinTotal,
          native_survey_button_multiloc: nativeSurveyButtonMultiloc,
          native_survey_title_multiloc: nativeSurveyTitleMultiloc,
          reacting_dislike_enabled,
        },
      },
    });
  });
}

function apiCreateCustomField(
  fieldName: string,
  enabled: boolean,
  required: boolean,
  input_type = 'text'
) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
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
          input_type,
          title_multiloc: {
            en: fieldName,
            'nl-BE': fieldName,
          },
        },
      },
    });
  });
}

function apiCreateCustomFieldOption(optionName: string, customFieldId: string) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'POST',
      url: `web_api/v1/custom_fields/${customFieldId}/custom_field_options`,
      body: {
        title_multiloc: {
          en: optionName,
          'nl-BE': optionName,
        },
      },
    });
  });
}

function apiRemoveCustomField(fieldId: string) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
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

function apiVerifyBogus(jwt: string, error?: string) {
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

function apiCreateEvent({
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
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
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

function apiToggleProjectDescriptionBuilder({
  projectId,
  enabled = true,
}: {
  projectId: string;
  enabled?: boolean;
}) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
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
          enabled,
        },
      },
    });
  });
}

function apiCreateReportBuilder(phaseId?: string, visible: boolean = true) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
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
          name: phaseId ? undefined : randomString(),
          phase_id: phaseId,
          visible: phaseId ? visible : undefined,
        },
      },
    });
  });
}

function removeReport(reportId: string, jwt: any) {
  return cy.request({
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    method: 'DELETE',
    url: `web_api/v1/reports/${reportId}`,
  });
}

function apiRemoveReportBuilder(reportId?: string, jwt?: any) {
  if (!reportId) return;

  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return removeReport(reportId, jwt || adminJwt);
  });
}

function apiRemoveAllReports() {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy
      .request({
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminJwt}`,
        },
        method: 'GET',
        url: 'web_api/v1/reports',
      })
      .then((response) => {
        return Promise.all(
          response.body.data.map((report: any) =>
            removeReport(report.id, adminJwt)
          )
        );
      });
  });
}

type IPhasePermissionAction =
  | 'posting_idea'
  | 'reacting_idea'
  | 'commenting_idea'
  | 'taking_survey'
  | 'taking_poll'
  | 'voting'
  | 'annotating_document'
  | 'attending_event';

type ApiSetPermissionTypeProps = {
  phaseId: string;
  permissionBody?: any;
  action: IPhasePermissionAction;
};
function apiSetPhasePermission({
  phaseId,
  permissionBody,
  action,
}: ApiSetPermissionTypeProps) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'PATCH',
      url: `web_api/v1/phases/${phaseId}/permissions/${action}`,
      body: permissionBody,
    });
  });
}

function apiGetPhasePermission({ phaseId, action }: ApiSetPermissionTypeProps) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'GET',
      url: `web_api/v1/phases/${phaseId}/permissions/${action}`,
    });
  });
}

function apiUpdatePermissionCustomField(
  permissionId: string,
  action: IPhasePermissionAction,
  custom_field_id: string
) {}

// function apiSetPermissionCustomField(
//   phaseId: string,
//   action: IPhasePermissionAction,
//   custom_field_id: string
// ) {
//   return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
//     const adminJwt = response.body.jwt;

//     return cy.request({
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${adminJwt}`,
//       },
//       method: 'POST',
//       url: `web_api/v1/phases/${phaseId}/permissions/${action}/permissions_custom_fields`,
//       body: {
//         custom_field_id,
//         required: true,
//       },
//     });
//   });
// }

function apiUpdateAppConfiguration(
  updatedAttributes: IUpdatedAppConfigurationProperties
) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'PATCH',
      url: `web_api/v1/app_configuration/`,
      body: {
        app_configuration: updatedAttributes,
      },
    });
  });
}

function clickLocaleSwitcherAndType(title: string) {
  cy.get('.e2e-localeswitcher').each((button) => {
    cy.wrap(button).click();
    cy.get('#title_multiloc').clear().type(title);
  });
}

function apiUpdateHomepageLayout({
  craftjs_json,
}: {
  craftjs_json: Record<string, any>;
}) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'POST',
      url: `web_api/v1/home_pages/content_builder_layouts/homepage/upsert`,
      body: {
        content_builder_layout: {
          enabled: true,
          craftjs_json,
        },
      },
    });
  });
}
function apiCreateSmartGroupCustomField(
  groupName: string,
  customFieldId: string,
  customFieldOptionId: string
) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'POST',
      url: 'web_api/v1/groups',
      body: {
        group: {
          membership_type: 'rules',
          membership_counts: 0,
          title_multiloc: {
            en: groupName,
            'nl-BE': groupName,
          },
          rules: [
            {
              customFieldId,
              predicate: 'has_value',
              ruleType: 'custom_field_select',
              value: customFieldOptionId,
            },
          ],
        },
      },
    });
  });
}

function apiRemoveSmartGroup(smartGroupId: string) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'DELETE',
      url: `web_api/v1/groups/${smartGroupId}`,
    });
  });
}

const createBaseCustomField =
  (imageId?: string) => (input_type: ICustomFieldInputType, i: number) => ({
    title_multiloc:
      input_type === 'page' ? {} : { en: `Question: ${input_type}` },
    description_multiloc: {},
    enabled: true,
    id: randomString(),
    key: input_type === 'page' ? 'page_1' : randomString(),
    page_layout: input_type === 'page' ? 'default' : undefined,
    logic: {},
    required: false,
    input_type,
    options: getOptions(input_type, imageId),
    ordering: i,
    ...(input_type === 'linear_scale'
      ? {
          maximum: 5,
          linear_scale_label_1_multiloc: { en: 'Min label' },
          linear_scale_label_5_multiloc: { en: 'Max label' },
        }
      : {}),
  });

const getOptions = (input_type: string, imageId?: string) => {
  if (['select', 'multiselect', 'multiselect_image'].indexOf(input_type) > -1) {
    return [
      {
        temp_id: `TEMP-ID-${randomString()}`,
        title_multiloc: { en: `${input_type}: Option 1` },
        ...(imageId ? { image_id: imageId } : {}),
      },
      {
        temp_id: `TEMP-ID-${randomString()}`,
        title_multiloc: { en: `${input_type}: Option 2` },
        ...(imageId ? { image_id: imageId } : {}),
      },
    ];
  }

  return undefined;
};

function apiCreateSurveyQuestions(
  phaseId: string,
  inputTypes: ICustomFieldInputType[],
  imageId?: string
) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'PATCH',
      url: `web_api/v1/admin/phases/${phaseId}/custom_fields/update_all`,
      body: {
        custom_fields: [
          ...inputTypes.map(createBaseCustomField(imageId)),
          {
            id: randomString(),
            input_type: 'page',
            logic: {},
            required: false,
            enabled: true,
            title_multiloc: {
              en: 'Thank you for sharing your input!',
            },
            key: 'form_end',
            code: null,
            page_layout: 'default',
            description_multiloc: {
              en: 'Your input has been successfully submitted.',
            },
          },
        ],
      },
    });
  });
}

function apiCreateSurveyResponse(
  {
    email,
    password,
    project_id,
    fields,
  }: {
    email?: string;
    password?: string;
    project_id: string;
    fields: Record<string, any>;
  },
  jwt?: any
) {
  const makeRequest = (jwt: any) => {
    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      method: 'POST',
      url: 'web_api/v1/ideas',
      body: {
        idea: {
          publication_status: 'published',
          project_id,
          ...fields,
        },
        method: 'POST',
        url: 'web_api/v1/ideas',
        body: {
          idea: {
            publication_status: 'published',
            project_id,
            ...fields,
          },
        },
      },
    });
  };

  if (jwt) {
    return makeRequest(jwt);
  } else {
    return cy
      .apiLogin(email || 'admin@govocal.com', password || 'democracy2.0')
      .then((response) => {
        const jwt = response.body.jwt;
        return makeRequest(jwt);
      });
  }
}

function uploadSurveyImageQuestionImage(base64: string) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'POST',
      url: 'web_api/v1/custom_field_option_images',
      body: {
        image: { image: base64 },
      },
    });
  });
}

function apiGetSurveySchema(phaseId: string) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'GET',
      url: `web_api/v1/phases/${phaseId}/custom_fields/json_forms_schema`,
    });
  });
}

function uploadProjectFolderImage(folderId: string, base64: string) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'POST',
      url: `web_api/v1/project_folders/${folderId}/images`,
      body: {
        image: { image: base64 },
      },
    });
  });
}

function uploadProjectImage(projectId: string, base64: string) {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'POST',
      url: `web_api/v1/projects/${projectId}/images`,
      body: {
        image: { image: base64 },
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

function intersectsViewport(subject?: any) {
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

function notIntersectsViewport(subject?: any) {
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

function apiCreateNativeSurveyPhase({
  projectId,
  title,
  startAt,
  endAt,
  canPost = true,
  canReact = true,
  canComment = true,
  description,
  nativeSurveyButtonMultiloc = { en: 'Take the survey' },
  nativeSurveyTitleMultiloc = { en: 'Survey' },
  allow_anonymous_participation,
  presentation_mode,
}: {
  projectId: string;
  title: string;
  startAt: string;
  endAt?: string;
  canPost?: boolean;
  canReact?: boolean;
  canComment?: boolean;
  description?: string;
  nativeSurveyButtonMultiloc?: Multiloc;
  nativeSurveyTitleMultiloc?: Multiloc;
  allow_anonymous_participation?: boolean;
  presentation_mode?: 'card' | 'map';
}) {
  return cy.apiCreatePhase({
    projectId,
    title,
    startAt,
    endAt,
    participationMethod: 'native_survey',
    canPost,
    canReact,
    canComment,
    description,
    nativeSurveyButtonMultiloc,
    nativeSurveyTitleMultiloc,
    allow_anonymous_participation,
    presentation_mode,
  });
}

type NativeSurveyPhaseResult = {
  projectId: string;
  projectSlug: string;
  phaseId: string;
};

function createProjectWithNativeSurveyPhase({
  projectTitle = randomString(),
  projectDescriptionPreview = randomString(30),
  projectDescription = randomString(),
  publicationStatus = 'published',
  phaseTitle = randomString(),
  phaseStartAt = moment().subtract(9, 'month').format('DD/MM/YYYY'),
  phaseEndAt,
  canPost = true,
  canReact = true,
  canComment = true,
  description,
  nativeSurveyButtonMultiloc = { en: 'Take the survey' },
  nativeSurveyTitleMultiloc = { en: 'Survey' },
  allow_anonymous_participation,
  presentation_mode,
}: {
  projectTitle?: string;
  projectDescriptionPreview?: string;
  projectDescription?: string;
  publicationStatus?: IProjectAttributes['publication_status'];
  phaseTitle?: string;
  phaseStartAt?: string;
  phaseEndAt?: string;
  canPost?: boolean;
  canReact?: boolean;
  canComment?: boolean;
  description?: string;
  nativeSurveyButtonMultiloc?: Multiloc;
  nativeSurveyTitleMultiloc?: Multiloc;
  allow_anonymous_participation?: boolean;
  presentation_mode?: 'card' | 'map';
} = {}): Cypress.Chainable<NativeSurveyPhaseResult> {
  return cy
    .apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus,
    })
    .then((project) => {
      const projectId = project.body.data.id;
      const projectSlug = project.body.data.attributes.slug;

      return cy
        .apiCreateNativeSurveyPhase({
          projectId,
          title: phaseTitle,
          startAt: phaseStartAt,
          endAt: phaseEndAt,
          canPost,
          canReact,
          canComment,
          description,
          nativeSurveyButtonMultiloc,
          nativeSurveyTitleMultiloc,
          allow_anonymous_participation,
          presentation_mode,
        })
        .then((phase) => {
          const phaseId = phase.body.data.id;

          return {
            projectId,
            projectSlug,
            phaseId,
          };
        });
    });
}

/**
 * Get an element by its data-cy attribute.
 * This is a utility function to make it easier to find elements by their data-cy attribute.
 * @param {string} dataCyValue - The value of the data-cy attribute
 * @returns Cypress chainable object representing the element with the specified data-cy attribute
 * @example cy.dataCy('e2e-after-submission')
 */
function dataCy(dataCyValue: string): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get(`[data-cy="${dataCyValue}"]`);
}

Cypress.Commands.add('dataCy', dataCy);
Cypress.Commands.add('unregisterServiceWorkers', unregisterServiceWorkers);
Cypress.Commands.add('goToLandingPage', goToLandingPage);
Cypress.Commands.add('login', login);
Cypress.Commands.add('signUp', signUp);
Cypress.Commands.add('apiLogin', apiLogin);
Cypress.Commands.add('apiSignup', apiSignup);
Cypress.Commands.add('apiCreateAdmin', apiCreateAdmin);
Cypress.Commands.add('apiConfirmUser', apiConfirmUser);
Cypress.Commands.add('apiUpdateCurrentUser', apiUpdateCurrentUser);
Cypress.Commands.add('apiRemoveUser', apiRemoveUser);
Cypress.Commands.add('apiGetUsersCount', apiGetUsersCount);
Cypress.Commands.add('apiGetSeats', apiGetSeats);
Cypress.Commands.add('apiGetAppConfiguration', apiGetAppConfiguration);
Cypress.Commands.add(
  'apiGetCommunityMonitorProject',
  apiGetCommunityMonitorProject
);
Cypress.Commands.add('apiUpdateAppConfiguration', apiUpdateAppConfiguration);
Cypress.Commands.add('apiGetPhasePermission', apiGetPhasePermission);
Cypress.Commands.add('apiSetPhasePermission', apiSetPhasePermission);
Cypress.Commands.add('logout', logout);
Cypress.Commands.add('acceptCookies', acceptCookies);
Cypress.Commands.add('getIdeaById', getIdeaById);
Cypress.Commands.add('getProjectBySlug', getProjectBySlug);
Cypress.Commands.add('getProjectById', getProjectById);
Cypress.Commands.add('getTopics', getTopics);
Cypress.Commands.add('getUserBySlug', getUserBySlug);
Cypress.Commands.add('getAuthUser', getAuthUser);
Cypress.Commands.add('getArea', getArea);
Cypress.Commands.add('apiCreateIdea', apiCreateIdea);
Cypress.Commands.add('apiRemoveIdea', apiRemoveIdea);
Cypress.Commands.add('apiLikeIdea', apiLikeIdea);
Cypress.Commands.add('apiDislikeIdea', apiDislikeIdea);
Cypress.Commands.add(
  'apiCreateOfficialFeedbackForIdea',
  apiCreateOfficialFeedbackForIdea
);
Cypress.Commands.add('apiAddComment', apiAddComment);
Cypress.Commands.add('apiRemoveComment', apiRemoveComment);
Cypress.Commands.add('apiCreateProject', apiCreateProject);
Cypress.Commands.add('apiEditProject', apiEditProject);
Cypress.Commands.add('apiEditPhase', apiEditPhase);
Cypress.Commands.add('apiCreateFolder', apiCreateFolder);
Cypress.Commands.add('apiRemoveFolder', apiRemoveFolder);
Cypress.Commands.add('apiRemoveProject', apiRemoveProject);
Cypress.Commands.add('apiRemovePhase', apiRemovePhase);
Cypress.Commands.add('apiAddProjectsToFolder', apiAddProjectsToFolder);
Cypress.Commands.add('apiCreatePhase', apiCreatePhase);
Cypress.Commands.add('apiCreateCustomField', apiCreateCustomField);
Cypress.Commands.add('apiCreateCustomFieldOption', apiCreateCustomFieldOption);
Cypress.Commands.add('apiRemoveCustomField', apiRemoveCustomField);
Cypress.Commands.add('apiAddPoll', apiAddPoll);
Cypress.Commands.add('setAdminLoginCookie', setAdminLoginCookie);
Cypress.Commands.add('setModeratorLoginCookie', setModeratorLoginCookie);
Cypress.Commands.add(
  'setConsentAndAdminLoginCookies',
  setConsentAndAdminLoginCookies
);
Cypress.Commands.add('setConsentCookie', setConsentCookie);
Cypress.Commands.add('setLoginCookie', setLoginCookie);
Cypress.Commands.add('apiVerifyBogus', apiVerifyBogus);
Cypress.Commands.add('apiCreateEvent', apiCreateEvent);
Cypress.Commands.add(
  'apiToggleProjectDescriptionBuilder',
  apiToggleProjectDescriptionBuilder
);
Cypress.Commands.add('apiCreateReportBuilder', apiCreateReportBuilder);
Cypress.Commands.add('apiRemoveReportBuilder', apiRemoveReportBuilder);
Cypress.Commands.add('apiRemoveAllReports', apiRemoveAllReports);
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
Cypress.Commands.add('apiUpdateHomepageLayout', apiUpdateHomepageLayout);
Cypress.Commands.add('apiRemoveCustomPage', apiRemoveCustomPage);
Cypress.Commands.add('apiCreateCustomPage', apiCreateCustomPage);
Cypress.Commands.add('clickLocaleSwitcherAndType', clickLocaleSwitcherAndType);
Cypress.Commands.add(
  'apiCreateSmartGroupCustomField',
  apiCreateSmartGroupCustomField
);
Cypress.Commands.add('apiRemoveSmartGroup', apiRemoveSmartGroup);
Cypress.Commands.add(
  'apiUpdatePermissionCustomField',
  apiUpdatePermissionCustomField
);
Cypress.Commands.add('apiCreateSurveyQuestions', apiCreateSurveyQuestions);
Cypress.Commands.add('apiUpdateUserCustomFields', apiUpdateUserCustomFields);
Cypress.Commands.add('apiCreateSurveyResponse', apiCreateSurveyResponse);
Cypress.Commands.add(
  'uploadSurveyImageQuestionImage',
  uploadSurveyImageQuestionImage
);
Cypress.Commands.add('apiGetSurveySchema', apiGetSurveySchema);
Cypress.Commands.add('uploadProjectFolderImage', uploadProjectFolderImage);
Cypress.Commands.add('uploadProjectImage', uploadProjectImage);
Cypress.Commands.add(
  'apiCreateModeratorForProject',
  apiCreateModeratorForProject
);
Cypress.Commands.add('apiCreateNativeSurveyPhase', apiCreateNativeSurveyPhase);
Cypress.Commands.add(
  'createProjectWithNativeSurveyPhase',
  createProjectWithNativeSurveyPhase
);
