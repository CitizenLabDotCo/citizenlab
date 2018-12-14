describe('Sign up step 2 page', () => {
  const randomFieldName = Math.random().toString(36).substr(2, 12).toLowerCase();

  const createCustomField = (fieldName: string) => {
    cy.login('admin@citizenlab.co', 'testtest');
    cy.visit('/admin/settings/registration');
    cy.get('.e2e-add-custom-field-btn').click();
    cy.location('pathname').should('eq', '/en-GB/admin/settings/registration/custom_fields/new');
    cy.get('.e2e-multiloc-input input').each(($el) => cy.wrap($el).type(fieldName));
    cy.get('.e2e-custom-field-enabled-toggle').click();
    cy.get('.e2e-submit-wrapper-button').click();
    cy.location('pathname').should('eq', '/en-GB/admin/settings/registration');
    cy.logout();
  };

  const updateCustomField = (fieldName: string, enabled: boolean, required: boolean) => {
    cy.login('admin@citizenlab.co', 'testtest');
    cy.visit('/admin/settings/registration');
    cy.get(`.e2e-custom-field-edit-btn.e2e-${fieldName}`).click();
    cy.get('.e2e-custom-field-enabled-toggle').then(($enableToggle) => {
      if ((enabled && $enableToggle.hasClass('disabled')) || (!enabled && $enableToggle.hasClass('enabled'))) {
        cy.wrap($enableToggle).click();
      }
    })
    .get('.e2e-custom-field-required-toggle').then(($requireToggle) => {
      if ((required && $requireToggle.hasClass('disabled')) || (!required && $requireToggle.hasClass('enabled'))) {
        cy.wrap($requireToggle).click();
      }
    })
    .get('.e2e-submit-wrapper-button').then(($submitBtn) => {
      if (!$submitBtn.hasClass('disabled')) {
        cy.wrap($submitBtn).click();
        cy.location('pathname').should('eq', '/en-GB/admin/settings/registration');
      }
    })
    .logout();
  };

  const deleteCustomField = (fieldName: string) => {
    cy.login('admin@citizenlab.co', 'testtest');
    cy.visit('/admin/settings/registration');
    cy.get(`.e2e-delete-custom-field-btn.e2e-${fieldName}`).click();
    cy.get('body').trigger('{enter}', { force: true });
    cy.logout();
  };

  before(() => {
    createCustomField(randomFieldName);
  });

  after(() => {
    deleteCustomField(randomFieldName);
  });

  beforeEach(() => {
    cy.visit('/');
    cy.acceptCookies();
  });

  it('does not show the 2nd step when no custom fields are enabled', () => {
    const firstName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const lastName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const email = `${Math.random().toString(36).substr(2, 12).toLowerCase()}@citizenlab.co`;
    const password = Math.random().toString(36).substr(2, 12).toLowerCase();

    cy.visit('/sign-up');
    cy.signup(firstName, lastName, email, password);
    cy.location('pathname').should('eq', '/en-GB/');
  });

  it('shows the 2nd step and can skip it when an optional custom field is enabled', () => {
    const firstName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const lastName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const email = `${Math.random().toString(36).substr(2, 12).toLowerCase()}@citizenlab.co`;
    const password = Math.random().toString(36).substr(2, 12).toLowerCase();

    // before
    updateCustomField(randomFieldName, true, false);
    cy.signup(firstName, lastName, email, password);
    cy.get('#e2e-signup-step2');
    cy.visit('/');

    // test
    cy.visit('/complete-signup');
    cy.get('#e2e-signup-step2');
    cy.get('.e2e-signup-step2-skip-btn').click();
    cy.location('pathname').should('eq', '/en-GB/');
  });

  it('shows the 2nd step and an error message when not filled in when a required custom field is enabled', () => {
    const firstName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const lastName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const email = `${Math.random().toString(36).substr(2, 12).toLowerCase()}@citizenlab.co`;
    const password = Math.random().toString(36).substr(2, 12).toLowerCase();

    // before
    updateCustomField(randomFieldName, true, true);
    cy.signup(firstName, lastName, email, password);
    cy.get('#e2e-signup-step2');
    cy.visit('/');

    // test
    cy.visit('/complete-signup');
    cy.get('#e2e-signup-step2');
    cy.get('.e2e-signup-step2-button').click();
    cy.get('.e2e-error-message').should('contain', 'This field is required');
  });

  it('shows and successfully completes the 2nd step when filled in when a required custom field is enabled', () => {
    const firstName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const lastName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const email = `${Math.random().toString(36).substr(2, 12).toLowerCase()}@citizenlab.co`;
    const password = Math.random().toString(36).substr(2, 12).toLowerCase();

    // before
    updateCustomField(randomFieldName, true, true);
    cy.signup(firstName, lastName, email, password);
    cy.get('#e2e-signup-step2');
    cy.visit('/');

    // test
    cy.visit('/complete-signup');
    cy.get('#e2e-signup-step2');
    cy.get(`#root_${randomFieldName}`).type('test');
    cy.get('.e2e-signup-step2-button').click();
    cy.location('pathname').should('eq', '/en-GB/');
  });
});
