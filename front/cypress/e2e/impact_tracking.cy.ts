describe('Impact tracking: Session tracking', () => {
  it('Does a POST request to /sessions as a normal user', () => {
    cy.intercept('POST', '**/web_api/v1/sessions').as('createSession');
    cy.goToLandingPage();
    cy.wait('@createSession').then((interception) => {
      expect(interception.response?.statusCode).to.eq(201);
    });
  });

  it('Does a POST request to /sessions as an admin', () => {
    cy.setAdminLoginCookie();
    cy.intercept('POST', '**/web_api/v1/sessions').as('createSession');
    cy.goToLandingPage();
    cy.wait('@createSession').then((interception) => {
      expect(interception.response?.statusCode).to.eq(201);
    });
  });
});
