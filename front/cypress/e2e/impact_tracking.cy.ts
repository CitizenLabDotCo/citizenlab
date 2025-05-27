describe('Impact tracking: Session tracking', () => {
  // Following test cases accept both a 200 or a 204 response. The sessions
  // endpoints don't do anything and return 204 (no content) when they detect
  // that a session is logged by a crawler and 200 when a session is logged
  // by a normal browser. Cypress is seen as a crawler when running in headless
  // mode, like in CI, but as a real user in interactive mode. There seems to be
  // no elegant way to set the user-agent on a per test-suite basis, so we
  // simply accept both status codes

  it('Does a POST request to /sessions as a normal user', () => {
    cy.intercept('POST', '**/web_api/v1/sessions').as('createSession');
    cy.goToLandingPage();
    cy.wait('@createSession').then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 204]);
    });
  });

  it('Does a POST request to /sessions as an admin', () => {
    cy.setAdminLoginCookie();
    cy.intercept('POST', '**/web_api/v1/sessions').as('createSession');
    cy.goToLandingPage();
    cy.wait('@createSession').then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 204]);
    });
  });

  it.skip('Upgrades the current session after a user signed in', () => {
    cy.intercept('PATCH', '**/web_api/v1/sessions/current/upgrade').as(
      'upgradeSession'
    );
    cy.login('mortal@govocal.com', 'democracy2.0');
    cy.wait('@upgradeSession').then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 204]);
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
      expect(interception.response?.statusCode).to.be.oneOf([201, 204]);
    });
  });

  // Same as test above
  it.skip('Does a POST request to /sessions/:id/track_pageview when user navigates', () => {
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
    cy.get('.e2e-admin-publication-card').first().click();
    cy.wait('@trackPageview').then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([201, 204]);
    });
  });
});
