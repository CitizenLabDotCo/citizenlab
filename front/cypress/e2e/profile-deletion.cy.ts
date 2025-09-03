import { randomString, randomEmail } from '../support/commands';

describe('profile deletion', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();

  before(() => {
    cy.apiSignup(firstName, lastName, email, password).then(() => {
      cy.setLoginCookie(email, password);
    });
  });

  it('lets user delete their profile', () => {
    cy.visit('/profile/edit');
    cy.dataCy('e2e-delete-profile-button').should('be.visible').click();
    cy.dataCy('e2e-delete-profile-confirmation').should('be.visible').click();
    cy.dataCy('e2e-user-deleted-success-modal-content').should('be.visible');
    // Check that the user is logged out
    cy.visit('/profile/edit');
    cy.dataCy('e2e-unauthorized-must-sign-in').should('be.visible');
  });
});
