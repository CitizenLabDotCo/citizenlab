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

  it('Upgrades the current session after a user signed in', () => {
    cy.intercept('PATCH', '**/web_api/v1/sessions/current/upgrade').as(
      'upgradeSession'
    );
    cy.login('mortal@citizenlab.co', 'democracy2.0');
    cy.wait('@upgradeSession').then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
    });
  });

  it('Upgrades the current session after a user registered', () => {
    cy.intercept('PATCH', '**/web_api/v1/sessions/current/upgrade').as(
      'upgradeSession'
    );
    cy.signUp();
    cy.wait('@upgradeSession').then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
    });
  });
});
