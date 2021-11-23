import { randomString, randomEmail } from '../support/commands';

// OS-133
describe('Idea voting permissions', () => {
  describe('a project that requires verification to vote', () => {
    it('sends non-registred user to sign up, verifies the user and votes successfully', () => {
      const firstName = randomString();
      const lastName = randomString();
      const email = randomEmail();
      const password = randomString();

      // try to vote while not signed in
      cy.visit('projects/verified-ideation');
      cy.location('pathname').should('eq', '/en/projects/verified-ideation');
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
      cy.get('#e2e-signup-password-submit-button').click();

      // enter confirmation code
      cy.get('#e2e-confirmation-code-input').type('1234');
      cy.get('#e2e-confirmation-button').click();

      // verification step check
      cy.get(
        '#e2e-verification-wizard-method-selection-step #e2e-bogus-button'
      ).click();
      cy.get('#e2e-verification-bogus-submit-button').click();

      // success check
      cy.get('#e2e-signup-success-container', { timeout: 20000 });
      cy.get(
        '#e2e-signup-success-container .e2e-signup-success-close-button'
      ).click();
      cy.get('#e2e-sign-up-in-modal').should('not.exist');
      cy.get('#e2e-user-menu-container.e2e-verified');
      cy.get('.e2e-ideacard-upvote-button.enabled');
    });
  });

  describe('a project that requires verification to vote', () => {
    let unverifiedId: string;

    before(() => {
      const unverifiedFirstName = randomString();
      const unverifiedLastName = randomString();
      const unverifiedEmail = randomEmail();
      const unverifiedPassword = randomString();

      cy.apiSignup(
        unverifiedFirstName,
        unverifiedLastName,
        unverifiedEmail,
        unverifiedPassword
      ).then((response) => {
        unverifiedId = response.body.data.id;
        cy.setLoginCookie(unverifiedEmail, unverifiedPassword);
      });
    });

    it('sends unverified users to the verification flow', () => {
      cy.visit('projects/verified-ideation');
      cy.get('#e2e-ideas-container');
      cy.wait(1000);
      cy.get('.e2e-ideacard-upvote-button').click();
      cy.get('#e2e-verification-wizard-root');
    });

    after(() => {
      cy.apiRemoveUser(unverifiedId);
    });
  });

  describe('a project that requires verification to vote', () => {
    let verifiedId: string;

    before(() => {
      const verifiedFirstName = randomString();
      const verifiedLastName = randomString();
      const verifiedEmail = randomEmail();
      const verifiedPassword = randomString();

      cy.apiSignup(
        verifiedFirstName,
        verifiedLastName,
        verifiedEmail,
        verifiedPassword
      )
        .then((response) => {
          verifiedId = response.body.data.id;
          return cy.apiLogin(verifiedEmail, verifiedPassword);
        })
        .then((response) => {
          return cy.apiVerifyBogus(response.body.jwt);
        })
        .then(() => {
          cy.setLoginCookie(verifiedEmail, verifiedPassword);
        });
    });

    it('lets verified users vote', () => {
      cy.visit('projects/verified-ideation');
      cy.get('#e2e-ideas-container');
      cy.wait(1000);
      cy.get('.e2e-ideacard-upvote-button').click();
      cy.get('.e2e-vote-controls.up');
    });

    after(() => {
      cy.apiRemoveUser(verifiedId);
    });
  });

  describe('a project that does not require verification', () => {
    it("sends signed out user to log in and doesn't ask for verification", () => {
      const firstName = randomString();
      const lastName = randomString();
      const email = randomEmail();
      const password = randomString();

      // Go to an idea of a project that doesn't require verification
      // and try to vote
      cy.visit('ideas/very-old-idea');
      cy.get('.e2e-ideacard-upvote-button').click();

      // Sign up flow
      cy.get('#e2e-sign-up-container');
      cy.get('#firstName').type(firstName);
      cy.get('#lastName').type(lastName);
      cy.get('#email').type(email);
      cy.get('#password').type(password);
      cy.get('.e2e-terms-and-conditions .e2e-checkbox').click();
      cy.get('.e2e-privacy-checkbox .e2e-checkbox').click();
      cy.get('#e2e-signup-password-submit-button').click();

      // enter confirmation code
      cy.get('#e2e-confirmation-code-input').type('1234');
      cy.get('#e2e-confirmation-button').click();

      // verification step check
      cy.get(
        '#e2e-verification-wizard-method-selection-step #e2e-bogus-button'
      ).click();
      cy.get('#e2e-verification-bogus-submit-button').click();

      // success check
      cy.get('#e2e-signup-success-container', { timeout: 20000 });
      cy.wait(2000);
      cy.get(
        '#e2e-signup-success-container .e2e-signup-success-close-button'
      ).click();
      cy.wait(2000);
      cy.get('#e2e-sign-up-in-modal').should('not.exist');
      cy.get('#e2e-user-menu-container');
      cy.get('.e2e-ideacard-upvote-button')
        .first()
        .should('have.class', 'enabled');
    });
  });
});
