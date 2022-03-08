describe.skip('email consent', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/emails/custom/new');
    cy.acceptCookies();
  });

  it('lets admins create a custom email, this email contains a link to unsubscribe and turns off subscription', () => {
    // creates a custom email
    cy.get('.e2e-campaign_subject_multiloc')
      .find('input')
      .first()
      .type('Test subject');
    cy.get('.e2e-campaign_body_multiloc')
      .find('.ql-editor')
      .first()
      .type('Test content');
    cy.get('.e2e-submit-wrapper-button').find('button').click();
    cy.wait(1000);
    cy.get('#e2e-custom-email-container');
    cy.get('#e2e-custom-email-container iframe');

    cy.get('#e2e-custom-email-container iframe')
      .its('0.contentDocument.body')
      .should('not.be.empty')
      .then(cy.wrap)
      .find('a')
      .contains('Unsubscribe')
      .click();

    cy.wait(2000);

    cy.get('#e2e-custom-email-container iframe').then(($iframe) => {
      const $body = $iframe.contents().find('body');
      cy.wrap($body).find('#e2e-email-settings-page');
      cy.wrap($body).find('#e2e-consent-form');
      cy.wrap($body)
        .find('.e2e-unsubscribe-status')
        .contains('success')
        .contains('Official');
    });
  });
});
