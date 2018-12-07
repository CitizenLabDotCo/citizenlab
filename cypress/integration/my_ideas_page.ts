describe('My ideas page', () => {
  beforeEach(() => {
    cy.visit('/profile/koen-gremmelprez');
      // .get('.e2e-accept-cookies-btn').click();
  });

  it('shows the page', () => {
    cy.get('#e2e-usersshowpage');
  });

  it('shows the user name', () => {
    cy.get('#e2e-usersshowpage-fullname')
      .contains('Koen Gremmelprez');
  });

  it('shows the idea cards component', () => {
    cy.get('#e2e-ideas-container');
  });
});
