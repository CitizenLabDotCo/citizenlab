describe('Ideas overview page', () => {
  beforeEach(() => {
    cy.visit('/ideas');
  });

  context('Project filter', () => {
    it('filters correctly on 1 project', () => {
      cy.get('#e2e-project-filter-selector').click();
      // select project
      cy.get('.e2e-filter-selector-dropdown-list').contains('An idea? Bring it to your council!').click();
      // contains idea from this project
      cy.get('#e2e-ideas-container').contains('Very New Idea');
    });

    it('filters correctly on 2 projects', () => {
      cy.get('#e2e-project-filter-selector').click();
      // select first project
      cy.get('.e2e-filter-selector-dropdown-list').contains('An idea? Bring it to your council!').click();
      // select second project
      cy.get('.e2e-filter-selector-dropdown-list').contains('Sit voluptas sint aliquid quia aut nihil eos').click();
      // contains idea from first project
      cy.get('#e2e-ideas-container').contains('Very New Idea');
      // contains idea from second project
      cy.get('#e2e-ideas-container').contains('Recusandae illo quis porro quisquam enim.');
    });

  });
});
