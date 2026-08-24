import { randomEmail, randomPhoneNumber, randomString } from './commands';

export const enterEmail = (
  cy: Cypress.Chainable,
  email: string = randomEmail()
) => {
  cy.get('#e2e-authentication-modal').get('input[type="email"]').type(email);
  cy.dataCy('email-flow-start-continue-button').click();
};

// Identifies the user with a phone number instead of an email address on the
// first step of the flow. Only available when the sms feature is enabled.
//
// The phone field keeps the calling code out of the input (see PhoneInput), so
// the country has to be picked from the dropdown and only the national part of
// the number is typed. randomPhoneNumber() returns a US number, hence 'us'.
export const enterPhone = (
  cy: Cypress.Chainable,
  phone: string = randomPhoneNumber().national
) => {
  cy.dataCy('flow-start-toggle-identifier').click();

  if (phone.startsWith('+1')) {
    cy.dataCy('phone-flow-start-phone-input')
      .find('.iti__selected-country')
      .click();
    cy.get('.iti__search-input').type('United States');
    cy.get('li.iti__country[data-iso2="us"]').click({ force: true });

    cy.get('input#phone').should('have.attr', 'placeholder');
    cy.get('input#phone').type(phone.replace('+1', ''));
  } else {
    cy.get('input#phone').should('have.attr', 'placeholder');
    cy.get('input#phone').type(phone);
  }

  cy.dataCy('phone-flow-start-continue-button').click({ force: true });
};

export const acceptPolicies = (cy: Cypress.Chainable) => {
  cy.get('[data-testid="termsAndConditionsAccepted"] .e2e-checkbox')
    .click()
    .should('have.class', 'checked');
  cy.get('[data-testid="privacyPolicyAccepted"] .e2e-checkbox')
    .click()
    .should('have.class', 'checked');
  cy.get('#e2e-policies-continue').click();
};

export const confirmEmail = (cy: Cypress.Chainable) => {
  cy.get('#code').should('exist');
  cy.get('#code').click().type('123456');
  // The confirmation request can outlive the default 15s element timeout on
  // a loaded backend, leaving the next auth step (built-in fields form) to
  // time out while the button still spins — so await the response itself.
  // The request fires on click, so only the response needs the long leash.
  cy.intercept('POST', '**/user/confirm_code_*').as('confirmCode');
  cy.get('#e2e-verify-email-button > button').click({ force: true });
  cy.wait('@confirmCode', { responseTimeout: 60000 });
};

export const confirmPhone = (cy: Cypress.Chainable) => {
  cy.dataCy('phone-code-input').find('input').type('123456');
  cy.dataCy('phone-confirm-button').click();
};

export const signUp = (
  cy: Cypress.Chainable,
  email: string = randomEmail()
) => {
  enterEmail(cy, email);
  acceptPolicies(cy);
};

export const signUpEmailConformation = (
  cy: Cypress.Chainable,
  email: string = randomEmail()
) => {
  signUp(cy, email);
  confirmEmail(cy);
};

// The phone mirror of signUpEmailConformation: identify with a phone number,
// accept the policies (which creates the account) and confirm the code.
export const signUpPhoneConfirmation = (
  cy: Cypress.Chainable,
  phone: string = randomPhoneNumber().national
) => {
  enterPhone(cy, phone);
  acceptPolicies(cy);
  confirmPhone(cy);
};

export const enterUserInfo = (
  cy: Cypress.Chainable,
  {
    firstName = randomString(),
    lastName = randomString(),
    password = randomString(),
  } = {}
) => {
  // The built-in-fields form is gated by two sequential requests: the
  // confirmation POST, and the permissions-requirements GET that decides which
  // step comes next. The verify button stays in its processing state for both,
  // so awaiting the POST alone is not enough. On a loaded backend the pair can
  // outlast the default 15s command timeout, hence the longer leash on the
  // first field of the form.
  cy.get('#firstName', { timeout: 60000 }).type(firstName);
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

  enterPassword(cy, password);
};

// The phone mirror of logIn.
export const logInWithPhone = (
  cy: Cypress.Chainable,
  phone: string,
  password: string
) => {
  enterPhone(cy, phone);
  enterPassword(cy, password);
};

export const enterPassword = (cy: Cypress.Chainable, password: string) => {
  cy.get('#e2e-password-input').type(password);
  cy.get('#e2e-password-submit > button').click({ force: true });
};
