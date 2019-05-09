import { randomString } from '../support/commands';

describe('Project overview page', () => {
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString();
  const projectDescription = randomString();

  before(() => {
    cy.apiCreateProject('continuous', projectTitle, projectDescriptionPreview, projectDescription, 'archived');
    cy.visit('/projects/');
    cy.wait(1000);
    cy.get('#e2e-projects-container');
  });

  it('shows all archived projects when the archived filter is selected', () => {
    cy.get('.e2e-filter-selector-publicationstatus').click().wait(500);
    cy.get('.e2e-projects-filter-archived').click();
    cy.wait(1000);
    cy.get('#e2e-projects-list');
    cy.get('.e2e-filter-selector-publicationstatus').contains('Archived projects');
    cy.get('.e2e-project-card').eq(0).as('projectCard');
    cy.get('@projectCard').should('have.class', 'archived');
    cy.get('@projectCard').get('.e2e-project-card-archived-label');
  });
});
