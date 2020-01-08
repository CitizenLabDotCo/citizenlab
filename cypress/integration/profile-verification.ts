import { randomString, randomEmail } from '../support/commands';

describe('profile verification', () => {

  const firstName = randomString();
  const lastName = randomString();
  const peasantEmail = randomEmail();
  const peasantPassword = randomString();
  let userId: string;

  before(() => {
    cy.apiSignup(firstName, lastName, peasantEmail, peasantPassword).then(response => {
      userId = response.body.data.id;
    });
    cy.setLoginCookie(peasantEmail, peasantPassword);
    cy.visit('/profile/edit');
    cy.acceptCookies();
  });
  it('show not verified section and verification button', () => {
    cy.get('.e2e-not-verified');
    cy.get('#e2e-verify-user-button').click();
    cy.get('.e2e-verification-modal');
  });
  it('shows verified section', () => {
    cy.apiLogin(peasantEmail, peasantPassword).then(response => {
      cy.apiVerifyBogus(response.body.jwt);
    });
    cy.setLoginCookie(peasantEmail, peasantPassword);
    cy.visit('/profile/edit');
    cy.acceptCookies();

    cy.get('.e2e-verified');
  });
  it('opens the verification modal success after redirection', () => {
    cy.setLoginCookie(peasantEmail, peasantPassword);
    cy.wait(500);

    cy.visit('/profile/edit?verification_success');
    cy.get('.e2e-verification-modal').find('.e2e-user-verified-success-modal-content');
    cy.visit('?verification_success');
    cy.get('.e2e-verification-modal').find('.e2e-user-verified-success-modal-content');
  });
  it('opens the verification modal error after redirection', () => {
    cy.setLoginCookie(peasantEmail, peasantPassword);
    cy.wait(500);

    cy.visit('/profile/edit?verification_error=true');
    cy.get('.e2e-verification-modal').find('.e2e-user-verified-errror-modal-content');
    cy.visit('?verification_error');
    cy.get('.e2e-verification-modal').find('.e2e-user-verified-errror-modal-content');
  });
  after(() => {
    cy.apiRemoveUser(userId);
  });
});
