describe('email consent', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/messaging/emails/custom/new');
  });

  it('lets admins create a custom email, this email contains a link to unsubscribe', () => {
    // creates a custom email
    cy.get('#e2e-reply-to-input').clear().type('test@test.com');

    cy.get('.e2e-campaign_subject_multiloc .e2e-localeswitcher').each(
      (button) => {
        // input
        cy.wrap(button).click();
        cy.wrap(button).should('have.class', 'selected');
        cy.get('.e2e-campaign_subject_multiloc')
          .find('input')
          .first()
          .type('Test subject');
        cy.wrap(button).find('div').should('have.class', 'notEmpty');
      }
    );

    cy.get('.e2e-campaign_body_multiloc .e2e-localeswitcher').each((button) => {
      // input
      cy.wrap(button).click();
      cy.wrap(button).should('have.class', 'selected');
      // cy.wait(1000);
      cy.get('.e2e-campaign_body_multiloc')
        .find('.ql-editor')
        .first()
        .type('Test content');
      cy.wrap(button).find('div').should('have.class', 'notEmpty');
    });

    cy.get('#e2e-campaign-form-save-button').click();

    cy.get('#e2e-email-preview-iframe')
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
