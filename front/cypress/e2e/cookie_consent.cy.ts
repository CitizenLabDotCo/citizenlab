import { randomString, randomEmail } from '../support/commands';

describe('Cookie consent form for not-signed-in users', () => {
  it('Shows the correct options when not signed in', () => {
    cy.visit('/');
    cy.get('#e2e-landing-page').should('exist');
    cy.get('#e2e-cookie-banner').should('exist');
    cy.get('#e2e-cookie-banner').find('.integration-open-modal').click();
    cy.get('#e2e-preference-dialog').contains('Matomo');
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
    });
  });

  it('Shows the correct options when signed up as normal user', () => {
    cy.visit('/');
    cy.get('#e2e-landing-page').should('exist');
    cy.get('#e2e-cookie-banner').should('exist');
    cy.get('#e2e-cookie-banner').find('.integration-open-modal').click();
    cy.get('#e2e-preference-dialog').contains('Matomo');
    cy.get('#e2e-preference-dialog').should('not.contain.text', 'SatisMeter');
  });
});

describe('Cookie consent form for signed-in admins', () => {
  before(() => {
    cy.setAdminLoginCookie();
  });

  it('Shows the correct options when signed up as admin user', () => {
    cy.visit('/');
    cy.get('#e2e-landing-page').should('exist');
    cy.get('#e2e-cookie-banner').should('exist');
    cy.get('#e2e-cookie-banner').find('.integration-open-modal').click();
    cy.get('#e2e-preference-dialog').contains('Matomo');
  });
});
