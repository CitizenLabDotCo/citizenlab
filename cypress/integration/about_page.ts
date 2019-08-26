import { randomString, randomEmail } from '../support/commands';

describe('About page', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();

  before(() => {
    cy.apiSignup(firstName, lastName, email, password);
    cy.login(email, password);
  });

  beforeEach(() => {
    cy.visit('/pages/information');
  });

  it('shows the information page by default', () => {
    cy.get('.e2e-page-information');
  });

  it('has a working link to the cookie policy page', () => {
    cy.get('.e2e-page-link-to-cookie-policy').click();
    cy.location('pathname').should('eq', '/en-GB/pages/cookie-policy');
    cy.get('.e2e-page-cookie-policy');
  });

  it('has a working link to the privacy policy page', () => {
    cy.get('.e2e-page-link-to-privacy-policy').click();
    cy.location('pathname').should('eq', '/en-GB/pages/privacy-policy');
    cy.get('.e2e-page-privacy-policy');
  });

  it('has a working link to the terms and conditions page', () => {
    cy.get('.e2e-page-link-to-terms-and-conditions').click();
    cy.location('pathname').should('eq', '/en-GB/pages/terms-and-conditions');
    cy.get('.e2e-page-terms-and-conditions');
  });
});
