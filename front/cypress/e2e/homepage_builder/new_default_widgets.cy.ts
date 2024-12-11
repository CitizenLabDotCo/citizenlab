describe('New default widgets', () => {
  it('has the "Open to participation" widget', () => {
    cy.goToLandingPage();
    cy.get('.e2e-open-to-participation').should('exist');
  });

  it('has the "Finished projects" widget', () => {
    cy.goToLandingPage();
    cy.get('.e2e-finished-or-archived').should('exist');
  });

  // it('should followed project in the "For you" widget', () => {

  // });
});
