import { randomString, randomEmail } from '../support/commands';

describe('profile edition', () => {
  const firstName = randomString();
  const lastName = randomString();
  let email = randomEmail();
  const password = randomString();
  let userId = '';

  before(() => {
    cy.apiSignup(firstName, lastName, email, password).then((response: any) => {
      userId = response.body.data.id;
    });
  });
  beforeEach(() => {
    cy.setLoginCookie(email, password);
    cy.visit('/profile/edit');
    cy.acceptCookies();
  });
  it('lets user edit their profile', () => {
    cy.intercept(`**/users/${userId}`).as('saveUser');
    cy.get('input[type="file"]').attachFile('icon.png');
    cy.get('#first_name').clear().type('Jane');
    cy.get('#last_name').clear().type('Doe');
    const newEmail = randomEmail();
    email = newEmail;
    cy.get('#email').clear().type(newEmail);
    cy.get('button[type="submit"]').contains('Save changes').click();
    cy.wait('@saveUser');
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');
  });
  it('shows errors when fields have invalid values', () => {
    cy.get('#first_name').clear();
    cy.get('#last_name').clear();
    cy.get('#email').clear();
    cy.get('button[type="submit"]').contains('Save changes').click();
    cy.get('[data-testid="feedbackErrorMessage"]').should('exist');
    cy.get('.e2e-error-message').should('have.length', 4);
  });
  after(() => {
    cy.apiRemoveUser(userId);
  });
});
