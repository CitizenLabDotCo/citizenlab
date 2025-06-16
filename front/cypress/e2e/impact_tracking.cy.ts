describe('Impact tracking: Session tracking', () => {
  it('Does a POST request to /sessions as a normal user', () => {
    cy.intercept('POST', '**/web_api/v1/sessions').as('createSession');
    cy.goToLandingPage();
    cy.wait('@createSession').then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
    });
  });

  it('Does a POST request to /sessions as an admin', () => {
    cy.setAdminLoginCookie();
    cy.intercept('POST', '**/web_api/v1/sessions').as('createSession');
    cy.goToLandingPage();
    cy.wait('@createSession').then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
    });
  });

  it('Upgrades the current session after a user signed in', () => {
    cy.intercept('PATCH', '**/web_api/v1/sessions/current/upgrade').as(
      'upgradeSession'
    );
    cy.login('mortal@govocal.com', 'democracy2.0');
    cy.wait('@upgradeSession').then((interception) => {
      expect(interception.response?.statusCode).to.eq(202);
    });
  });

  // This passes locally but fails in CI, because there
  // cypress is seen as a bot and therefore no session is created
  it('Does a POST request to /sessions/:id/track_pageview when enters platform', () => {
    cy.intercept('POST', '**/web_api/v1/sessions').as('createSession');
    cy.intercept('POST', '**/web_api/v1/sessions/*/track_pageview').as(
      'trackPageview'
    );
    cy.goToLandingPage();
    cy.wait('@createSession');
    cy.wait('@trackPageview').then((interception) => {
      expect(interception.response?.statusCode).to.eq(201);
    });
  });

  // Same as test above
  it('Does a POST request to /sessions/:id/track_pageview when user navigates', () => {
    cy.intercept('POST', '**/web_api/v1/sessions').as('createSession');
    cy.intercept('POST', '**/web_api/v1/sessions/*/track_pageview').as(
      'trackPageview'
    );
    cy.goToLandingPage();
    cy.wait('@createSession');
    cy.wait('@trackPageview');

    cy.intercept('POST', '**/web_api/v1/sessions/*/track_pageview').as(
      'trackPageview'
    );
    cy.acceptCookies();
    cy.get('#site-map-link').click();
    cy.wait('@trackPageview').then((interception) => {
      expect(interception.response?.statusCode).to.eq(201);
    });
  });
});
