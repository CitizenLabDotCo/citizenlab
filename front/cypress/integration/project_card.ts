import { randomString } from '../support/commands';
import moment = require('moment');

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
    cy.get('.e2e-project-card')
      .contains(projectTitle)
      .closest('.e2e-project-card')
      .as('projectCard');
    cy.get('@projectCard')
      .get('.e2e-project-card-project-title')
      .contains(projectTitle);
    cy.get('@projectCard')
      .get('.e2e-project-card-project-description-preview')
      .contains(projectDescriptionPreview);
    cy.get('@projectCard').get('.e2e-project-card-time-remaining');
    cy.get('@projectCard')
      .get('.e2e-project-card-cta')
      .contains('Submit your idea');
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
