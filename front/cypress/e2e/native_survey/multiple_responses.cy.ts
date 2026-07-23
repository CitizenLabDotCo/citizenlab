import moment = require('moment');

import { randomString, randomEmail } from '../../support/commands';
import { updatePermission } from '../../support/permitted_by_utils';

/**
 * Covers the `allow_multiple_responses` native survey setting (TAN-8062):
 * when enabled, a registered user can submit the survey more than once;
 * when disabled (the default) the second attempt is blocked.
 */
describe('Native survey: multiple responses per user', () => {
  // A single registered (non-admin) user, reused across both scenarios.
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();

  before(() => {
    cy.apiSignup(firstName, lastName, email, password);
  });

  const createSurveyProject = (allowMultipleResponses: boolean) => {
    return cy
      .apiCreateProject({
        title: randomString(),
        descriptionPreview: randomString(),
        description: randomString(),
        publicationStatus: 'published',
      })
      .then((project) => {
        const projectId = project.body.data.id;
        const projectSlug = project.body.data.attributes.slug;

        cy.apiAddAboutBox(projectId);

        return cy
          .apiCreatePhase({
            projectId,
            title: randomString(),
            startAt: moment().subtract(1, 'month').format('DD/MM/YYYY'),
            participationMethod: 'native_survey',
            nativeSurveyButtonMultiloc: { en: 'Take the survey' },
            nativeSurveyTitleMultiloc: { en: 'Survey' },
            canPost: true,
            canComment: true,
            canReact: true,
            allow_multiple_responses: allowMultipleResponses,
          })
          .then((phase) => {
            const phaseId = phase.body.data.id;
            // Allow registered users to take the survey.
            return updatePermission({ phaseId, permitted_by: 'users' }).then(
              () => ({ projectId, projectSlug, phaseId })
            );
          });
      });
  };

  // Opens the project, takes the (empty) survey and asserts the response was
  // created. Returns nothing – assertions happen inline.
  const submitSurvey = (projectSlug: string) => {
    cy.visit(`/projects/${projectSlug}`);

    cy.get('.e2e-idea-button')
      .find('button')
      .should('not.have.attr', 'disabled');
    cy.get('.e2e-idea-button').first().find('button').click({ force: true });

    cy.location('pathname').should(
      'eq',
      `/en/projects/${projectSlug}/surveys/new`
    );

    cy.intercept('POST', '/web_api/v1/ideas').as('submitSurvey');
    cy.dataCy('e2e-submit-form').click();
    cy.wait('@submitSurvey').its('response.statusCode').should('eq', 201);
    cy.dataCy('e2e-after-submission').should('exist');
  };

  describe('when allow_multiple_responses is enabled', () => {
    let projectId: string;
    let projectSlug: string;

    before(() => {
      createSurveyProject(true).then((result) => {
        projectId = result.projectId;
        projectSlug = result.projectSlug;
      });
    });

    beforeEach(() => {
      cy.setLoginCookie(email, password);
    });

    after(() => {
      cy.apiRemoveIdeas().then(() => cy.apiRemoveProject(projectId));
    });

    it('lets a registered user submit the survey more than once', () => {
      submitSurvey(projectSlug); // first response
      submitSurvey(projectSlug); // second response – blocked unless the setting is on
    });

    it('keeps showing the survey CTA after the user has already responded', () => {
      cy.visit(`/en/projects/${projectSlug}`);
      cy.get('#project-survey-button').should('exist');
    });
  });

  describe('when allow_multiple_responses is disabled (default)', () => {
    let projectId: string;
    let projectSlug: string;

    before(() => {
      createSurveyProject(false).then((result) => {
        projectId = result.projectId;
        projectSlug = result.projectSlug;
      });
    });

    beforeEach(() => {
      cy.setLoginCookie(email, password);
    });

    after(() => {
      cy.apiRemoveIdeas().then(() => cy.apiRemoveProject(projectId));
    });

    it('blocks a second submission and hides the survey CTA', () => {
      submitSurvey(projectSlug); // first response succeeds

      // The CTA disappears once the single allowed response has been made.
      cy.visit(`/en/projects/${projectSlug}`);
      cy.get('#project-survey-button').should('not.exist');
    });
  });
});
