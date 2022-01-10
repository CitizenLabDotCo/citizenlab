import { randomString, randomEmail } from '../support/commands';

describe.skip('Sign up - custom fields step', () => {
  describe('No custom fields', () => {
    before(() => {
      const firstName = randomString();
      const lastName = randomString();
      const email = randomEmail();
      const password = randomString();
      cy.apiSignup(firstName, lastName, email, password);
      cy.setLoginCookie(email, password);
      cy.goToLandingPage();
    });

    it('does not show it when no custom fields are enabled', () => {
      cy.get('#e2e-sign-up-in-modal').should('not.exist');
    });
  });

  describe('Optional custom field', () => {
    const randomFieldName = randomString();
    const firstName = randomString();
    const lastName = randomString();
    const email = randomEmail();
    const password = randomString();
    let customFieldId: string;

    before(() => {
      cy.apiCreateCustomField(randomFieldName, true, false).then((response) => {
        customFieldId = response.body.data.id;
        cy.apiSignup(firstName, lastName, email, password);
        cy.setLoginCookie(email, password);
        cy.goToLandingPage();
      });
    });

    it('shows the custom field step and can skip it', () => {
      cy.get('#e2e-signup-custom-fields-container');
      cy.get('#e2e-signup-custom-fields-skip-btn').click();
      cy.get('#e2e-signup-success-container', { timeout: 20000 });
      cy.get('.e2e-signup-success-close-button').click();
      cy.get('#e2e-sign-up-in-modal').should('not.exist');
    });

    after(() => {
      cy.apiRemoveCustomField(customFieldId);
    });
  });

  describe('Required custom field', () => {
    const randomFieldName = randomString();
    const firstName = randomString();
    const lastName = randomString();
    const email = randomEmail();
    const password = randomString();
    let customFieldId: string;

    before(() => {
      cy.apiCreateCustomField(randomFieldName, true, true).then((response) => {
        customFieldId = response.body.data.id;
        cy.apiSignup(firstName, lastName, email, password);
        cy.setLoginCookie(email, password);
        cy.goToLandingPage();
      });
    });

    it('shows the custom field step and shows an error message when submitting an empty form', () => {
      cy.get('#e2e-signup-custom-fields-container');
      cy.get('#e2e-signup-custom-fields-skip-btn').should('not.exist');
      cy.get('#e2e-signup-custom-fields-submit-btn').click();
      cy.get('#e2e-signup-custom-fields-container .e2e-error-message').should(
        'contain',
        'This field is required'
      );
    });

    after(() => {
      cy.apiRemoveCustomField(customFieldId);
    });
  });

  describe('Required custom field', () => {
    const randomFieldName = randomString();
    const firstName = randomString();
    const lastName = randomString();
    const email = randomEmail();
    const password = randomString();
    let customFieldId: string;

    before(() => {
      cy.apiCreateCustomField(randomFieldName, true, true).then((response) => {
        customFieldId = response.body.data.id;
        cy.apiSignup(firstName, lastName, email, password);
        cy.setLoginCookie(email, password);
        cy.goToLandingPage();
      });
    });

    it('successfully completes the sign-up process', () => {
      cy.get('#e2e-signup-custom-fields-container');
      cy.get('#e2e-signup-custom-fields-skip-btn').should('not.exist');
      cy.get(`#root_${randomFieldName}`).type('test');
      cy.get('#e2e-signup-custom-fields-submit-btn').click();
      cy.get('#e2e-signup-success-container', { timeout: 20000 });
      cy.get('.e2e-signup-success-close-button').click();
      cy.get('#e2e-sign-up-in-modal').should('not.exist');
    });

    after(() => {
      cy.apiRemoveCustomField(customFieldId);
    });
  });
});
