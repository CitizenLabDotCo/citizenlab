import { randomString, randomEmail } from '../support/commands';

describe('', () => {
  const firstName = randomString();
  const lastName = randomString();
  const peasantEmail = randomEmail();
  const peasantPassword = randomString();
  let userId: string;

  before(() => {
    cy.apiSignup(firstName, lastName, peasantEmail, peasantPassword).then(
      (response) => {
        userId = response.body.data.id;
      }
    );
    cy.setLoginCookie(peasantEmail, peasantPassword);
    cy.visit('/profile/edit');
    cy.acceptCookies();
  });

  it('show not verified status box, goes through the verification flow and allows you to reverify afterwards', () => {
    cy.get('.e2e-not-verified');
    cy.get('#e2e-verify-user-button').click();
    cy.get(
      '#e2e-verification-wizard-method-selection-step #e2e-bogus-button'
    ).click();
    cy.get('#e2e-verification-bogus-submit-button').click();
    cy.get('#e2e-verification-success');
    cy.get('#e2e-verification-success-close-button').click();
    cy.reload();
    cy.get('.e2e-reverify-user-button').click();
    cy.get('#e2e-verification-wizard-root');
  });

  after(() => {
    cy.apiRemoveUser(userId);
  });
});
