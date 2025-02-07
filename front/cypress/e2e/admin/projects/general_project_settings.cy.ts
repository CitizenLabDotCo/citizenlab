describe('Admin: general project settings', () => {
  // When there's a classic description, clicking the project description preview links to project description settings
  it('links to project description settings', () => {
    cy.setAdminLoginCookie();
    cy.visit('/en/admin/projects/all');
    cy.acceptCookies();
    cy.get('.e2e-admin-edit-publication > a').first().click();
    cy.get(
      '[data-cy="e2e-project-description-preview-link-to-settings"]'
    ).click();
    cy.get('#e2e-project-description-multiloc-module-active').should('exist');
  });
});
