import { ICustomFieldResponse } from '../../../../app/api/custom_fields/types';
import { randomString, randomEmail } from '../../../support/commands';
import moment = require('moment');

describe('Survey question widget', () => {
  let projectId: string;
  let phaseId: string;
  let surveyIncluded: any;
  let surveyFields: ICustomFieldResponse[];
  let reportId: string;

  const users = Array(4)
    .fill(0)
    .map((_, i) => ({
      firstName: randomString(),
      lastName: randomString(),
      email: randomEmail(),
      password: randomString(),
      gender: i % 2 ? 'male' : 'female',
    }));

  const userIds: string[] = [];

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

        users.forEach(({ firstName, lastName, email, password, gender }) => {
          cy.apiSignup(firstName, lastName, email, password)
            .then((response) => {
              userIds.push(response.body.data.id);

              cy.apiUpdateUserCustomFields(email, password, {
                gender,
              });
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
      })
      .then(() => {
        cy.apiCreateReportBuilder().then((report) => {
          reportId = report.body.data.id;
        });
      });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
    cy.apiRemoveReportBuilder(reportId);

    userIds.forEach((userId) => {
      cy.apiRemoveUser(userId);
    });
  });

  it('handles survey question widget', () => {
    cy.setAdminLoginCookie();
    cy.visit(`/admin/reporting/report-builder/${reportId}/editor`);

    cy.get('#e2e-draggable-survey-question-result-widget').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );

    cy.wait(1000);

    // Select project, phase and question
    cy.get('#e2e-report-builder-project-filter-box select').select(projectId);
    cy.get('#e2e-report-builder-phase-filter').select(phaseId);
    cy.get('.e2e-question-select select').first().select(surveyFields[2].id);

    // Check if values are correct
    cy.get('.e2e-survey-question-ungrouped-bars')
      .first()
      .contains('50% (4 choices)');

    cy.get('svg.e2e-progress-bar').should('have.length', 3);
    cy.get('svg.e2e-progress-bar').first().should('have.attr', 'width', '50%');
    cy.get('svg.e2e-progress-bar').eq(1).should('have.attr', 'width', '50%');
    cy.get('svg.e2e-progress-bar').eq(2).should('have.attr', 'width', '0%');

    // Group by gender and confirm correctness
    cy.get('#e2e-group-mode-select').select('user_field');
    cy.get('#e2e-user-field-select').select('Gender');

    cy.get('svg.e2e-progress-bar').should('have.length', 5);
    cy.get('svg.e2e-progress-bar').first().should('have.attr', 'width', '25%');
    cy.get('svg.e2e-progress-bar').eq(1).should('have.attr', 'width', '25%');
    cy.get('svg.e2e-progress-bar').eq(2).should('have.attr', 'width', '25%');
    cy.get('svg.e2e-progress-bar').eq(3).should('have.attr', 'width', '25%');
    cy.get('svg.e2e-progress-bar').eq(4).should('have.attr', 'width', '0%');

    // Save
    cy.intercept('PATCH', `/web_api/v1/reports/${reportId}`).as(
      'saveReportLayout'
    );
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveReportLayout');

    // Reload page and check if values are still correct
    cy.reload();
    cy.get('svg.e2e-progress-bar').should('have.length', 5);
    cy.get('svg.e2e-progress-bar').first().should('have.attr', 'width', '25%');
    cy.get('svg.e2e-progress-bar').eq(1).should('have.attr', 'width', '25%');
    cy.get('svg.e2e-progress-bar').eq(2).should('have.attr', 'width', '25%');
    cy.get('svg.e2e-progress-bar').eq(3).should('have.attr', 'width', '25%');
    cy.get('svg.e2e-progress-bar').eq(4).should('have.attr', 'width', '0%');
  });
});
