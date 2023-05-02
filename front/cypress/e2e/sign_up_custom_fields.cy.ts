import { randomString, randomEmail, logout } from '../support/commands';

describe('Sign up - custom fields step', () => {
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

    after(() => {
      logout();
    });

    it('does not show it when no custom fields are enabled', () => {
      cy.get('#e2e-sign-up-in-modal').should('not.exist');
    });
  });

  describe('Optional custom field', () => {
    const randomFieldName = randomString();
    let customFieldId: string;

    before(() => {
      cy.apiCreateCustomField(randomFieldName, true, false).then((response) => {
        customFieldId = response.body.data.id;
      });
    });

    it('shows the custom field step and can skip it', () => {
      cy.goToLandingPage();
      cy.get('#e2e-navbar-signup-menu-item').click();
      cy.get('#e2e-sign-up-email-password-container');

      const firstName = randomString();
      const lastName = randomString();
      const email = randomEmail();
      const password = randomString();

      cy.get('#firstName').type(firstName);
      cy.get('#lastName').type(lastName);
      cy.get('#email').type(email);
      cy.get('#password').type(password);
      cy.get('#termsAndConditionsAccepted .e2e-checkbox')
        .click()
        .should('have.class', 'checked');
      cy.get('#privacyPolicyAccepted .e2e-checkbox')
        .wait(500)
        .click()
        .wait(500)
        .should('have.class', 'checked');
      cy.get('#e2e-signup-password-submit-button').wait(500).click().wait(500);

      cy.get('#code').should('exist');
      cy.get('#code').click().type('1234');
      cy.get('#e2e-verify-email-button').click();

      cy.get('#e2e-signup-custom-fields-container');
      cy.get('#e2e-signup-custom-fields-skip-btn').click();
      cy.get('#e2e-sign-up-success-modal').should('exist');
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
        cy.get('#e2e-user-menu-dropdown-button').click({ force: true });
        cy.get('#e2e-complete-registration-link').click({ force: true });
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
});
