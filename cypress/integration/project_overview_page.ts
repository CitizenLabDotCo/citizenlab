describe('Project overview page', () => {
  beforeEach(() => {
    cy.visit('/projects/');
      // .get('.e2e-accept-cookies-btn').click();
  });

  it('shows the page', () => {
    cy.get('#e2e-projects-container');
  });

  it('has a working project filter', () => {
    // selects and displays the correct filter
    cy.get('.e2e-filter-selector-button').click().get('.e2e-projects-filter-archived').click()
      .get('.e2e-filter-selector-button').contains('Archived projects');

    // shows the correct project selection
    cy.get('#e2e-projects-list').children().each(($projectCard) => {
      cy.wrap($projectCard).should('have.class', 'archived');
    });
  });
});
