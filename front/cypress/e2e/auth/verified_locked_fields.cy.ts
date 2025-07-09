import { randomString, randomEmail } from '../../support/commands';

describe('Verified Locked fields', () => {
  const verifiedFirstName = randomString();
  const verifiedLastName = randomString();
  const verifiedEmail = randomEmail();
  const verifiedPassword = randomString();
  let verifiedId: string;

  before(() => {
    // create users
    cy.apiSignup(
      verifiedFirstName,
      verifiedLastName,
      verifiedEmail,
      verifiedPassword
    ).then((response) => {
      verifiedId = response.body.data.id;
    });
    // verify the verified user
    cy.apiLogin(verifiedEmail, verifiedPassword).then((response) => {
      cy.apiVerifyBogus(response.body.jwt);
    });
  });
  beforeEach(() => {
    cy.setLoginCookie(verifiedEmail, verifiedPassword);
    cy.visit('/profile/edit');
  });
  it('shows disabled locked fields with message', () => {
    cy.get('#last_name').should('be.disabled');
  });
  after(() => {
    cy.apiRemoveUser(verifiedId);
  });
});
