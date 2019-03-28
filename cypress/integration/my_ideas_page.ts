describe('My ideas page', () => {
  beforeEach(() => {
    cy.login('admin@citizenlab.co', 'testtest');
    cy.visit('/profile/sylvester-kalinoski');
  });

  it('shows the page, username and idea cards component', () => {
    cy.get('#e2e-usersshowpage');
    cy.get('#e2e-usersshowpage-fullname').contains('Sylvester Kalinoski');
    cy.get('#e2e-ideas-container');
  });
});
