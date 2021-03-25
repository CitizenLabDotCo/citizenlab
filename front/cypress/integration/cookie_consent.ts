import { randomString, randomEmail } from '../support/commands';

describe('Cookie consent form for not-signed-in users', () => {
  before(() => {
    cy.visit('/');
    cy.get('#e2e-landing-page');
    cy.wait(500);
  });

  it('Shows the correct options when not signed in', () => {
    cy.get('#e2e-cookie-banner');
    cy.get('#e2e-cookie-banner').find('.integration-open-modal').click();
    cy.get('#e2e-preference-dialog').contains('Google Analytics');
    cy.get('#e2e-preference-dialog').should('not.contain.text', 'SatisMeter');
  });
});

describe('Cookie consent form for signed-in users', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();

  before(() => {
    cy.apiSignup(firstName, lastName, email, password).then((user) => {
      cy.setLoginCookie(email, password);
      cy.wait(500);
      cy.visit('/');
      cy.get('#e2e-landing-page');
      cy.wait(500);
    });
  });

  it('Shows the correct options when signed up as normal user', () => {
    cy.get('#e2e-cookie-banner');
    cy.get('#e2e-cookie-banner').find('.integration-open-modal').click();
    cy.get('#e2e-preference-dialog').contains('Google Analytics');
    cy.get('#e2e-preference-dialog').should('not.contain.text', 'SatisMeter');
  });
});

describe('Cookie consent form for signed-in admins', () => {
  before(() => {
    cy.setAdminLoginCookie();
    cy.wait(500);
    cy.visit('/');
    cy.get('#e2e-landing-page');
    cy.wait(500);
  });

  it('Shows the correct options when signed up as admin user', () => {
    cy.get('#e2e-cookie-banner');
    cy.get('#e2e-cookie-banner').find('.integration-open-modal').click();
    cy.get('#e2e-preference-dialog').contains('Google Analytics');
  });
});
