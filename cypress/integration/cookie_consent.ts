import { randomString, randomEmail } from '../support/commands';

describe('Cookie consent form', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  let userId: string = null as any;

  before(() => {
    cy.apiSignup(firstName, lastName, email, password).then(
      (user) => (userId = user.body.data.id)
    );
  });
  it('Shows the correct destinations when unsigned', () => {
    cy.visit('/');
    cy.get('#e2e-cookie-banner').find('.integration-open-modal').click();
    cy.get('#e2e-preference-dialog').contains('Google Analytics');
    cy.get('#e2e-preference-dialog').should('not.contain.text', 'SatisMeter');
  });
  it('Shows the correct destinations when signed up as normal user', () => {
    cy.setLoginCookie(email, password);
    cy.wait(500);
    cy.visit('/');
    cy.get('#e2e-cookie-banner').find('.integration-open-modal').click();
    cy.get('#e2e-preference-dialog').contains('Google Analytics');
    cy.get('#e2e-preference-dialog').should('not.contain.text', 'SatisMeter');
  });
  it('Shows the correct destinations when signed up as admin user', () => {
    cy.setAdminLoginCookie();
    cy.wait(500);
    cy.visit('/');
    cy.get('#e2e-cookie-banner').find('.integration-open-modal').click();
    cy.get('#e2e-preference-dialog').contains('Google Analytics');
  });
  it('Lets you pick your categories and save', () => {
    cy.visit('/');
    cy.get('#e2e-cookie-banner').find('.integration-open-modal').click();
    cy.get('#e2e-preference-dialog')
      .get('.e2e-category')
      .each((question) => question.find('label').first().click());
    cy.get('#e2e-preferences-save').click();
  });
  it('When you get admin, lets you consent to admin destintions', () => {
    if (!location.origin.includes('localhost')) {
      cy.setLoginCookie(email, password);
      cy.wait(500);
      cy.visit('/');

      cy.acceptCookies();

      cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
        const adminJwt = response.body.jwt;

        return cy.request({
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminJwt}`,
          },
          method: 'PATCH',
          url: `web_api/v1/users/${userId}`,
          body: {
            user: {
              email,
              password,
              roles: [{ type: 'admin' }],
            },
          },
        });
      });

      cy.wait(500);
      cy.visit('/');
      cy.wait(500);
      cy.get('#e2e-cookie-banner').find('.integration-open-modal').click();
      cy.get('#e2e-preference-dialog').contains('SatisMeter');
    }
  });
});
