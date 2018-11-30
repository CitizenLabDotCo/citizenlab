describe('Sign in page', () => {
  beforeEach(() => {
    cy.visit('/sign-in');
    cy.get('.e2e-accept-cookies-btn').click();
  });

  // it('shows the page', () => {
  //   cy.get('.e2e-sign-in-page');
  // });

  // it('has a working email field', () => {
  //   cy.get('#email').type('test').should('have.value', 'test');
  // });

  // it('has a working password field', () => {
  //   cy.get('#password').type('test').should('have.value', 'test');
  // });

  // it('requires an email address', () => {
  //   cy.get('.e2e-submit-signin').click();
  //   cy.get('.e2e-error-message').should('contain', 'Please enter your email address');
  // });

  // it('requires a valid email address', () => {
  //   cy.get('#email').type('test');
  //   cy.get('.e2e-submit-signin').click();
  //   cy.get('.e2e-error-message').should('contain', 'Please enter a valid email address');
  // });

  // it('requires a password', () => {
  //   cy.get('.e2e-submit-signin').click();
  //   cy.get('.e2e-error-message').should('contain', 'Please enter a password');
  // });

  // it('has a working link to the password recovery page', () => {
  //   cy.get('.e2e-password-recovery-link').click();
  //   cy.location('pathname').should('eq', '/en/password-recovery');
  // });

  // it('has a working link to the sign up page', () => {
  //   cy.get('.e2e-sign-up-link').click();
  //   cy.location('pathname').should('eq', '/en/sign-up');
  // });

  it('logs in with valid credentials', () => {
    cy.get('#email').type('koen@citizenlab.co');
    cy.get('#password').type('testtest');
    cy.get('.e2e-submit-signin').click();
  });

  // it('shows an error when trying to log in with invalid credentials', () => {
  //   const randomEmail = `${Math.random().toString(36).substr(2, 5)}@citizenlab.co`;
  //   const randomPassword = Math.random().toString(36).substr(2, 5);
  //   cy.get('#email').type(randomEmail);
  //   cy.get('#password').type(randomPassword);
  //   cy.get('.e2e-submit-signin').click();
  //   cy.get('.e2e-error-message').should('contain', 'This combination of e-mail and password is not correct');
  // });
});
