import { randomString } from '../../../support/commands';
import moment = require('moment');

const surveyQuestionResponses = [
  'This is the first survey response',
  'This is the second survey response',
  'This is the third survey response',
  'This is the fourth survey response',
  'This is the fifth survey response',
  'This is the sixth survey response',
  'This is the seventh survey response',
  'This is the eighth survey response',
  'This is the ninth survey response',
  'This is the tenth survey response',
  'This is the eleventh survey response',
  'This is the twelfth survey response',
];
let reportId: string;
let projectId = '';
let phaseId: string;
let surveyFields: any;
describe('Report builder: AI widget', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  before(() => {
    const projectTitle = randomString();
    const projectDescriptionPreview = randomString();
    const projectDescription = randomString();
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project?.body.data.id;

      return cy
        .apiCreatePhase({
          projectId,
          title: 'firstPhaseTitle',
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          participationMethod: 'native_survey',
          canPost: true,
          canComment: true,
          canReact: true,
        })
        .then((phase) => {
          phaseId = phase.body.data.id;

          return cy
            .apiCreateSurveyQuestions(phaseId, [
              'page',
              'text',
              'select',
              'number',
            ])
            .then((survey) => {
              surveyFields = survey.body.data;

              surveyQuestionResponses.forEach((response) => {
                cy.apiCreateSurveyResponse({
                  project_id: projectId,
                  fields: {
                    [surveyFields[1].attributes.key]: response,
                  },
                });
              });
            });
        });
    });

    cy.apiCreateReportBuilder(phaseId).then((report) => {
      reportId = report.body.data.id;
    });
  });

  it('should make AI analysis insights in a survey possible to include in a report', () => {
    cy.intercept('POST', '**/analyses').as('createAnalysis');
    cy.intercept('GET', '**/insights', {
      fixture: 'analysis_insights_survey.json',
    });
    cy.intercept('PATCH', `/web_api/v1/reports/${reportId}`).as(
      'saveReportLayout'
    );
    cy.visit(`/admin/reporting/report-builder/${reportId}/editor`);
    cy.get('#e2e-report-builder-ai-tab').click();

    // Select project, phase and question
    cy.get('#e2e-report-builder-project-filter-box select').select(projectId);
    cy.get('#e2e-phase-filter').select(phaseId);
    cy.get('.e2e-question-select select').first().select(surveyFields[1].id);

    // Expect empty state at first
    cy.get('#e2e-report-buider-ai-no-analyses').should('exist');

    // Go to the survey page where the analysis is created automatically
    cy.visit(`/admin/projects/${projectId}/phases/${phaseId}/native-survey`);
    cy.wait('@createAnalysis');

    // Go back to the report builder
    cy.visit(`/admin/reporting/report-builder/${reportId}/editor`);
    cy.get('#e2e-report-builder-ai-tab').click();

    // Select project, phase and question
    cy.get('#e2e-report-builder-project-filter-box select').select(projectId);
    cy.get('#e2e-phase-filter').select(phaseId);
    cy.get('.e2e-question-select select').first().select(surveyFields[1].id);

    // Expect the insights to be shown
    cy.get('#e2e-report-buider-ai-no-analyses').should('not.exist');
    cy.get('[data-cy="e2e-report-builder-analysis-summary"]').should('exist');
    cy.get('[data-cy="e2e-report-builder-analysis-question"]').should('exist');

    // Drag and drop the insights to the report
    cy.get('#e2e-draggable-insight')
      .first()
      .dragAndDrop('#e2e-content-builder-frame', {
        position: 'inside',
      });

    cy.contains(
      'Respondents provided a series of survey responses, sequentially numbered from the first to the twelfth. Each response appears to be a simple statement indicating its position in the sequence. There is no substantive content provided beyond this numerical ordering. The trend across responses is that each is self-referential, acknowledging its own place in the lineup of survey submissions.'
    ).should('be.visible');

    cy.wait(1000);
  });
  //   after(() => {
  //     cy.apiRemoveProject(projectId);
  //   });
});
