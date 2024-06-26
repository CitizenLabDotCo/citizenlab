import { randomString } from '../support/commands';
import moment = require('moment');

describe('Project card component', () => {
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;

  before(() => {
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: randomString(),
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
      cy.apiCreatePhase({
        projectId,
        title: 'phaseTitle',
        startAt: moment().subtract(2, 'month').format('DD/MM/YYYY'),
        endAt: moment().add(2, 'days').format('DD/MM/YYYY'),
        participationMethod: 'ideation',
        canComment: true,
        canPost: true,
        canReact: true,
      });
    });
  });

  it.skip('shows the title, description, progress bar and cta', () => {
    cy.goToLandingPage();

    cy.get('.e2e-project-card').should('exist');
    const projectCard = cy.get('.e2e-project-card').first();

    projectCard.contains(projectTitle);

    projectCard
      .get('.e2e-project-card-project-description-preview')
      .contains(projectDescriptionPreview);

    projectCard.get('.e2e-project-card-time-remaining');

    projectCard.get('.e2e-project-card-cta').contains('Submit your idea');
  });

  it.skip('navigates to project page on click title', () => {
    cy.goToLandingPage();

    cy.get('.e2e-project-card').first().should('exist');
    cy.get('.e2e-project-card-project-title').should('exist');
    cy.get('.e2e-project-card-project-title').first().click();

    cy.url().should('include', '/en/projects');
    cy.get('#e2e-project-page');
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
