import moment = require('moment');

import { randomEmail, randomString } from '../../support/commands';
import {
  clickSpotlightSurveyButton,
  createProjectWithSpotlightSurveys,
} from './utils';

describe('Citizen submitting an extra survey', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  let userId = '';
  let projectId = '';
  let projectSlug = '';
  let surveyPhaseId = '';

  before(() => {
    cy.apiSignup(firstName, lastName, email, password).then((response) => {
      userId = response.body.data.id;
    });

    createProjectWithSpotlightSurveys({
      surveys: [{ endAt: moment().add(2, 'month').format('DD/MM/YYYY') }],
    }).then((result) => {
      projectId = result.projectId;
      projectSlug = result.projectSlug;
      surveyPhaseId = result.surveyPhaseIds[0];

      cy.apiCreateSurveyQuestions(surveyPhaseId, ['page', 'select']);
    });
  });

  beforeEach(() => {
    cy.setLoginCookie(email, password);
  });

  after(() => {
    cy.apiRemoveIdeas(projectId).then(() => cy.apiRemoveProject(projectId));
    cy.apiRemoveUser(userId);
  });

  it('fills in and submits the extra survey from the project page', () => {
    cy.visit(`/projects/${projectSlug}`);
    cy.get('#e2e-about-box').scrollIntoView();

    clickSpotlightSurveyButton();

    // We land on the survey form of the standalone phase, not the timeline phase
    cy.url().should('include', `/projects/${projectSlug}/surveys/new`);
    cy.url().should('include', `phase_id=${surveyPhaseId}`);

    // Answer the select question
    cy.get('fieldset').first().find('input').first().check({ force: true });

    cy.intercept('POST', '/web_api/v1/phases/*/inputs').as('submitSurvey');
    cy.dataCy('e2e-submit-form').click();

    cy.wait('@submitSurvey').then((interception) => {
      expect(interception.response?.statusCode).to.eq(201);
      // The response is created on the standalone survey phase
      expect(interception.request.url).to.include(
        `/phases/${surveyPhaseId}/inputs`
      );
    });

    cy.dataCy('e2e-after-submission').should('exist');
  });

  it('shows the completed state for the survey while the main method stays open', () => {
    cy.visit(`/projects/${projectSlug}`);
    cy.get('#e2e-about-box').scrollIntoView();

    // The extra survey no longer accepts a second response from this user
    cy.get('#e2e-about-box .e2e-extra-survey-button')
      .should('contain', 'your response was received')
      .find('button')
      .should('have.class', 'disabled');

    // The timeline ideation phase is unaffected by the survey submission
    cy.get('#project-ideabutton')
      .find('button')
      .should('not.have.class', 'disabled');
  });

  it('still allows participating in the timeline ideation phase', () => {
    cy.visit(`/projects/${projectSlug}`);
    cy.get('#e2e-about-box').scrollIntoView();

    cy.get('#project-ideabutton')
      .find('a, button')
      .first()
      .click({ force: true });

    cy.url().should('include', `/projects/${projectSlug}/ideas/new`);
  });
});
