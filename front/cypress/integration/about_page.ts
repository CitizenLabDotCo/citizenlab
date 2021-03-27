describe('About page', () => {
  beforeEach(() => {
    cy.visit('/pages/information');
  });

  it('shows the information page by default', () => {
    cy.get('.e2e-page-information');
  });

  it('has a working link to the cookie policy page', () => {
    cy.get('.e2e-page-link-to-cookie-policy').click();
    cy.location('pathname').should('eq', '/en/pages/cookie-policy');
    cy.get('.e2e-page-cookie-policy');
  });

  it('has a working link to the privacy policy page', () => {
    cy.get('.e2e-page-link-to-privacy-policy').click();
    cy.location('pathname').should('eq', '/en/pages/privacy-policy');
    cy.get('.e2e-page-privacy-policy');
  });

  it('has a working link to the terms and conditions page', () => {
    cy.get('.e2e-page-link-to-terms-and-conditions').click();
    cy.location('pathname').should('eq', '/en/pages/terms-and-conditions');
    cy.get('.e2e-page-terms-and-conditions');
  });

  it('has a working link to the accessibility statement page', () => {
    cy.get('.e2e-page-link-to-accessibility-statement').click();
    cy.location('pathname').should('eq', '/en/pages/accessibility-statement');
    cy.get('.e2e-page-accessibility-statement');
  });
});
