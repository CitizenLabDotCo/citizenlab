import { randomString, randomEmail } from '../support/commands';

describe('Verification modal', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  let userId: string;

  before(() => {
    cy.apiSignup(firstName, lastName, email, password).then((user) => {
      userId = user.body.data.id;
    });
  });

  beforeEach(() => {
    cy.login(email, password);
    cy.visit('/profile/edit');
    cy.wait(2000);
    cy.acceptCookies();
    cy.get('#e2e-user-edit-profile-page');
  });

  it('verifies the user using the bogus form', () => {

  });

  after(() => {
    cy.apiRemoveUser(userId);
  });

});
