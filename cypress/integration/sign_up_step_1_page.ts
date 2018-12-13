describe('Sign up step 1 page', () => {
  beforeEach(() => {
    cy.visit('/sign-up');
    cy.get('.e2e-accept-cookies-btn').click();
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

  it('has a working terms and conditions checkbox', () => {
    cy.get('.e2e-terms-and-conditions .e2e-checkbox').click().should('have.class', 'checked');
  });

  it('signs up with valid credentials and navigates to the landing page', () => {
    const firstName = Math.random().toString(36).substr(2, 12);
    const lastName = Math.random().toString(36).substr(2, 12);
    const email = `${Math.random().toString(36).substr(2, 12)}@citizenlab.co`;
    const password = Math.random().toString(36).substr(2, 12);

    cy.signup(firstName, lastName, email, password);
    cy.location('pathname').should('eq', '/en-GB/');
  });
});
