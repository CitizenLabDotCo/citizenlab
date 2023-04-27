import { randomString, randomEmail } from '../support/commands';

describe('Idea posting permissions', () => {
  const unverifiedFirstName = randomString();
  const unverifiedLastName = randomString();
  const unverifiedEmail = randomEmail();
  const unverifiedPassword = randomString();
  let unverifiedId: string;

  const verifiedFirstName = randomString();
  const verifiedLastName = randomString();
  const verifiedEmail = randomEmail();
  const verifiedPassword = randomString();
  let verifiedId: string;

  before(() => {
    // create verified user
    cy.apiSignup(
      verifiedFirstName,
      verifiedLastName,
      verifiedEmail,
      verifiedPassword
    )
      .then((response) => {
        verifiedId = response.body.data.id;
        // create unverified user
        return cy.apiSignup(
          unverifiedFirstName,
          unverifiedLastName,
          unverifiedEmail,
          unverifiedPassword
        );
      })
      .then((response) => {
        unverifiedId = response.body.data.id;
        return cy.apiLogin(verifiedEmail, verifiedPassword);
      })
      .then((response) => {
        cy.apiVerifyBogus(response.body.jwt);
      });
  });

  describe('a project that requires verification', () => {
    it('sends unverified users to the signup flow', () => {
      cy.setLoginCookie(unverifiedEmail, unverifiedPassword);
      cy.visit('projects/verified-ideation');
      cy.acceptCookies();
      cy.get('#e2e-idea-button').first().click();
      cy.get('#e2e-authentication-modal').should('exist');
    });

    it('lets verified users post', () => {
      cy.setLoginCookie(verifiedEmail, verifiedPassword);
      cy.visit('projects/verified-ideation');
      cy.acceptCookies();
      cy.get('#e2e-idea-button').first().click();
      cy.get('#e2e-idea-new-page').should('exist');
    });
  });

  after(() => {
    cy.apiRemoveUser(verifiedId);
    cy.apiRemoveUser(unverifiedId);
  });
});

describe('idea posting permissions for non-active users', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  const randomFieldName = randomString();
  let userId: string;
  let customFieldId: string;

  before(() => {
    // create user
    cy.apiCreateCustomField(randomFieldName, true, false).then((response) => {
      customFieldId = response.body.data.id;
      cy.apiSignup(firstName, lastName, email, password).then((response) => {
        userId = response.body.data.id;
      });
      cy.setLoginCookie(email, password);
    });
  });

  it("doesn't let non-active users comment", () => {
    cy.setLoginCookie(email, password);
    cy.visit('projects/verified-ideation');
    cy.acceptCookies();
    cy.get('.e2e-idea-button:visible').first().click();
    cy.get('#e2e-authentication-modal').should('exist');
  });

  after(() => {
    cy.apiRemoveUser(userId);
    cy.apiRemoveCustomField(customFieldId);
  });
});
