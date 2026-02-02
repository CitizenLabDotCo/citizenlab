import { randomString, randomEmail } from '../support/commands';

describe('Idea budgeting permissions test with non active users', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  const randomFieldName = randomString();
  let userId: string;
  let customFieldId: string;

  before(() => {
    cy.apiCreateCustomField(randomFieldName, false).then((response) => {
      customFieldId = response.body.data.id;
      cy.apiSignup(firstName, lastName, email, password).then((response) => {
        userId = response.body.data.id;
      });
      cy.setLoginCookie(email, password);
    });
  });

  it('sends non-active users to the registration flow', () => {
    cy.visit('projects/verified-participatory-budgeting');
    cy.get('#e2e-ideas-container');

    cy.wait(1000);
    cy.get('.e2e-idea-card').first().as('ideaCard');
    cy.get('@ideaCard').find('.e2e-assign-budget-button').click();
    cy.get('#e2e-authentication-modal').should('exist');
  });

  after(() => {
    cy.apiRemoveUser(userId);
    cy.apiRemoveCustomField(customFieldId);
  });
});

describe('Idea budgeting permissions test with non verified users', () => {
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

    cy.wait(1000);
    cy.get('.e2e-idea-card').first().as('ideaCard');
    cy.get('@ideaCard').find('.e2e-assign-budget-button').click();
    cy.get('#e2e-verification-wizard-root');
  });

  after(() => {
    cy.apiRemoveUser(unverifiedId);
  });
});

describe('Idea budgeting permissions test with verified users', () => {
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

    cy.wait(1000);
    cy.get('#e2e-ideas-container')
      .find('.e2e-assign-budget-button')
      .first()
      .should('have.class', 'not-in-basket');
    cy.get('#e2e-ideas-container')
      .find('.e2e-assign-budget-button')
      .first()
      .click();
    cy.wait(2000);
    cy.get('#e2e-ideas-container')
      .find('.e2e-assign-budget-button')
      .first()
      .should('have.class', 'in-basket');
  });

  after(() => {
    cy.apiRemoveUser(verifiedId);
  });
});
