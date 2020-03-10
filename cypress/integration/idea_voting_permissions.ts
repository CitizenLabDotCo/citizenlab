import { randomString, randomEmail } from '../support/commands';

describe('Idea voting permissions', () => {

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

  describe('a project that requires verification on votes', () => {
    const firstName = randomString();
    const lastName = randomString();
    const email = randomEmail();
    const password = randomString();

    it('sends unsigned user to log-in then verify', () => {
      cy.visit('projects/verified-ideation/ideas');
      cy.location('pathname').should('eq', '/en-GB/projects/verified-ideation/ideas');
      cy.get('#e2e-project-ideas-page');
      cy.get('#e2e-ideas-container');
      cy.get('.e2e-ideacard-upvote-button').click();
      cy.get('.e2e-sign-up-page');
      cy.get('.e2e-sign-up-container');
      cy.get('#firstName').type(firstName);
      cy.get('#lastName').type(lastName);
      cy.get('#email').type(email);
      cy.get('#password').type(password);
      cy.get('.e2e-terms-and-conditions .e2e-checkbox').click();
      cy.get('.e2e-privacy-checkbox .e2e-checkbox').click().should('have.class', 'checked');
      cy.get('.e2e-email-checkbox .e2e-checkbox').click().should('have.class', 'checked');
      cy.get('#e2e-signup-step1-button').click();
      cy.get('#e2e-verification-methods');
      cy.get('#e2e-verification-methods #e2e-bogus-button').click();
      cy.get('#e2e-verification-bogus-form');
      cy.get('#e2e-verification-bogus-submit-button').click();
      cy.location('pathname').should('eq', '/en-GB/projects/verified-ideation/ideas');
      cy.get('#e2e-project-ideas-page');
      cy.get('#e2e-ideas-container');
      cy.get('.e2e-programmtic-vote-success-modal');
    });

    it('sends unverified users to the verification flow', () => {
      cy.setLoginCookie(unverifiedEmail, unverifiedPassword);
      cy.visit('projects/verified-ideation/ideas');
      cy.get('.e2e-ideacard-upvote-button');
      cy.get('.e2e-ideacard-upvote-button').click();
      cy.get('.e2e-voting-disabled');
      cy.get('.e2e-voting-disabled button').click();
      cy.get('.e2e-verification-steps');
    });

    it('lets verified users vote', () => {
      cy.setLoginCookie(verifiedEmail, verifiedPassword);
      cy.visit('projects/verified-ideation/ideas');
      cy.get('.e2e-ideacard-upvote-button');
      cy.get('.e2e-ideacard-upvote-button').click();
      cy.get('.e2e-vote-controls.up');
    });
  });

  describe('a project that does not require verification', () => {
    const firstName = randomString();
    const lastName = randomString();
    const email = randomEmail();
    const password = randomString();

    it('sends unsigned user to log-in and not to verify', () => {
      cy.visit('projects/an-idea-bring-it-to-your-council/ideas');
      cy.acceptCookies();
      cy.get('.e2e-ideacard-upvote-button').first().click();
      cy.get('.e2e-register-button').click();
      cy.get('.e2e-sign-up-container');
      cy.get('#firstName').type(firstName);
      cy.get('#lastName').type(lastName);
      cy.get('#email').type(email);
      cy.get('#password').type(password);
      cy.get('.e2e-terms-and-conditions .e2e-checkbox').click();
      cy.get('.e2e-privacy-checkbox .e2e-checkbox').click().should('have.class', 'checked');
      cy.get('.e2e-email-checkbox .e2e-checkbox').click().should('have.class', 'checked');
      cy.get('#e2e-signup-step1-button').click();
      cy.location('pathname').should('eq', '/en-GB/projects/an-idea-bring-it-to-your-council/ideas');
      cy.get('#e2e-project-ideas-page');
      cy.get('#e2e-ideas-container');
      cy.get('.e2e-ideacard-upvote-button');
      cy.get('.e2e-verification-steps').should('not.exist');
    });
  });

  after(() => {
    cy.apiRemoveUser(verifiedId);
    cy.apiRemoveUser(unverifiedId);
  });
});
