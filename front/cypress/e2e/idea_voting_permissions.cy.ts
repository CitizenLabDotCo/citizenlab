import { enterUserInfo, signUpEmailConformation } from '../support/auth';
import { randomString, randomEmail } from '../support/commands';

// OS-133
describe('Idea reacting permissions', () => {
  describe('a project that requires verification to reaction', () => {
    it('sends non-registered user to sign up, verifies the user and reactions successfully', () => {
      // try to reaction while not signed in
      cy.visit('projects/verified-ideation');
      cy.location('pathname').should('eq', '/en/projects/verified-ideation');
      cy.get('#e2e-ideas-container');
      cy.wait(1000);
      cy.get('.e2e-ideacard-like-button').click({ force: true });

      // sign up modal
      signUpEmailConformation(cy);
      enterUserInfo(cy);

      // verification step check
      cy.get(
        '#e2e-verification-wizard-method-selection-step #e2e-bogus-button'
      ).should('exist');
      cy.get(
        '#e2e-verification-wizard-method-selection-step #e2e-bogus-button'
      ).click();
      cy.get('#e2e-verification-bogus-submit-button').click();

      // success check
      cy.get('#e2e-sign-up-success-modal', { timeout: 20000 });
      cy.wait(2000);
      cy.get('#e2e-success-continue-button').click();
      cy.get('#e2e-sign-up-in-modal').should('not.exist');
      cy.get('#e2e-user-menu-container.e2e-verified');
      cy.get('.e2e-ideacard-like-button.enabled');
    });
  });

  describe('a project that requires verification to reaction', () => {
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
      cy.get('.e2e-ideacard-like-button').click({ force: true });
      cy.get('#e2e-verification-wizard-root');
    });

    after(() => {
      cy.apiRemoveUser(unverifiedId);
    });
  });

  describe('a project that requires verification to reaction', () => {
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

    it('lets verified users reaction', () => {
      cy.visit('projects/verified-ideation');
      cy.get('#e2e-ideas-container');
      cy.wait(1000);
      cy.get('.e2e-ideacard-like-button').click();
      cy.get('.e2e-reaction-controls.up');
    });

    after(() => {
      cy.apiRemoveUser(verifiedId);
    });
  });

  describe('a project that does not require verification', () => {
    it("sends signed out user to log in and doesn't ask for verification", () => {
      // Go to an ideation project that doesn't require verification
      // and try to react
      cy.visit('/projects/an-idea-bring-it-to-your-council');
      cy.get('.e2e-ideacard-like-button').first().click();

      // Sign up flow
      signUpEmailConformation(cy);
      enterUserInfo(cy);

      // verification step check
      cy.get(
        '#e2e-verification-wizard-method-selection-step #e2e-bogus-button'
      ).should('not.exist');

      // success check
      cy.get('#e2e-sign-up-success-modal', { timeout: 20000 });
      cy.wait(2000);
      cy.get('#e2e-success-continue-button').click();
      cy.wait(2000);
      cy.get('#e2e-authentication-modal').should('not.exist');
      cy.get('#e2e-user-menu-container');
      cy.get('.e2e-ideacard-like-button')
        .first()
        .should('have.class', 'enabled');
    });
  });
});

describe('idea reacting permissions for non-active users', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  const randomFieldName = randomString();
  let userId: string;
  let customFieldId: string;

  before(() => {
    // create user
    cy.apiCreateCustomField(randomFieldName, true).then((response) => {
      customFieldId = response.body.data.id;
      cy.apiSignup(firstName, lastName, email, password).then((response) => {
        userId = response.body.data.id;
      });
      cy.setLoginCookie(email, password);
    });
  });

  it("doesn't let non-active users reaction", () => {
    cy.setLoginCookie(email, password);
    cy.visit('projects/an-idea-bring-it-to-your-council');
    cy.get('#e2e-ideas-container').should('exist');
    cy.get('.e2e-ideacard-like-button').should('exist');
    cy.get('.e2e-ideacard-like-button').first().click();
    cy.get('#e2e-authentication-modal').should('exist');
  });

  after(() => {
    cy.apiRemoveUser(userId);
    cy.apiRemoveCustomField(customFieldId);
  });
});
