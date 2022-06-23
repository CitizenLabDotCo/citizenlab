describe('Texting module', () => {
  before(() => {
    cy.setAdminLoginCookie();
  });

  const message = 'Test text campaign';
  it('can create a new texting campaign', () => {
    cy.visit('/admin/messaging/texting');
    cy.get('#e2e-add-text-campaign-button').click();
    cy.get('#e2e-sms-campaign-form-phone-numbers').type('+12345678912');
    cy.get('#e2e-sms-campaign-form-message').type(message);
    cy.get('#e2e-sms-campaign-form-submit').click();
    cy.visit('/admin/messaging/texting');
    cy.contains(message).should('exist');
  });
});
