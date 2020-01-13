import { randomString, randomEmail } from '../support/commands';

describe('Sign up step 1 page', () => {
  beforeEach(() => {
    cy.visit('/sign-up');
    cy.acceptCookies();
  });

  it('shows the page', () => {
    cy.get('.e2e-sign-up-page');
  });

  it('has a working first name field', () => {
    cy.get('#firstName').type('test').should('have.value', 'test');
  });

  it('has a working last name field', () => {
    cy.get('#lastName').type('test').should('have.value', 'test');
  });

  it('has a working email field', () => {
    cy.get('#email').type('test').should('have.value', 'test');
  });

  it('has a working password field', () => {
    cy.get('#password').type('test').should('have.value', 'test');
  });

  it('has working legal concerns checkboxes', () => {
    cy.get('.e2e-terms-and-conditions .e2e-checkbox').click().should('have.class', 'checked');
    cy.get('.e2e-privacy-checkbox .e2e-checkbox').click().should('have.class', 'checked');
    cy.get('.e2e-email-checkbox .e2e-checkbox').click().should('have.class', 'checked');
  });

  it('signs up with valid credentials and navigates to the landing page', () => {
    const firstName = randomString();
    const lastName = randomString();
    const email = randomEmail();
    const password = randomString();

    cy.signup(firstName, lastName, email, password);
    cy.location('pathname').should('eq', '/en-GB/');
  });
});
