import { randomString } from '../../../support/commands';
import moment = require('moment');

describe('Admin project participation method', () => {
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;
  let phaseId: string;

  before(() => {
    // Create active continuous project
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      publicationStatus: 'published',
    })
      .then((project) => {
        projectId = project.body.data.id;
        return cy.apiCreatePhase({
          projectId,
          title: 'firstPhaseTitle',
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          endAt: moment().subtract(3, 'month').format('DD/MM/YYYY'),
          participationMethod: 'ideation',
          canPost: true,
          canComment: true,
          canReact: true,
        });
      })
      .then((phase) => {
        phaseId = phase.body.data.id;
      });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
