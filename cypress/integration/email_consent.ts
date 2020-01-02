describe('email consent', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/emails/custom/new');
    cy.acceptCookies();
  });
  it('lets admins create a custom email', () => {
    cy.get('.e2e-multiloc-input').find('input').first().type('Test subject');
    cy.get('.e2e-multiloc-editor').find('.ql-editor').first().type('Test content');
    cy.get('.e2e-submit-wrapper-button').find('button').click();
    cy.wait(1000);

    cy.get('iframe').then(($iframe) => {
      // query into the iframe
      const $body = $iframe.contents().find('body');

      cy.wrap($body).find('a.e2e-unsubscribe').then(link => {
        cy.visit(link.prop('href'));
      });
    });

    cy.wait(400);

    cy.get('#e2e-email-settings-page');
    cy.get('#e2e-consent-form');
    cy.get('.e2e-unsubscribe-status').contains('success').contains('Official');

    cy.get('input#mention').parent().click();
    cy.get('.e2e-submit-wrapper-button').click();
    cy.contains('saved');
  });
});
