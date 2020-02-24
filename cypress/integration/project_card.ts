// defined in e2e template's - &project1
const projectTitle = 'Test project 1 timeline with file';
const projectDescriptionPreview = 'Let\'s renew the parc at the city border.';

describe('Project card component', () => {
  before(() => {
      cy.goToLandingPage();
  });

  it('shows the title, description, progress bar and cta', () => {
    cy.get('.e2e-project-card').contains(projectTitle).closest('.e2e-project-card').as('projectCard');
    cy.get('@projectCard').get('.e2e-project-card-project-title').contains(projectTitle);
    cy.get('@projectCard').get('.e2e-project-card-project-description-preview').contains(projectDescriptionPreview);
    cy.get('@projectCard').get('.e2e-project-card-time-remaining');
    cy.get('@projectCard').get('.e2e-project-card-cta').contains('Post your idea');
  });
});
