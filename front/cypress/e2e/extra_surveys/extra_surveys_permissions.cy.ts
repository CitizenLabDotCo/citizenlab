import { randomEmail, randomString } from '../../support/commands';
import { clickExtraSurveyButton, createProjectWithExtraSurveys } from './utils';

describe('Extra survey permissions', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  let userId = '';

  const submitEmptySurvey = () => {
    cy.intercept('POST', '/web_api/v1/phases/*/inputs').as('submitSurvey');
    cy.dataCy('e2e-submit-form').click();
    cy.wait('@submitSurvey').its('response.statusCode').should('eq', 201);
    cy.dataCy('e2e-after-submission').should('exist');
  };

  before(() => {
    cy.apiSignup(firstName, lastName, email, password).then((response) => {
      userId = response.body.data.id;
    });
  });

  after(() => {
    cy.apiRemoveUser(userId);
  });

  describe('permitted by registered users (default)', () => {
    let projectId = '';
    let projectSlug = '';
    let surveyPhaseId = '';

    before(() => {
      createProjectWithExtraSurveys({
        withIdeationPhase: false,
        surveys: [{}],
      }).then((result) => {
        projectId = result.projectId;
        projectSlug = result.projectSlug;
        surveyPhaseId = result.surveyPhaseIds[0];
      });
    });

    after(() => {
      cy.apiRemoveIdeas(projectId).then(() => cy.apiRemoveProject(projectId));
    });

    it('asks visitors to sign in before taking the survey', () => {
      cy.clearCookies();
      cy.setConsentCookie();
      cy.visit(`/projects/${projectSlug}`);
      cy.get('#e2e-about-box').scrollIntoView();

      clickExtraSurveyButton();

      cy.url().should('include', `/projects/${projectSlug}/surveys/new`);
      cy.get('#e2e-authentication-modal').should('exist');
    });

    it('lets a registered user take the survey', () => {
      cy.setLoginCookie(email, password);
      cy.visit(`/projects/${projectSlug}`);
      cy.get('#e2e-about-box').scrollIntoView();

      clickExtraSurveyButton();

      cy.url().should('include', `phase_id=${surveyPhaseId}`);
      submitEmptySurvey();
    });
  });

  describe('permitted by everyone', () => {
    let projectId = '';
    let projectSlug = '';
    let surveyPhaseId = '';

    before(() => {
      createProjectWithExtraSurveys({
        withIdeationPhase: false,
        surveys: [{}],
      }).then((result) => {
        projectId = result.projectId;
        projectSlug = result.projectSlug;
        surveyPhaseId = result.surveyPhaseIds[0];

        cy.apiSetPhasePermission({
          phaseId: surveyPhaseId,
          action: 'posting_idea',
          permissionBody: { permitted_by: 'everyone' },
        });
      });
    });

    after(() => {
      cy.apiRemoveIdeas(projectId).then(() => cy.apiRemoveProject(projectId));
    });

    it('lets a visitor submit the survey without an account', () => {
      cy.clearCookies();
      cy.setConsentCookie();
      cy.visit(`/projects/${projectSlug}`);
      cy.get('#e2e-about-box').scrollIntoView();

      clickExtraSurveyButton();

      cy.url().should('include', `phase_id=${surveyPhaseId}`);
      submitEmptySurvey();
    });
  });

  describe('permitted by admins and moderators only', () => {
    let projectId = '';
    let projectSlug = '';
    let surveyPhaseId = '';

    before(() => {
      createProjectWithExtraSurveys({
        withIdeationPhase: false,
        surveys: [{}],
      }).then((result) => {
        projectId = result.projectId;
        projectSlug = result.projectSlug;
        surveyPhaseId = result.surveyPhaseIds[0];

        cy.apiSetPhasePermission({
          phaseId: surveyPhaseId,
          action: 'posting_idea',
          permissionBody: { permitted_by: 'admins_moderators' },
        });
      });
    });

    after(() => {
      cy.apiRemoveIdeas(projectId).then(() => cy.apiRemoveProject(projectId));
    });

    it('shows a not-eligible state to regular users', () => {
      cy.setLoginCookie(email, password);
      cy.visit(`/projects/${projectSlug}`);
      cy.get('#e2e-about-box').scrollIntoView();

      cy.get('#e2e-about-box .e2e-extra-survey-button')
        .should('contain', 'not eligible')
        .find('button')
        .should('have.class', 'disabled');
    });

    it('still lets an admin take the survey', () => {
      cy.setAdminLoginCookie();
      cy.visit(`/projects/${projectSlug}`);
      cy.get('#e2e-about-box').scrollIntoView();

      clickExtraSurveyButton();

      cy.url().should('include', `phase_id=${surveyPhaseId}`);
    });
  });

  describe('restricted to a user group', () => {
    let projectId = '';
    let projectSlug = '';
    let surveyPhaseId = '';
    let groupId = '';

    before(() => {
      cy.apiCreateManualGroup({ title: { en: randomString() } }).then(
        (group) => {
          groupId = group.body.data.id;
        }
      );

      createProjectWithExtraSurveys({
        withIdeationPhase: false,
        surveys: [{}],
      }).then((result) => {
        projectId = result.projectId;
        projectSlug = result.projectSlug;
        surveyPhaseId = result.surveyPhaseIds[0];

        cy.apiSetPhasePermission({
          phaseId: surveyPhaseId,
          action: 'posting_idea',
          permissionBody: {
            permission: { permitted_by: 'users', group_ids: [groupId] },
          },
        });
      });
    });

    after(() => {
      cy.apiRemoveIdeas(projectId).then(() => cy.apiRemoveProject(projectId));
      cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
        cy.request({
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${response.body.jwt}`,
          },
          method: 'DELETE',
          url: `web_api/v1/groups/${groupId}`,
        });
      });
    });

    it('shows a not-eligible state to users outside the group', () => {
      cy.setLoginCookie(email, password);
      cy.visit(`/projects/${projectSlug}`);
      cy.get('#e2e-about-box').scrollIntoView();

      cy.get('#e2e-about-box .e2e-extra-survey-button')
        .should('contain', 'not eligible')
        .find('button')
        .should('have.class', 'disabled');
    });

    it('lets a group member take the survey', () => {
      cy.apiAddMembership({ userId, groupId });

      cy.setLoginCookie(email, password);
      cy.visit(`/projects/${projectSlug}`);
      cy.get('#e2e-about-box').scrollIntoView();

      clickExtraSurveyButton();

      cy.url().should('include', `phase_id=${surveyPhaseId}`);
      submitEmptySurvey();
    });
  });
});
