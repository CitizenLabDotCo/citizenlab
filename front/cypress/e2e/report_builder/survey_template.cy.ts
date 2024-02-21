import { randomString } from '../../support/commands';
import moment = require('moment');

describe('Survey template', () => {
  let projectId: string;
  let projectSlug: string;
  let phaseId: string;

  before(() => {
    cy.apiCreateProject({
      title: randomString(),
      descriptionPreview: randomString(),
      description: randomString(),
      publicationStatus: 'published',
    })
      .then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;
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

        return cy.apiCreateSurveyQuestions(phaseId, [
          'page',
          'select',
          'multiselect',
        ]);
      })
      .then(() => {
        // TODO create users with different genders and shit
        // TODO make these users fill out the survey
      });
  });

  after(() => {
    cy.apiRemoveProject(projectId);

    // TODO clean up users
  });

  it('should create a survey template', () => {});
});
