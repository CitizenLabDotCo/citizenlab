import { randomString, randomEmail } from '../../support/commands';

describe('Cookie consent form for not-signed-in users', () => {
  it('Shows the correct options when not signed in', () => {
    cy.clearCookies();
    cy.visit('/');
    cy.dataCy('e2e-manage-preferences-btn').should('be.visible').click();
    cy.get('#e2e-preference-dialog').contains('Matomo');
    cy.get('#e2e-preference-dialog').should('not.contain.text', 'SatisMeter');
  });
});

describe('Cookie consent form for signed-in users', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();

  beforeEach(() => {
    cy.clearCookies();
    cy.apiSignup(firstName, lastName, email, password).then((user) => {
      cy.setLoginCookie(email, password);
    });
  });

  it('Shows the correct options when signed up as normal user', () => {
    cy.visit('/');
    cy.dataCy('e2e-manage-preferences-btn').should('be.visible').click();
    cy.get('#e2e-preference-dialog').contains('Matomo');
    cy.get('#e2e-preference-dialog').should('not.contain.text', 'SatisMeter');
  });
});

describe('Cookie consent form for signed-in admins', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.setLoginCookie('admin@govocal.com', 'democracy2.0');
  });

  it('Shows the correct options when signed up as admin user', () => {
    cy.visit('/');
    cy.dataCy('e2e-manage-preferences-btn').should('be.visible').click();
    cy.get('#e2e-preference-dialog').contains('Matomo');
  });
});
