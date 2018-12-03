describe('Sign up page', () => {
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

  it('signs up with valid credentials and no custom fields enabled', () => {
    const firstName = Math.random().toString(36).substr(2, 12);
    const lastName = Math.random().toString(36).substr(2, 12);
    const email = `${Math.random().toString(36).substr(2, 12)}@citizenlab.co`;
    const password = Math.random().toString(36).substr(2, 12);
    cy.get('#firstName').type(firstName);
    cy.get('#lastName').type(lastName);
    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('.e2e-terms-and-conditions .e2e-checkbox').click();
    cy.get('#e2e-signup-step1-button').click();
    cy.location('pathname').should('eq', '/en-GB/');
    cy.request({
      method: 'GET',
      url: `web_api/v1/users/by_slug/${firstName.toLowerCase()}-${lastName.toLowerCase()}`
    }).then((response) => {
      expect(response.body.data.attributes.first_name).to.eq(firstName);
      expect(response.body.data.attributes.last_name).to.eq(lastName);
    });
  });

  it('signs up with valid credentials and optional custom fields enabled', () => {
    // before
    // enable all custom fields to make sure the 2nd signup step gets triggered
    cy.loginAsAdmin();
    cy.visit('/admin/settings/registration');
    cy.get('.e2e-custom-registration-field-toggle').then((toggle) => {
      if (toggle.hasClass('disabled')) {
        cy.get('.e2e-custom-registration-field-toggle.disabled').click({ multiple: true });
      }
    });
    cy.logout();

    // test
    const firstName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const lastName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const email = `${Math.random().toString(36).substr(2, 12).toLowerCase()}@citizenlab.co`;
    const password = Math.random().toString(36).substr(2, 12).toLowerCase();
    cy.visit('/sign-up');
    cy.get('#firstName').type(firstName);
    cy.get('#lastName').type(lastName);
    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('.e2e-terms-and-conditions .e2e-checkbox').click();
    cy.get('#e2e-signup-step1-button').click();
    cy.get('#e2e-signup-step2');
    cy.get('.e2e-signup-step2-skip-btn').click();
    cy.location('pathname').should('eq', '/en-GB/');
    cy.request({
      method: 'GET',
      url: `web_api/v1/users/by_slug/${firstName.toLowerCase()}-${lastName.toLowerCase()}`
    }).then((response) => {
      expect(response.body.data.attributes.first_name).to.eq(firstName);
      expect(response.body.data.attributes.last_name).to.eq(lastName);
    });

    // after
    // disable all custom fields again to make sure the signup flow doesn't enter the 2nd step by default
    cy.logout();
    cy.loginAsAdmin();
    cy.visit('/admin/settings/registration');
    cy.get('.e2e-custom-registration-field-toggle').then((toggle) => {
      if (toggle.hasClass('enabled')) {
        cy.get('.e2e-custom-registration-field-toggle.enabled').click({ multiple: true });
      }
    });
    cy.logout();
  });
});
