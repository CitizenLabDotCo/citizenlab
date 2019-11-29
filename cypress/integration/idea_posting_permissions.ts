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
    // create users
    cy.apiSignup(verifiedFirstName, verifiedLastName, verifiedEmail, verifiedPassword).then(response => {
      verifiedId = response.body.data.id;
    });
    cy.apiSignup(unverifiedFirstName, unverifiedLastName, unverifiedEmail, unverifiedPassword).then(response => {
      unverifiedId = response.body.data.id;
    });
    // verify the verified user
    cy.apiLogin(verifiedEmail, verifiedPassword).then(response => {
      cy.apiVerifyBogus(response.body.jwt);
    });
  });
  describe('a project that requires verification', () => {
    it('sends unverified users to the verification flow', () => {
      cy.setLoginCookie(unverifiedEmail, unverifiedPassword);
      cy.visit('projects/verified-ideation/info');
      cy.acceptCookies();
      cy.get('.e2e-idea-button:visible');
      cy.get('.e2e-idea-button:visible').should('have.class', 'disabled');
      cy.get('.e2e-idea-button:visible').should('have.class', 'notVerified');
      cy.get('.e2e-idea-button:visible').click();
      cy.get('.e2e-disabled-tooltip').find('a').click();
      cy.get('.e2e-verification-modal');
    });
    it('lets verified users post', () => {
      cy.setLoginCookie(verifiedEmail, verifiedPassword);
      cy.visit('projects/verified-ideation/info');
      cy.acceptCookies();
      cy.get('.e2e-idea-button:visible').click();
      cy.get('#e2e-new-idea-form');
    });
  });
  after(() => {
    cy.apiRemoveUser(verifiedId);
    cy.apiRemoveUser(unverifiedId);
  });
});
