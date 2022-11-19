describe('About page', () => {
  beforeEach(() => {
    cy.visit('/pages/information');
  });

  it('shows the information page by default', () => {
    cy.get('.e2e-page-information');
  });
});
