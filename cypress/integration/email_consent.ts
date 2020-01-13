describe('email consent', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/emails/custom/new');
    cy.acceptCookies();
  });
  it('lets admins create a custom email, this email contains a link to unsubscribe', () => {
    // creates a custom email
    cy.get('.e2e-multiloc-input').find('input').first().type('Test subject');
    cy.get('.e2e-multiloc-editor').find('.ql-editor').first().type('Test content');
    cy.get('.e2e-submit-wrapper-button').find('button').click();
    cy.wait(1000);

    // in the custom emails preview...
    cy.get('iframe').then(($iframe) => {
      // query into the iframe
      const $body = $iframe.contents().find('body');

      // get the unsubscription link and visit it
      cy.wrap($body).find('a.e2e-unsubscribe').then(link => {
        cy.visit(link.prop('href'));
      });
    });

    cy.wait(400);
    // check users has been unsubscribed
    cy.get('#e2e-email-settings-page');
    cy.get('#e2e-consent-form');
    cy.get('.e2e-unsubscribe-status').contains('success').contains('Official');

    // gets official category, turn it back on and save
    cy.get('input#manual').parent().click();
    cy.get('.e2e-submit-wrapper-button').click();
    cy.contains('saved');
  });
});
