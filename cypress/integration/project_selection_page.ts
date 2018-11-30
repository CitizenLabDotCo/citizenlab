describe('Project selection page', () => {
  beforeEach(() => {
    cy.visit('/ideas/new');
    cy.get('.e2e-accept-cookies-btn').click();
  });

  it('shows the page', () => {
    cy.get('.e2e-project-selection-page');
  });

  it('shows a disabled continue button when no project selected', () => {
    cy.get('.e2e-submit-project-select-form').should('have.class', 'disabled');
  });

  it('shows an enabled continue button when a project is selected', () => {
    cy.contains('An idea? Bring it to your council!').click();
    cy.get('.e2e-submit-project-select-form').should('not.have.class', 'disabled');
  });

  it('cannot select a disabled project', () => {
    cy.contains('Make the city more digital').click();
    cy.get('.e2e-submit-project-select-form').should('have.class', 'disabled');
  });

  it('navigates to the idea form when selecting a project and clicking continue', () => {
    cy.contains('An idea? Bring it to your council!').click();
    cy.get('.e2e-submit-project-select-form').click();
    cy.url().should('include', '/projects/an-idea-bring-it-to-your-council/ideas/new');
    cy.get('#idea-form');
  });
});
