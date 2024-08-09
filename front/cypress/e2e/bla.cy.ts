describe('Bla', () => {
  it('redirects', () => {
    cy.origin('https://fake-sso.onrender.com', () => {
      cy.visit('/');
      cy.wait(2000);
    });
  });
});
