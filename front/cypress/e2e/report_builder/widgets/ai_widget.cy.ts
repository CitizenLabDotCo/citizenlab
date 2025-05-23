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
let surveyPhaseId: string;
let ideationPhaseId: string;
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

      cy.apiCreatePhase({
        projectId,
        title: 'survey',
        startAt: moment().subtract(2, 'month').format('DD/MM/YYYY'),
        participationMethod: 'native_survey',
        canPost: true,
        canComment: true,
        canReact: true,
        nativeSurveyButtonMultiloc: { en: 'Take the survey' },
        nativeSurveyTitleMultiloc: { en: 'Survey' },
      }).then((phase) => {
        surveyPhaseId = phase.body.data.id;

        return cy
          .apiCreateSurveyQuestions(surveyPhaseId, [
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
      cy.apiCreatePhase({
        projectId,
        title: 'ideation',
        startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
        endAt: moment().subtract(3, 'month').format('DD/MM/YYYY'),
        participationMethod: 'ideation',
        canPost: true,
        canComment: true,
        canReact: true,
      }).then((phase) => {
        ideationPhaseId = phase.body.data.id;
        const ideaTitle1 = 'My first idea';
        const ideaTitle2 = 'My second idea';
        const ideaTitle3 = 'My third idea';

        const ideaContent = randomString();
        cy.apiCreateIdea({
          projectId,
          ideaTitle: ideaTitle1,
          ideaContent: ideaContent,
          phaseIds: [ideationPhaseId],
        });
        cy.apiCreateIdea({
          projectId,
          ideaTitle: ideaTitle2,
          ideaContent: ideaContent,
          phaseIds: [ideationPhaseId],
        });
        cy.apiCreateIdea({
          projectId,
          ideaTitle: ideaTitle3,
          ideaContent: ideaContent,
          phaseIds: [ideationPhaseId],
        });
      });
    });

    cy.apiCreateReportBuilder(ideationPhaseId).then((report) => {
      reportId = report.body.data.id;
    });
  });

  it('should make AI analysis insights in a survey possible to include in a report', () => {
    cy.intercept('POST', '**/analyses').as('createAnalysis');
    cy.intercept('GET', '**/insights', {
      fixture: 'analysis_insights_survey.json',
    });

    cy.visit(`/admin/reporting/report-builder/${reportId}/editor`);
    cy.get('#e2e-report-builder-ai-tab').click();

    // Select project, phase and question
    cy.get('#e2e-report-builder-analysis-project-filter-box select').select(
      projectId
    );
    cy.get('#e2e-report-builder-analysis-phase-filter-box').select(
      surveyPhaseId
    );
    cy.get('.e2e-question-select select').first().select(surveyFields[1].id);

    // Expect empty state at first
    cy.get('#e2e-report-buider-ai-no-analyses').should('exist');

    // Go to the survey page where the analysis is created automatically
    cy.visit(`/admin/projects/${projectId}/phases/${surveyPhaseId}/results`);
    cy.wait('@createAnalysis');

    // Go back to the report builder
    cy.visit(`/admin/reporting/report-builder/${reportId}/editor`);
    cy.get('#e2e-report-builder-ai-tab').click();

    // Select project, phase and question
    cy.get('#e2e-report-builder-analysis-project-filter-box select').select(
      projectId
    );
    cy.get('#e2e-report-builder-analysis-phase-filter-box').select(
      surveyPhaseId
    );
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

    cy.get('#e2e-content-builder-frame')
      .contains(
        'Respondents provided a series of survey responses, sequentially numbered from the first to the twelfth. Each response appears to be a simple statement indicating its position in the sequence. There is no substantive content provided beyond this numerical ordering. The trend across responses is that each is self-referential, acknowledging its own place in the lineup of survey submissions.'
      )
      .should('be.visible');
  });

  it('should make AI analysis insights in an ideation project possible to include in a report', () => {
    cy.intercept('POST', '**/analyses').as('createAnalysis');
    cy.intercept('GET', '**/insights', {
      fixture: 'analysis_insights_ideation.json',
    });

    cy.visit(`/admin/reporting/report-builder/${reportId}/editor`);
    cy.get('#e2e-report-builder-ai-tab').click();

    // Select project, phase and question
    cy.get('#e2e-report-builder-analysis-project-filter-box select').select(
      projectId
    );
    cy.get('#e2e-report-builder-analysis-phase-filter-box').select(
      ideationPhaseId
    );

    // Expect empty state at first
    cy.get('#e2e-report-buider-ai-no-analyses').should('exist');

    // Go to the survey page where the analysis is created automatically
    cy.visit(`/admin/projects/${projectId}/phases/${ideationPhaseId}/ideas`);
    cy.get('#e2e-analysis-banner-button').click();
    cy.wait('@createAnalysis');

    // Go back to the report builder
    cy.visit(`/admin/reporting/report-builder/${reportId}/editor`);
    cy.get('#e2e-report-builder-ai-tab').click();

    // Select project, phase and question
    cy.get('#e2e-report-builder-analysis-project-filter-box select').select(
      projectId
    );
    cy.get('#e2e-report-builder-analysis-phase-filter-box').select(
      ideationPhaseId
    );

    // Expect the insights to be shown
    cy.get('#e2e-report-buider-ai-no-analyses').should('not.exist');
    cy.get('[data-cy="e2e-report-builder-analysis-summary"]').should('exist');

    // Drag and drop the insights to the report
    cy.get('#e2e-draggable-insight').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });

    cy.get('#e2e-content-builder-frame')
      .contains(
        'Respondents have provided input on three separate ideas, each identified by a unique ID. The content of the responses is not included in the provided text, so the summary cannot reflect specific feedback or trends. However, it is clear that participants are engaging with multiple ideas within the project \'n3bamy708e4ncuw\', as indicated by the sequential labeling of their ideas as "My first idea," "My second idea," and "My third idea." Each idea appears to be associated with the same description, "huah20cbzs3gw64," suggesting a common theme or guideline for the submissions. Without additional information on the responses themselves, no further summary can be provided.'
      )
      .should('be.visible');
  });
  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
