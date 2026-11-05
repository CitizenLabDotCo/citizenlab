import { randomString, randomEmail } from '../support/commands';

describe('profile edition', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
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
  });

  function saveChanges() {
    cy.get('button[type="submit"]').contains('Save changes').click();
    cy.wait('@saveUser');
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');
  }

  it('lets user edit their profile', () => {
    cy.intercept(`**/users/${userId}`).as('saveUser');
    cy.get('input[type="file"]').attachFile('icon.png');
    cy.get('#first_name').clear().type('John');
    cy.get('#last_name').clear().type('Doe');
    cy.get('button[type="submit"]').contains('Save changes').click();
    cy.get('#e2e-accept-disclaimer').click();
    cy.wait('@saveUser');
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');
  });

  it('lets user change their first name when last name is empty', () => {
    cy.intercept(`**/users/${userId}`).as('saveUser');
    cy.get('#last_name').clear();
    saveChanges();

    cy.reload(); // important to reproduce the bug
    cy.get('#first_name').clear().type('Lackland');
    saveChanges();
  });

  after(() => {
    cy.apiRemoveUser(userId);
  });
});
