import { randomString } from '../../support/commands';
import moment = require('moment');

describe.skip('Survey template', () => {
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
        // TODO add survey questions
      });

    // TODO create users and respond to survey
  });

  after(() => {
    cy.apiRemoveProject(projectId);

    // TODO clean up users
  });

  it('should create a survey template', () => {});
});
