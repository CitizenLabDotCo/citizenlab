import { randomString } from '../support/commands';
import moment = require('moment');
import project from '../fixtures/project';

describe('Project card component', () => {
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;

  before(() => {
    cy.apiCreateProject({
      type: 'timeline',
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: randomString(),
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
      cy.apiCreatePhase(
        projectId,
        'phaseTitle',
        moment().subtract(2, 'month').format('DD/MM/YYYY'),
        moment().add(2, 'days').format('DD/MM/YYYY'),
        'ideation',
        true,
        true,
        true
      );
      cy.goToLandingPage();
    });
  });

  it('shows the title, description, progress bar and cta', () => {
    const projectCard = cy.get('.e2e-project-card').first();

    projectCard.contains(projectTitle);

    projectCard
      .get('.e2e-project-card-project-description-preview')
      .contains(projectDescriptionPreview);

    projectCard.get('.e2e-project-card-time-remaining');

    projectCard.get('.e2e-project-card-cta').contains('Submit your idea');
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
