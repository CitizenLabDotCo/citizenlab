import { randomString, randomEmail } from '../support/commands';

describe('Verification modal', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  let userId: string;
  const anotherfirstName = randomString();
  const anotherlastName = randomString();
  const anotheremail = randomEmail();
  const anotherpassword = randomString();
  let anotheruserId: string;

  before(() => {
    cy.apiSignup(firstName, lastName, email, password).then((user) => {
      userId = user.body.data.id;
    });
    cy.apiSignup(anotherfirstName, anotherlastName, anotheremail, anotherpassword).then((user) => {
      anotheruserId = user.body.data.id;
    });
  });

  describe('verifies a user', () => {
    beforeEach(() => {
      cy.setLoginCookie(email, password);
      cy.visit('/profile/edit');
      cy.wait(2000);
      cy.acceptCookies();
    });

    it('verifies the user using the bogus form', () => {
      cy.get('#e2e-user-edit-profile-page');
      cy.get('#e2e-verify-user-button').click();
      cy.get('#e2e-verification-wizard-method-selection-step');
      cy.get('#e2e-verification-wizard-method-selection-step #e2e-bogus-button').click();
      cy.get('#e2e-verification-bogus-form');
      cy.get('#e2e-verification-bogus-submit-button').click();
      cy.get('#e2e-verification-success');
      cy.get('.e2e-modal-close-button').click();
      cy.wait(1000);
      cy.get('#e2e-user-edit-profile-page');
      cy.get('.e2e-verified');
      cy.get('#e2e-user-menu-container.e2e-verified');
    });
  });

  describe('shows the additionnal rules', () => {
    beforeEach(() => {
      cy.setLoginCookie(anotheremail, anotherpassword);
      cy.visit('/projects/verified-charlie-poeple-project/info');
      cy.wait(2000);
      cy.acceptCookies();
    });

    it('verifies the user using the bogus form', () => {
      cy.get('.e2e-idea-button:visible').focus();
      cy.get('.e2e-disabled-tooltip').find('a').click();
      cy.get('.e2e-rule-item').should('have.length', 1);
      cy.get('.e2e-rule-item').contains('charlie');
    });
  });

  after(() => {
    cy.apiRemoveUser(userId);
  });

});
