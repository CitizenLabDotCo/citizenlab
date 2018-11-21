/// <reference types="cypress"/>

describe('Home page', () => {
  it('successfully loads', () => {
    cy.visit('/');
  });
});

describe('Sign in page', () => {
  // beforeEach(() => {
  //   // reset and seed the database prior to every test
  //   cy.exec('npm run db:reset && npm run db:seed')

  //   // seed a user in the DB that we can control from our tests
  //   // assuming it generates a random password for us
  //   cy.request('POST', '/test/seed/user', { username: 'jane.lane' })
  //     .its('body')
  //     .as('currentUser')
  // });

  it('signs in with email koen@gmail.com and password testtest', () => {
    cy.visit('/sign-in');
    cy.get('#email').type('koen@citizenlab.co');
    cy.get('#password').type('testtest');
    cy.get('.e2e-submit-signin').click();
    cy.location('pathname').should('eq', '/en/');
  });
});
