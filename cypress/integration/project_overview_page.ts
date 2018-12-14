describe('Project overview page', () => {
  beforeEach(() => {
    cy.visit('/projects/');
  });

  it('shows the page', () => {
    cy.get('#e2e-projects-container');
  });

  it('shows all archived projects when the archived filter is selected', () => {
    cy.get('.e2e-filter-selector-button').click();
    cy.get('.e2e-projects-filter-archived').click();
    cy.get('.e2e-filter-selector-button').contains('Archived projects');
    cy.get('#e2e-projects-list').find('.e2e-project-card ').should('have.length', 1);
    cy.get('.e2e-project-card').first().should('have.class', 'archived');
  });
});
