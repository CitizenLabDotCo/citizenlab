import { randomString, randomEmail } from '../support/commands';

describe('Idea budgeting permissions test 1', () => {
  const unverifiedFirstName = randomString();
  const unverifiedLastName = randomString();
  const unverifiedEmail = randomEmail();
  const unverifiedPassword = randomString();
  let unverifiedId: string;

  before(() => {
    // create users
    cy.apiSignup(
      unverifiedFirstName,
      unverifiedLastName,
      unverifiedEmail,
      unverifiedPassword
    ).then((response) => {
      unverifiedId = response.body.data.id;
    });
    cy.apiLogin(unverifiedEmail, unverifiedPassword);
  });

  it('sends unverified users to the verification flow', () => {
    cy.setLoginCookie(unverifiedEmail, unverifiedPassword);
    cy.visit('projects/verified-participatory-budgeting');
    cy.get('#e2e-ideas-container');
    cy.acceptCookies();
    cy.wait(1000);
    cy.get('.e2e-idea-card').first().as('ideaCard');
    cy.get('@ideaCard').find('.e2e-assign-budget-button').click();
    cy.get('#e2e-verification-wizard-root');
  });

  after(() => {
    cy.apiRemoveUser(unverifiedId);
  });
});

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
    });
    // verify the verified user
    cy.apiLogin(verifiedEmail, verifiedPassword).then((response) => {
      cy.apiVerifyBogus(response.body.jwt);
    });
  });

  it('lets verified users add a budget to their expenses', () => {
    cy.setLoginCookie(verifiedEmail, verifiedPassword);
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
