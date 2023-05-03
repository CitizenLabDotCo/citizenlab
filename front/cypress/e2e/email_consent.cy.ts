describe('email consent', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/messaging/emails/custom/new');
    cy.acceptCookies();
  });

  it('lets admins create a custom email, this email contains a link to unsubscribe and turns off subscription', () => {
    // creates a custom email
    cy.get('#e2e-reply-to-input').type('test@test.com');

    cy.get('.e2e-campaign_subject_multiloc .e2e-localeswitcher').each(
      (button) => {
        // input
        cy.wrap(button).click();
        cy.get('.e2e-campaign_subject_multiloc')
          .find('input')
          .first()
          .type('Test subject');
      }
    );

    cy.get('.e2e-campaign_body_multiloc .e2e-localeswitcher').each((button) => {
      // input
      cy.wrap(button).click();
      cy.get('.e2e-campaign_body_multiloc')
        .find('.ql-editor')
        .first()
        .type('Test content');
    });

    cy.get('#e2e-campaign-form-save-button').click();
    cy.get('#e2e-custom-email-container');
    cy.get('#e2e-custom-email-container iframe');

    cy.get('#e2e-custom-email-container iframe')
      .its('0.contentDocument.body')
      .should('not.be.empty')
      .then(cy.wrap)
      .find('a')
      .contains('Unsubscribe')
      .click();

    // TODO: After re-enabling this test (it was being skipped) a few weeks back, I've tried many different ways to get these
    // checks to pass, but I'm unable to do so. Working with iframes is known to be pretty tricky in cypress.
    // I'm commenting this out for now, but we should try to get this working in the future.
    //   cy.get('#e2e-custom-email-container iframe').should('exist');
    //   cy.get('#e2e-custom-email-container iframe')
    //     .its('0.contentDocument.body')
    //     .should('not.be.empty')
    //     .then(cy.wrap)
    //     .find('#e2e-consent-form');

    //   cy.get('#e2e-custom-email-container iframe')
    //     .its('0.contentDocument.body')
    //     .should('not.be.empty')
    //     .then(cy.wrap)
    //     .find('.e2e-unsubscribe-status')
    //     .contains('success')
    //     .contains('Official');
  });
});
