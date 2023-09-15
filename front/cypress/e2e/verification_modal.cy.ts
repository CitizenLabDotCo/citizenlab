import { randomString, randomEmail } from '../support/commands';

describe('Verification modal', () => {
  describe('shows the additional rules', () => {
    const firstName = randomString();
    const lastName = randomString();
    const email = randomEmail();
    const password = randomString();
    let userId: string;

    describe('verifies a user', () => {
      beforeEach(() => {
        cy.apiSignup(firstName, lastName, email, password)
          .then((user) => {
            userId = user.body.data.id;
          })
          .then(() => {
            cy.setLoginCookie(email, password);
            cy.visit('/profile/edit');
            cy.get('#e2e-user-edit-profile-page').should('exist');
            cy.acceptCookies();
          });
      });

      afterEach(() => {
        cy.apiRemoveUser(userId);
      });

      it('shows the verification modal and successfully verifies the user', () => {
        cy.get('#e2e-verify-user-button').should('exist');
        cy.get('#e2e-verify-user-button').click();
        cy.get('#e2e-verification-wizard-method-selection-step');
        cy.get(
          '#e2e-verification-wizard-method-selection-step #e2e-bogus-button'
        ).click();
        cy.get('#e2e-verification-bogus-form');
        cy.get('#e2e-verification-bogus-submit-button').click();
        cy.get('#e2e-verification-success');
        cy.get('#e2e-verification-success-close-button').click();
        cy.get('#e2e-user-edit-profile-page');
        cy.get('.e2e-verified');
        cy.get('#e2e-user-menu-container.e2e-verified');
      });
    });
  });

  describe('Participation with group conditions', () => {
    it('lets you participate if you meet group conditions', () => {
      cy.visit('/projects/verified-charlie-poeple-project');
      cy.get('#e2e-idea-button').should('exist');
      cy.get('#e2e-idea-button').click({ force: true });

      // email/password sign up step
      cy.get('#e2e-sign-up-email-password-container');
      const firstName = randomString();
      const lastName = randomString();
      const email = `charlie@${randomString()}.com`;
      const password = randomString();

      cy.get('#firstName').type(firstName);
      cy.get('#lastName').type(lastName);
      cy.get('#email').type(email);
      cy.get('#password').type(password);
      cy.get('#termsAndConditionsAccepted .e2e-checkbox')
        .click()
        .should('have.class', 'checked');
      cy.get('#privacyPolicyAccepted .e2e-checkbox')
        .click()
        .should('have.class', 'checked');
      cy.get('#e2e-signup-password-submit-button').wait(500).click().wait(500);

      // email confirmation step
      cy.get('#code').should('exist');
      cy.get('#code').click().type('1234');
      cy.get('#e2e-verify-email-button').click();

      // verification step: fill out bogus
      cy.get(
        '#e2e-verification-wizard-method-selection-step #e2e-bogus-button'
      ).click();
      cy.get('#e2e-verification-bogus-form');
      cy.get('#e2e-verification-bogus-submit-button').click();

      // continue in success step
      cy.get('#e2e-success-continue-button').click();

      // we should now be redirected to idea form
      cy.location('pathname').should(
        'eq',
        `/en/projects/verified-charlie-poeple-project/ideas/new`
      );
      cy.logout();
    });

    it('does not let you participate if you do not meet group conditions', () => {
      cy.visit('/projects/verified-charlie-poeple-project');
      cy.get('#e2e-idea-button').should('exist');
      cy.get('#e2e-idea-button').click({ force: true });

      // email/password sign up step
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
        .click()
        .should('have.class', 'checked');
      cy.get('#e2e-signup-password-submit-button').wait(500).click().wait(500);

      // email confirmation step
      cy.get('#code').should('exist');
      cy.get('#code').click().type('1234');
      cy.get('#e2e-verify-email-button').click();

      // verification step: fill out bogus
      cy.get(
        '#e2e-verification-wizard-method-selection-step #e2e-bogus-button'
      ).click();
      cy.get('#e2e-verification-bogus-form');
      cy.get('#e2e-verification-bogus-submit-button').click();

      // we should now NOT be redirected to idea form
      cy.location('pathname').should(
        'eq',
        `/en/projects/verified-charlie-poeple-project`
      );

      // button should now be disabled
      cy.get('#e2e-idea-button > button').should('exist');
      cy.get('#e2e-idea-button > button').should('be.disabled');
    });
  });
});
