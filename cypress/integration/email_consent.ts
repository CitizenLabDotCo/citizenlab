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
    cy.frameLoaded('#e2e-email-preview-iframe');

    // unsubscribe the user
    cy.iframe().find('a.e2e-unsubscribe').click();

    // check that the user is unsubscribed
    cy.wait(1000);
    cy.iframe().find('#e2e-email-settings-page');
    cy.iframe().find('#e2e-consent-form');
    cy.iframe().find('.e2e-unsubscribe-status').contains('success').contains('Official');
  });
});
