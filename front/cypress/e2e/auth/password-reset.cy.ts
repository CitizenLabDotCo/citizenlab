import { randomEmail } from '../../support/commands';

const someEmail = randomEmail();

const tryReset = (email: string) => {
  cy.get('#email').type(email);
  cy.get('.e2e-submit-reset').find('button').click();
};

describe('password reset', () => {
  beforeEach(() => {
    cy.visit('/en/password-recovery');
  });
  it("shows no error if email doesn't exist", () => {
    tryReset(someEmail);
    cy.get('.e2e-input-error').should('not.exist');
    cy.get('.e2e-success-reset').should('exist');
  });
  it('is successful if the email does exist', () => {
    tryReset('admin@govocal.com');
    cy.get('.e2e-input-error').should('not.exist');
    cy.get('.e2e-success-reset').should('exist');
  });
});
