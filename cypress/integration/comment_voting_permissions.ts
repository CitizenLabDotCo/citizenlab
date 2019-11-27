import { randomString, randomEmail } from '../support/commands';

describe('Comment voting permissions', () => {

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
  describe('a project that requires verification on comment voting', () => {
    it('lets verified users vote', () => {
      cy.setLoginCookie(verifiedEmail, verifiedPassword);
      cy.visit('ideas/verified-idea');
      cy.acceptCookies();
      cy.wait(3000);
      cy.get('.e2e-comments-loaded');
      cy.get('.e2e-comment-vote');
      cy.get('.e2e-comment-vote').click();
      cy.wait(3000);
      cy.get('.e2e-comment-vote').should('have.class', 'voted');
    });
    it('doesn\'t let unverified users vote', () => {
      cy.setLoginCookie(unverifiedEmail, unverifiedPassword);
      cy.visit('ideas/verified-idea');
      cy.acceptCookies();
      cy.wait(3000);
      cy.get('.e2e-comments-loaded');
      cy.get('#e2e-parent-and-childcomments');
      cy.get('.e2e-comment-vote');
      cy.get('.e2e-comment-vote').should('have.class', 'disabled');
    });
  });
  after(() => {
    cy.apiRemoveUser(verifiedId);
    cy.apiRemoveUser(unverifiedId);
  });
});
