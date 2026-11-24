describe('Admin product feedback page', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.intercept('GET', '**/web_api/v1/users/me/userjot_identity', {
      body: {
        data: {
          type: 'userjot_identity',
          attributes: { project_id: 'e2e-project', signature: 'e2e-signature' },
        },
      },
    }).as('userjotIdentity');
    cy.intercept('GET', 'https://cdn.userjot.com/**', {
      body: '',
      headers: { 'content-type': 'application/javascript' },
    });
  });

  it('opens from the sidebar and loads the page', () => {
    cy.visit('/en/admin/dashboard/overview');
    cy.get('nav#sidebar a[href="/en/admin/product-feedback"]').click();
    cy.location('pathname').should('eq', '/en/admin/product-feedback');
    cy.wait('@userjotIdentity');
    cy.get('#e2e-product-feedback-page');
    cy.get('#e2e-userjot-embed');
  });
});
