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

let projectId = '';
let phaseId: string;
describe('Admin: survey analysis', () => {
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
          nativeSurveyButtonMultiloc: { en: 'Take the survey' },
          nativeSurveyTitleMultiloc: { en: 'Survey' },
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
              const surveyFields = survey.body.data;

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
  });

  it('shows and hides summaries on the survey results page', () => {
    cy.visit(`/admin/projects/${projectId}/phases/${phaseId}/results`);
    cy.intercept('GET', '**/insights', {
      fixture: 'analysis_insights_survey.json',
    });

    cy.get('#e2e-analysis-summary').should('exist');
    cy.get('#e2e-analysis-actions').click();
    cy.get('#e2e-hide-summaries').click();
    cy.get('#e2e-analysis-summary').should('not.exist');
    cy.get('#e2e-show-summaries').click();
    cy.get('#e2e-analysis-summary').should('exist');
  });

  it('adds and removes questions from the analysis', () => {
    cy.visit(`/admin/projects/${projectId}/phases/${phaseId}/results`);
    cy.intercept('GET', '**/insights', {
      fixture: 'analysis_insights_survey.json',
    });

    cy.get('#e2e-explore-summary').click();

    // Launch modal
    cy.get('#e2e-analysis-launch-modal').should('exist');
    cy.get('#e2e-analysis-launch-modal-agree-button').click();

    cy.dataCy('e2e-analysis-summary').should('exist');
    cy.dataCy('e2e-analysis-question').should('exist');
    cy.dataCy('e2e-analysis-input-item').should('have.length', 12);
    cy.dataCy('e2e-analysis-custom-field-item').should('have.length', 1);
    cy.dataCy('e2e-analysis-custom-field-item').should(
      'contain',
      'Question: text'
    );

    // Add question to analysis

    cy.get('#e2e-analysis-toggle-show-all-questions-button').click();
    cy.dataCy('e2e-analysis-add-remove-additional-custom-field')
      .first()
      .click();
    cy.get('#e2e-analysis-toggle-show-all-questions-button').click();
    cy.dataCy('e2e-analysis-custom-field-item').should('have.length', 2);
    cy.dataCy('e2e-analysis-custom-field-item')
      .first()
      .should('contain', 'Question: text');
    cy.dataCy('e2e-analysis-custom-field-item')
      .last()
      .should('contain', 'Question: select');

    // Remove question from analysis

    cy.dataCy('e2e-analysis-add-remove-additional-custom-field').click();
    cy.dataCy('e2e-analysis-custom-field-item').should('have.length', 1);
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
