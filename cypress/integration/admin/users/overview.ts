describe('/admin/users/ page', () => {
  beforeEach(() => {
    cy.login('admin@citizenlab.co', 'testtest');
    cy.visit('/admin/users');
  });

  it('Displays the main elements', () => {
    cy.get('#sidebar').find('.active').contains('Users');
    cy.get('.e2e-left-panel').find('.active').contains('Users');
    cy.get('.e2e-user-table').find('.e2e-user-table-row');
  });

  it('Has a functional search field, show the user correctly', () => {
    cy.get('.e2e-search-input').type('Sylvester');
    cy.wait(700);
    cy.get('.e2e-user-table').find('.e2e-user-table-row').should('have.length', 1);
    cy.get('.e2e-user-table').find('.e2e-user-table-row').contains('admin@citizenlab.co');
    cy.get('.e2e-user-table').find('.e2e-user-table-row').contains('Sylvester Kalinoski');
    cy.get('.e2e-user-table').find('.e2e-user-table-row').find('input').should('have.attr', 'aria-checked').and('be', 'true');
  });

  it('Lets you select users and reacts accordingly', () => {
    cy.get('.export').contains('Export all users');
    cy.get('.e2e-selected-count').contains('0');
    cy.get('.e2e-user-table').find('.e2e-user-table-row').first().find('.e2e-checkbox').click();
    cy.get('.e2e-selected-count').contains('1');
    cy.get('.e2e-move-users');
    cy.get('.export').contains('Export selected users');
  });
});
