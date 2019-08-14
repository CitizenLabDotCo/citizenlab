describe('/admin route', () => {
  it('redirects unauthenticated users to signin', () => {
    cy.visit('/admin');
    cy.wait(500);
    cy.location('pathname').should('eq', '/en-GB/sign-in');
  });

  it('redirects admins to dashboard', () => {
    cy.login('admin@citizenlab.co', 'testtest');
    cy.visit('/admin');
    cy.wait(500);
    cy.location('pathname').should('eq', '/en-GB/admin/dashboard');
  });
});
