describe('My ideas page', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login('admin@citizenlab.co', 'testtest');
    cy.get('#e2e-user-menu-container button').click();
    cy.get('#e2e-my-ideas-page-link').click();
  });

  it('shows the page', () => {
    cy.get('#e2e-usersshowpage');
  });

  it('shows the user name', () => {
    cy.get('#e2e-usersshowpage-fullname').contains('Sylvester Kalinoski');
  });

  it('shows the idea cards component', () => {
    cy.get('#e2e-ideas-container');
  });
});
