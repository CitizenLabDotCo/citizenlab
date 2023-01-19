describe('/admin/users/ page', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/users');
  });

  it('Displays the main elements', () => {
    cy.get('#sidebar').find('.active').contains('Users');
    cy.get('.e2e-left-panel').find('.active').contains('users');
    cy.get('.e2e-user-table').find('.e2e-user-table-row');
  });

  it('Lets you select users then show selected controls', () => {
    cy.get('.export.e2e-exportAllUsers');
    cy.get('.e2e-user-table')
      .find('.e2e-user-table-row')
      .first()
      .find('.e2e-checkbox')
      .click();
    cy.get('.e2e-selected-count').contains('1');
    cy.get('.e2e-move-users');
    cy.get('.export.e2e-exportSelectedUsers');
  });
});
