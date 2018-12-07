describe('About page', () => {
  beforeEach(() => {
    cy.visit('/pages/information');
      // .get('.e2e-accept-cookies-btn').click();
  });

  it('shows the about page', () => {
    cy.get('#e2e-aboutpage');
  });

  it('shows the information page by default', () => {
    cy.get('#e2e-aboutpage-pagetitle')
      .contains('Information Page');
  });

  it('contains the pages navigation', () => {
    cy.get('#e2e-aboutpage-navwrapper');
  });

  it('has three page navigation links', () => {
    // links to cookie policy, privacy policy, terms & conditions
    cy.get('#e2e-aboutpage-navwrapper')
      .find('.e2e-aboutpage-navlink')
      .should('have.length', 3);
  });

  it('navigates to the Cookie Policy page when clicked on the corresponding link', () => {
    cy.get('#e2e-aboutpage-navwrapper')
      .find('.e2e-aboutpage-navlink')
      .contains('Cookie Policy')
      .click();

    cy.location('pathname').should('eq', '/en-GB/pages/cookie-policy');
  });
});
