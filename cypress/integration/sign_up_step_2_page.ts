describe('Sign up step 2 page', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('.e2e-accept-cookies-btn').click();
  });

  it('signs up with valid credentials and optional custom fields', () => {
    cy.login('admin@citizenlab.co', 'testtest');
    cy.logout();
  });

  // it('signs up with valid credentials and optional custom fields', () => {
  //   // before
  //   // enable all custom fields and sign up a normal user
  //   const firstName = Math.random().toString(36).substr(2, 12).toLowerCase();
  //   const lastName = Math.random().toString(36).substr(2, 12).toLowerCase();
  //   const email = `${Math.random().toString(36).substr(2, 12).toLowerCase()}@citizenlab.co`;
  //   const password = Math.random().toString(36).substr(2, 12).toLowerCase();
  //   cy.login('admin@citizenlab.co', 'testtest');
  //   cy.visit('/admin/settings/registration');
  //   cy.get('.e2e-custom-registration-field-toggle').then((toggle) => {
  //     if (toggle.hasClass('disabled')) {
  //       cy.get('.e2e-custom-registration-field-toggle.disabled').click({ multiple: true });
  //     }
  //   });
  //   cy.logout();
  //   cy.signup(firstName, lastName, email, password);

  //   // test
  //   cy.visit('/complete-signup');
  //   cy.get('#e2e-signup-step2');
  //   cy.get('.e2e-signup-step2-skip-btn').click();
  //   cy.location('pathname').should('eq', '/en-GB/');

  //   // after
  //   // disable all custom fields again
  //   cy.login('admin@citizenlab.co', 'testtest');
  //   cy.visit('/admin/settings/registration');
  //   cy.get('.e2e-custom-registration-field-toggle').then((toggle) => {
  //     if (toggle.hasClass('enabled')) {
  //       cy.get('.e2e-custom-registration-field-toggle.enabled').click({ multiple: true });
  //     }
  //   });
  // });

  // it('signs up with valid credentials and a required custom field', () => {
  //   const customFieldName = Math.random().toString(36).substr(2, 12).toLowerCase();
  //   const firstName = Math.random().toString(36).substr(2, 12).toLowerCase();
  //   const lastName = Math.random().toString(36).substr(2, 12).toLowerCase();
  //   const email = `${Math.random().toString(36).substr(2, 12).toLowerCase()}@citizenlab.co`;
  //   const password = Math.random().toString(36).substr(2, 12).toLowerCase();

  //   // before
  //   // create a new required custom text field and sign up a normal user
  //   cy.login('admin@citizenlab.co', 'testtest');
  //   cy.visit('/admin/settings/registration');
  //   cy.get('.e2e-add-custom-field-btn').click();
  //   cy.url().should('include', '/admin/settings/registration/custom_fields/new');
  //   cy.get('.e2e-multiloc-input input').each(($el) => cy.wrap($el).type(customFieldName));
  //   cy.get('.e2e-custom-field-required-toggle').click();
  //   cy.get('.e2e-submit-wrapper-button').click();
  //   cy.url().should('include', '/admin/settings/registration');
  //   cy.logout();
  //   cy.signup(firstName, lastName, email, password);

  //   // test
  //   cy.visit('/complete-signup');
  //   cy.get('#e2e-signup-step2');
  //   cy.get(`#root_${customFieldName}`).type('test');
  //   cy.get('.e2e-signup-step2-button').click();
  //   cy.location('pathname').should('eq', '/en-GB/');

  //   // after
  //   // remove the custom field again
  //   cy.login('admin@citizenlab.co', 'testtest');
  //   cy.visit('/admin/settings/registration');
  //   cy.get('.e2e-custom-registration-field-row').each((element) => {
  //     if (cy.wrap(element).contains(customFieldName)) {
  //       cy.wrap(element).get('.e2e-delete-custom-field-btn').click();
  //       cy.get('body').trigger('{enter}', { force: true });
  //     }
  //   });
  //   cy.logout();
  // });
});
