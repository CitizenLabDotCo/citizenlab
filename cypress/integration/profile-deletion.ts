import { randomString, randomEmail } from '../support/commands';

describe('profile deletion', () => {
  const firstName = randomString();
  const lastName = randomString();
  const peasantEmail = randomEmail();
  const peasantPassword = randomString();

  before(() => {
    cy.apiSignup(firstName, lastName, peasantEmail, peasantPassword);
  });
  beforeEach(() => {
    cy.setLoginCookie(peasantEmail, peasantPassword);
    cy.visit('/profile/edit');
    cy.acceptCookies();
  });
  it('lets user delete their profile', () => {
    cy.get('.e2e-delete-profile').find('button').click();
    cy.get('.e2e-delete-profile-confirm').find('button').click();
    cy.wait(3000);
    cy.get('.e2e-user-deleted-success-modal-content');
    cy.get('.e2e-modal-close-button').click();
    cy.get('.e2e-user-deleted-success-modal-content').should('not.exist');
    cy.get('.e2e-user-menu-container').should('not.exist');
  });
});
