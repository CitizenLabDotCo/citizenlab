
import { randomString } from '../support/commands';

describe('Project card component', () => {
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;

  before(() => {
    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: randomString(),
      publicationStatus: 'published',
      participationMethod: 'poll',
    }).then((project) => {
      projectId = project.body.data.id;
      cy.goToLandingPage();
    });
  });

  it('shows the title, description, progress bar and cta', () => {
    cy.get('.e2e-project-card').contains(projectTitle).closest('.e2e-project-card').as('projectCard');
    cy.get('@projectCard').get('.e2e-project-card-project-title').contains(projectTitle);
    cy.get('@projectCard').get('.e2e-project-card-project-description-preview').contains(projectDescriptionPreview);
    cy.get('@projectCard').get('.e2e-project-card-time-remaining');
    cy.get('@projectCard').get('.e2e-project-card-cta').contains('Post your idea');
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
