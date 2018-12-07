describe('Sign up step 2 page', () => {
  const customFieldName = Math.random().toString(36).substr(2, 12).toLowerCase();

  const createAndEnableCustomField = () => {
    cy.login('admin@citizenlab.co', 'testtest');
    cy.visit('/admin/settings/registration');
    cy.get('.e2e-add-custom-field-btn').click();
    cy.url().should('include', '/admin/settings/registration/custom_fields/new');
    cy.get('.e2e-multiloc-input input').each(($el) => cy.wrap($el).type(customFieldName));
    cy.get('.e2e-submit-wrapper-button').click();
    cy.url().should('include', '/admin/settings/registration');
    cy.logout();
  };

  const enableCustomField = () => {
    cy.login('admin@citizenlab.co', 'testtest');
    cy.visit('/admin/settings/registration');
    cy.get('.e2e-add-custom-field-btn').click();
    cy.url().should('include', '/admin/settings/registration');
    cy.get(`.e2e-custom-field-edit-btn.${customFieldName}`).click();
    cy.get('.e2e-custom-field-enabled-toggle').then(($toggle) => {
      if ($toggle.hasClass('disabled')) {
        cy.wrap($toggle).click();
        cy.get('.e2e-submit-wrapper-button').click();
        cy.url().should('include', '/admin/settings/registration');
      }
    });
    cy.logout();
  };

  const disableCustomField = () => {
    cy.login('admin@citizenlab.co', 'testtest');
    cy.visit('/admin/settings/registration');
    cy.get('.e2e-add-custom-field-btn').click();
    cy.url().should('include', '/admin/settings/registration');
    cy.get(`.e2e-custom-field-edit-btn.${customFieldName}`).click();
    cy.get('.e2e-custom-field-enabled-toggle').then(($toggle) => {
      if ($toggle.hasClass('enabled')) {
        cy.wrap($toggle).click();
        cy.get('.e2e-submit-wrapper-button').click();
        cy.url().should('include', '/admin/settings/registration');
      }
    });
    cy.logout();
  };

  const setCustomFieldToRequired = () => {
    cy.login('admin@citizenlab.co', 'testtest');
    cy.visit('/admin/settings/registration');
    cy.get('.e2e-add-custom-field-btn').click();
    cy.url().should('include', '/admin/settings/registration');
    cy.get(`.e2e-custom-field-edit-btn.${customFieldName}`).click();
    cy.get('.e2e-custom-field-required-toggle').then(($toggle) => {
      if ($toggle.hasClass('disabled')) {
        cy.wrap($toggle).click();
        cy.get('.e2e-submit-wrapper-button').click();
        cy.url().should('include', '/admin/settings/registration');
      }
    });
    cy.logout();
  };

  const setCustomFieldToOptional = () => {
    cy.login('admin@citizenlab.co', 'testtest');
    cy.visit('/admin/settings/registration');
    cy.get('.e2e-add-custom-field-btn').click();
    cy.url().should('include', '/admin/settings/registration');
    cy.get(`.e2e-custom-field-edit-btn.${customFieldName}`).click();
    cy.get('.e2e-custom-field-required-toggle').then(($toggle) => {
      if ($toggle.hasClass('enabled')) {
        cy.wrap($toggle).click();
        cy.get('.e2e-submit-wrapper-button').click();
        cy.url().should('include', '/admin/settings/registration');
      }
    });
    cy.logout();
  };

  const deleteCustomField = () => {
    cy.login('admin@citizenlab.co', 'testtest');
    cy.visit('/admin/settings/registration');
    cy.get(`.e2e-delete-custom-field-btn.${customFieldName}`).click();
    cy.get('body').trigger('{enter}', { force: true });
    cy.logout();
  };

  before(() => {
    // empty
  });

  after(() => {
    deleteCustomField();
  });

  beforeEach(() => {
    cy.visit('/');
    cy.get('.e2e-accept-cookies-btn').click();
  });

  afterEach(() => {});

  it('does not show the 2nd step when no custom fields are enabled', () => {
    const firstName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const lastName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const email = `${Math.random().toString(36).substr(2, 12).toLowerCase()}@citizenlab.co`;
    const password = Math.random().toString(36).substr(2, 12).toLowerCase();

    cy.visit('/sign-up');
    cy.signup(firstName, lastName, email, password);
    cy.location('pathname').should('eq', '/en-GB/');
  });

  it('shows the 2nd step and skips it with an optional custom field', () => {
    const customFieldName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const firstName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const lastName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const email = `${Math.random().toString(36).substr(2, 12).toLowerCase()}@citizenlab.co`;
    const password = Math.random().toString(36).substr(2, 12).toLowerCase();

    // before
    createAndEnableCustomField();
    cy.signup(firstName, lastName, email, password);
    cy.get('#e2e-signup-step2');
    cy.visit('/');

    // test
    cy.visit('/complete-signup');
    cy.get('#e2e-signup-step2');
    cy.get('.e2e-signup-step2-skip-btn').click();
    cy.location('pathname').should('eq', '/en-GB/');
  });

  it('shows an error when trying to complete the 2nd step with a required custom field', () => {
    const customFieldName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const firstName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const lastName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const email = `${Math.random().toString(36).substr(2, 12).toLowerCase()}@citizenlab.co`;
    const password = Math.random().toString(36).substr(2, 12).toLowerCase();

    // before
    setCustomFieldToRequired();
    cy.signup(firstName, lastName, email, password);
    cy.get('#e2e-signup-step2');
    cy.visit('/');

    // test
    cy.visit('/complete-signup');
    cy.get('#e2e-signup-step2');
    cy.get('.e2e-signup-step2-button').click();
    // todo: check for error
  });

  it('completes the 2nd step with a required custom field', () => {
    const customFieldName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const firstName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const lastName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const email = `${Math.random().toString(36).substr(2, 12).toLowerCase()}@citizenlab.co`;
    const password = Math.random().toString(36).substr(2, 12).toLowerCase();

    // before
    cy.signup(firstName, lastName, email, password);
    cy.get('#e2e-signup-step2');
    cy.visit('/');

    // test
    cy.visit('/complete-signup');
    cy.get('#e2e-signup-step2');
    cy.get(`#root_${customFieldName}`).type('test');
    cy.get('.e2e-signup-step2-button').click();
    cy.location('pathname').should('eq', '/en-GB/');
  });
});
