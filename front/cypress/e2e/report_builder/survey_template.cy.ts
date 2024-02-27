import { ICustomFieldResponse } from '../../../app/api/custom_fields/types';
import { randomString, randomEmail } from '../../support/commands';
import moment = require('moment');

describe('Survey template', () => {
  let projectId: string;
  let phaseId: string;
  let surveyIncluded: any;
  let surveyFields: ICustomFieldResponse[];

  let userId: string;

  before(() => {
    cy.apiCreateProject({
      title: randomString(),
      descriptionPreview: randomString(),
      description: randomString(),
      publicationStatus: 'published',
    })
      .then((project) => {
        projectId = project.body.data.id;
        return cy.apiCreatePhase({
          projectId,
          title: randomString(),
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          participationMethod: 'native_survey',
          canPost: true,
          canComment: true,
          canReact: true,
        });
      })
      .then((phase) => {
        phaseId = phase.body.data.id;

        cy.apiCreateSurveyQuestions(phaseId, ['page', 'select', 'multiselect']);
      })
      .then((response) => {
        surveyIncluded = response.body.included;
        surveyFields = response.body.data;

        const firstName = randomString();
        const lastName = randomString();
        const email = randomEmail();
        const password = randomString();
        const gender = 'female';

        cy.apiSignup(firstName, lastName, email, password)
          .then((response) => {
            userId = response.body.data.id;

            cy.apiUpdateUserCustomFields(email, password, { gender });
          })
          .then(() => {
            cy.apiCreateSurveyResponse(email, password, projectId, {
              [surveyFields[1].attributes.key]:
                surveyIncluded[0].attributes.key,
              [surveyFields[2].attributes.key]: [
                surveyIncluded[2].attributes.key,
                surveyIncluded[3].attributes.key,
              ],
            });
          });
      });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
    cy.apiRemoveUser(userId);
  });

  it('should create a survey template', () => {
    cy.setAdminLoginCookie();

    // Create report from template
    cy.visit(`/admin/reporting/report-builder`);
    cy.get('#e2e-create-report-button').click();

    cy.get('.e2e-create-report-modal-title-input').type(randomString());
    cy.get('#project-template-radio').click({ force: true });
    cy.get('#projectFilter').select(projectId);

    cy.get('div[data-testid="create-report-button"] > button').click();

    // Ensure we are in the editor
    cy.url().should('include', '/en/admin/reporting/report-builder/');
    cy.url().should('include', `editor?templateProjectId=${projectId}`);
    cy.get('#e2e-content-builder-frame').should('exist');

    // Ensure correct amount of questions
    cy.get('.e2e-survey-question-widget-title').should('have.length', 2);
    cy.get('.e2e-survey-question-widget-title')
      .first()
      .contains('Question: select');
    cy.get('.e2e-survey-question-widget-title')
      .eq(1)
      .contains('Question: multiselect');

    // Ensure correct values
    cy.get('.e2e-survey-question-ungrouped-bars')
      .first()
      .contains('100% (1 choice)');
    cy.get('.e2e-survey-question-ungrouped-bars')
      .eq(1)
      .contains('50% (1 choice)');

    // Remove report
    cy.visit('/admin/reporting/report-builder');
    cy.get('#e2e-delete-report-button').click();

    // Ensure we're back to the empty state
    cy.get('#e2e-create-report-button').should('exist');
  });
});
