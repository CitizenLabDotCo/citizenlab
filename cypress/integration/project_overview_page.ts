describe('Project overview page', () => {
  beforeEach(() => {
    cy.visit('/projects/');
  });

  it('shows the page', () => {
    cy.get('#e2e-projects-container');
  });

  it('shows all archived projects when the archived filter is selected', () => {
    cy.get('.e2e-filter-selector-publicationstatus').click();
    cy.get('.e2e-projects-filter-archived').click();
    cy.get('.e2e-filter-selector-publicationstatus').contains('Archived projects');
    cy.get('.e2e-project-card').first().find('.e2e-project-card-archived-label');
    cy.get('.e2e-project-card').first().should('have.class', 'archived');
  });
});
