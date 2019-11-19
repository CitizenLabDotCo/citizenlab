describe('Project process page', () => {
  beforeEach(() => {
    cy.visit('/projects/test-project-1-timeline-with-file/process');
    cy.acceptCookies();
  });

  it('shows the page', () => {
    cy.get('.e2e-project-process-page');
  });

  it('shows that the current page is process', () => {
    cy.get('.e2e-project-process-link').should('have.class', 'active');
  });

  it('shows a selected phase', () => {
    cy.get('.selectedPhase');
  });
});
