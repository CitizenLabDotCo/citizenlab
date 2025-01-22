// Test that the ideation input status form shows when creating a new status
describe('Ideation status form', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/settings/ideation/statuses');
    cy.acceptCookies();
  });

  it('Shows form when creating a new ideation input status', () => {
    cy.get('[data-testid="e2e-add-status-button"]').click();
    cy.get('[data-testid="e2e-new-status-page"]').should('exist');
  });
});
