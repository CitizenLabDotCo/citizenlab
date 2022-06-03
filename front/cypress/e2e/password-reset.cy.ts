import { randomEmail } from '../support/commands';

const someEmail = randomEmail();

const tryReset = (email: string) => {
  cy.get('#email').type(email);
  cy.get('.e2e-submit-reset').find('button').click();
};

describe('profile deletion', () => {
  beforeEach(() => {
    cy.visit('/en/password-recovery');
    cy.acceptCookies();
  });
  it("prints an error if the email doesn't exist", () => {
    tryReset(someEmail);
    cy.get('.e2e-input-error').should('exist');
    cy.get('.e2e-success-reset').should('not.exist');
  });
  it('is successful if the email does exist', () => {
    tryReset('admin@citizenlab.co');
    cy.get('.e2e-input-error').should('not.exist');
    cy.get('.e2e-success-reset').should('exist');
  });
});
