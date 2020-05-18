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

  describe('a project that requires verification to vote', () => {
    const firstName = randomString();
    const lastName = randomString();
    const email = randomEmail();
    const password = randomString();

    it('sends non-registred user to sign up, verifies the user and votes successfully', () => {
      // try to vote while not signed in
      cy.visit('projects/verified-ideation/ideas');
      cy.location('pathname').should('eq', '/en-GB/projects/verified-ideation/ideas');
      cy.get('#e2e-project-ideas-page');
      cy.get('#e2e-ideas-container');
      cy.wait(1000);
      cy.get('.e2e-ideacard-upvote-button').click();

      // sign up modal check
      cy.get('#e2e-sign-up-container');
      cy.get('#firstName').type(firstName);
      cy.get('#lastName').type(lastName);
      cy.get('#email').type(email);
      cy.get('#password').type(password);
      cy.get('.e2e-terms-and-conditions .e2e-checkbox').click();
      cy.get('.e2e-privacy-checkbox .e2e-checkbox').click();
      cy.get('#e2e-signup-password-button').click();

      // verification step check
      cy.get('#e2e-verification-wizard-method-selection-step #e2e-bogus-button').click();
      cy.get('#e2e-verification-bogus-submit-button').click();

      // success check
      cy.get('#e2e-signup-success-container');
      cy.get('#e2e-signup-success-container .e2e-signup-success-close-button').click();
      cy.get('#e2e-sign-up-in-modal').should('not.exist');
      cy.get('#e2e-user-menu-container.e2e-verified');
      cy.get('.e2e-ideacard-upvote-button.active');
    });

    it('sends unverified users to the verification flow', () => {
      cy.setLoginCookie(unverifiedEmail, unverifiedPassword);
      cy.visit('projects/verified-ideation/ideas');
      cy.get('#e2e-ideas-container');
      cy.wait(1000);
      cy.get('.e2e-ideacard-upvote-button').click();
      cy.get('#e2e-verification-wizard-root');
    });

    it('lets verified users vote', () => {
      cy.setLoginCookie(verifiedEmail, verifiedPassword);
      cy.visit('projects/verified-ideation/ideas');
      cy.get('#e2e-ideas-container');
      cy.wait(1000);
      cy.get('.e2e-ideacard-upvote-button').click();
      cy.get('.e2e-vote-controls.up');
    });
  });

  describe('a project that does not require verification', () => {
    const firstName = randomString();
    const lastName = randomString();
    const email = randomEmail();
    const password = randomString();

    it('sends signed out user to log in and doesn\'t ask for verification', () => {
      // Try to vote
      cy.visit('projects/an-idea-bring-it-to-your-council/ideas');
      cy.get('#e2e-ideas-container');
      cy.wait(1000);
      cy.get('.e2e-ideacard-upvote-button').first().click();

      // Sign up flow
      cy.get('#e2e-sign-up-container');
      cy.get('#firstName').type(firstName);
      cy.get('#lastName').type(lastName);
      cy.get('#email').type(email);
      cy.get('#password').type(password);
      cy.get('.e2e-terms-and-conditions .e2e-checkbox').click();
      cy.get('.e2e-privacy-checkbox .e2e-checkbox').click();
      cy.get('#e2e-signup-password-button').click();

      // success check
      cy.get('#e2e-signup-success-container .e2e-signup-success-close-button').click();
      cy.get('#e2e-sign-up-in-modal').should('not.exist');
      cy.get('#e2e-user-menu-container');
      cy.get('.e2e-ideacard-upvote-button').first().should('have.class', 'active');
    });
  });

  after(() => {
    cy.apiRemoveUser(verifiedId);
    cy.apiRemoveUser(unverifiedId);
  });
});
