import { signUpEmailConformation, enterUserInfo } from '../../support/auth';
import { randomString, randomEmail } from '../../support/commands';

describe('Sign up - custom fields step', () => {
  describe('Optional custom field', () => {
    const randomFieldName = randomString();
    let customFieldId: string;

    before(() => {
      cy.apiCreateCustomField(randomFieldName, false).then((response) => {
        customFieldId = response.body.data.id;
      });
    });

    it('shows the custom field step and can skip it', () => {
      cy.goToLandingPage();
      cy.get('#e2e-navbar-login-menu-item').click();
      signUpEmailConformation(cy);
      enterUserInfo(cy);

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
    let customFieldName: string;

    before(() => {
      cy.apiCreateCustomField(randomFieldName, true).then((response) => {
        customFieldId = response.body.data.id;
        customFieldName = response.body.data.attributes.title_multiloc.en;
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
        `The field "${customFieldName}" is required`
      );
    });

    after(() => {
      cy.apiRemoveCustomField(customFieldId);
    });
  });
});
