import { randomString, randomEmail } from '../support/commands';

describe('Idea budgeting permissions test 2', () => {
  const verifiedFirstName = randomString();
  const verifiedLastName = randomString();
  const verifiedEmail = randomEmail();
  const verifiedPassword = randomString();
  let verifiedId: string;

  before(() => {
    // create users
    cy.apiSignup(
      verifiedFirstName,
      verifiedLastName,
      verifiedEmail,
      verifiedPassword
    ).then((response) => {
      verifiedId = response.body.data.id;
      cy.setLoginCookie(verifiedEmail, verifiedPassword);
    });
  });

  it('lets verified users add a budget to their expenses', () => {
    cy.visit('projects/verified-participatory-budgeting');
    cy.get('#e2e-ideas-container');
    cy.acceptCookies();
    cy.wait(1000);
    cy.get('.e2e-assign-budget')
      .first()
      .find('.e2e-assign-budget-button')
      .should('have.class', 'not-in-basket');
    cy.get('.e2e-assign-budget')
      .first()
      .find('.e2e-assign-budget-button')
      .click();
    cy.wait(2000);
    cy.get('.e2e-assign-budget')
      .first()
      .find('.e2e-assign-budget-button')
      .should('have.class', 'in-basket');
  });

  after(() => {
    cy.apiRemoveUser(verifiedId);
  });
});
