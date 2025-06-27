// Test that the proposals input status form shows when creating a new status
describe('Proposals status form', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/settings/statuses/proposals');
    cy.acceptCookies();
  });

  it('Shows form when creating a new proposals input status', () => {
    cy.get('[data-testid="e2e-add-status-button"]').click();
    cy.get('[data-testid="e2e-new-status-page"]').should('exist');
  });

  it('Shows the form when editing an existing proposals input status', () => {
    cy.get('[data-testid="e2e-edit-status-button"]').first().click();
    cy.get('[data-testid="e2e-edit-status-page"]').should('exist');
  });
});
