describe('Project card component', () => {
  beforeEach(() => {
    cy.goToLandingPage();
  });

  it('old project card: navigates to project page on click title', () => {
    cy.dataCy('e2e-project-card').first().should('be.visible').click();

    cy.url().should('include', '/en/projects');
    cy.get('#e2e-project-page');
  });

  it('new (light) project card navigates to project page on click title', () => {
    cy.dataCy('e2e-light-project-card').first().should('be.visible').click();

    cy.url().should('include', '/en/projects');
    cy.get('#e2e-project-page');
  });
});
