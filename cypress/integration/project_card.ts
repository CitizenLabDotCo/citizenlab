import { randomString } from '../support/commands';

describe('Project card component', () => {
  it('shows the title, description, progress bar and cta', () => {
    const projectTitle = randomString();
    const projectDescriptionPreview = randomString();
    const projectDescription = randomString();
    const phaseTitle = randomString();

    cy.apiCreateProject('timeline', projectTitle, projectDescriptionPreview, projectDescription).then((project) => {
      cy.apiCreatePhase(project.body.data.id as string, phaseTitle, '2018-03-01', '2025-01-01', 'ideation', true, true, true);
      cy.visit('/');
      cy.get('.e2e-project-card').contains(projectTitle).closest('.e2e-project-card').as('projectCard');
      cy.get('@projectCard').get('#e2e-project-card-project-title').contains(projectTitle);
      cy.get('@projectCard').get('#e2e-project-card-project-description-preview').contains(projectDescriptionPreview);
      cy.get('@projectCard').get('.e2e-project-card-time-remaining');
      cy.get('@projectCard').get('.e2e-project-card-cta').contains('Post your idea');
    });
  });
});
