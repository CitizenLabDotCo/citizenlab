// TODO: Skipping this for now as the registration work doesn't include tracking yet.
// Will re-enable the tests once tracking is introduced again.
describe.skip('Impact tracking: Session tracking', () => {
  // Following test cases accept both a 201/200 or a 204 response. The sessions
  // endpoints don't do anything and return 204 (no content) when they detect
  // that a session is logged by a crawler and 200/201 when a session is logged
  // by a normal browser. Cypress is seen as a crawler when running in headless
  // mode, like in CI, but as a real user in interactive mode. There seems to be
  // no elegant way to set the user-agent on a per test-suite basis, so we
  // simply accept both status codes

  it('Does a POST request to /sessions as a normal user', () => {
    cy.intercept('POST', '**/web_api/v1/sessions').as('createSession');
    cy.goToLandingPage();
    cy.wait('@createSession').then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([201, 204]);
    });
  });

  it('Does a POST request to /sessions as an admin', () => {
    cy.setAdminLoginCookie();
    cy.intercept('POST', '**/web_api/v1/sessions').as('createSession');
    cy.goToLandingPage();
    cy.wait('@createSession').then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([201, 204]);
    });
  });

  it('Upgrades the current session after a user signed in', () => {
    cy.intercept('PATCH', '**/web_api/v1/sessions/current/upgrade').as(
      'upgradeSession'
    );
    cy.login('mortal@citizenlab.co', 'democracy2.0');
    cy.wait('@upgradeSession').then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 204]);
    });
  });

  // Commenting this out as it is a flaky test. See https://citizenlabco.slack.com/archives/C02PFSWEK6X/p1665558422691559?thread_ts=1665539765.438799&cid=C02PFSWEK6X
  // it('Upgrades the current session after a user registered', () => {
  //   cy.intercept('PATCH', '**/web_api/v1/sessions/current/upgrade').as(
  //     'upgradeSession'
  //   );
  //   cy.signUp();
  //   cy.wait('@upgradeSession').then((interception) => {
  //     expect(interception.response?.statusCode).to.be.oneOf([200, 204]);
  //   });
  // });
});
