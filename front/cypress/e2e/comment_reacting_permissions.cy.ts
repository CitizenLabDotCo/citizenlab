import { randomString, randomEmail } from '../support/commands';

describe('Comment reacting permissions for active users', () => {
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
    // create users
    cy.apiSignup(
      verifiedFirstName,
      verifiedLastName,
      verifiedEmail,
      verifiedPassword
    ).then((response) => {
      verifiedId = response.body.data.id;
    });
    cy.apiSignup(
      unverifiedFirstName,
      unverifiedLastName,
      unverifiedEmail,
      unverifiedPassword
    ).then((response) => {
      unverifiedId = response.body.data.id;
    });
    // verify the verified user
    cy.apiLogin(verifiedEmail, verifiedPassword).then((response) => {
      cy.apiVerifyBogus(response.body.jwt);
    });
  });

  describe('a project that requires verification on comment reacting', () => {
    it('lets verified users reaction', () => {
      cy.setLoginCookie(verifiedEmail, verifiedPassword);
      cy.visit('ideas/verified-idea');
      cy.get('.e2e-comment-reaction').click();
      cy.get('.e2e-comment-reaction.reacted');
    });

    it("doesn't let unverified users reaction", () => {
      cy.setLoginCookie(unverifiedEmail, unverifiedPassword);
      cy.visit('ideas/verified-idea');
      cy.wait(1000);
      cy.get('.e2e-comment-reaction').click();
      cy.get('#e2e-verification-wizard-root').should('exist');
    });
  });

  after(() => {
    cy.apiRemoveUser(verifiedId);
    cy.apiRemoveUser(unverifiedId);
  });
});

describe('Comment reacting permissions for non-active users', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  const randomFieldName = randomString();
  let userId: string;
  let customFieldId: string;

  before(() => {
    // create user
    cy.apiCreateCustomField(randomFieldName, false).then((response) => {
      customFieldId = response.body.data.id;
      cy.apiSignup(firstName, lastName, email, password).then((response) => {
        userId = response.body.data.id;
      });
      cy.setLoginCookie(email, password);
    });
  });

  it("doesn't let non-active users reaction", () => {
    cy.setLoginCookie(email, password);
    cy.visit('ideas/verified-idea');
    cy.get('.e2e-comment-reaction').click();
    cy.get('#e2e-authentication-modal').should('exist');
  });

  after(() => {
    cy.apiRemoveUser(userId);
    cy.apiRemoveCustomField(customFieldId);
  });
});
