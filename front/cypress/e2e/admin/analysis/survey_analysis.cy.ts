import { randomEmail, randomString } from '../../../support/commands';
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
describe('Admin: ideation analysis', () => {
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
            .apiCreateSurveyQuestions(phaseId, ['page', 'text'])
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

  it('shows the survey results page', () => {
    cy.visit(`/admin/projects/${projectId}/phases/${phaseId}/native-survey`);
    cy.intercept('**/insights', { fixture: 'analysis_insights.json' });
    // cy.get('.e2e-survey-results');
  });

  // after(() => {
  //   cy.apiRemoveProject(projectId);
  // });
});
