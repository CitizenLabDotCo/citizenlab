import 'cypress-iframe';

describe('email consent', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/emails/custom/new');
    cy.acceptCookies();
  });

  it('lets admins create a custom email, this email contains a link to unsubscribe and turns off subscription', () => {
    // creates a custom email
    cy.get('.e2e-multiloc-input').find('input').first().type('Test subject');
    cy.get('.e2e-multiloc-editor').find('.ql-editor').first().type('Test content');
    cy.get('.e2e-submit-wrapper-button').find('button').click();

    cy.wait(1000);

    // check that iframe is loaded
    cy.get('#e2e-email-preview-iframe');
    cy.frameLoaded('#e2e-email-preview-iframe');

    cy.wait(2000);

    cy.enter('#e2e-email-preview-iframe').then((getBody) => {
      // unsubscribe the user
      getBody().find('a.e2e-unsubscribe').click();
    });

    cy.wait(2000);

    cy.enter('#e2e-email-preview-iframe').then((getBody) => {
      // check that the user is unsubscribed
      getBody().find('#e2e-email-settings-page');
      getBody().find('#e2e-consent-form');
      getBody().find('.e2e-unsubscribe-status').contains('success').contains('Official');
    });
  });
});
