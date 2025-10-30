import { randomEmail, randomString } from './commands';

export const signUpEmailConformation = (
  cy: Cypress.Chainable,
  email: string = randomEmail()
) => {
  // Enter email
  cy.dataCy('email-flow-start').get('input[type="email"]').type(email);
  cy.dataCy('email-flow-start-continue-button').click();

  // Accept terms and privacy policy
  cy.get('[data-testid="termsAndConditionsAccepted"] .e2e-checkbox')
    .click()
    .should('have.class', 'checked');
  cy.get('[data-testid="privacyPolicyAccepted"] .e2e-checkbox')
    .click()
    .should('have.class', 'checked');
  cy.get('#e2e-policies-continue').click();

  // Confirm email
  cy.get('#code').should('exist');
  cy.get('#code').click().type('1234');
  cy.get('#e2e-verify-email-button > button').click({ force: true });
};

export const enterUserInfo = (
  cy: Cypress.Chainable,
  {
    firstName = randomString(),
    lastName = randomString(),
    password = randomString(),
  } = {}
) => {
  cy.get('#firstName').type(firstName);
  cy.get('#lastName').type(lastName);
  cy.get('#password').type(password);

  cy.get('#e2e-built-in-fields-submit-button > button').click({ force: true });
};

export const logIn = (
  cy: Cypress.Chainable,
  email: string,
  password: string
) => {
  // Enter email
  cy.dataCy('email-flow-start').get('input[type="email"]').type(email);
  cy.dataCy('email-flow-start-continue-button').click();

  // Enter password
  cy.get('#e2e-password-input').type(password);
  cy.get('#e2e-password-submit');
};
