describe('Sign up step 2 page', () => {
  let adminJwt: string = null as any;

  const createCustomField = (fieldName: string, enabled: boolean, required: boolean) => {
    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`
      },
      method: 'POST',
      url: 'web_api/v1/users/custom_fields',
      body: {
        custom_field: {
          enabled,
          required,
          input_type: 'text',
          title_multiloc: {
            'en-GB': fieldName,
            'nl-BE': fieldName
          }
        }
      }
    });
  };

  const deleteCustomField = (fieldId: string) => {
    cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`
      },
      method: 'DELETE',
      url: `web_api/v1/users/custom_fields/${fieldId}`
    });
  };

  before(() => {
    cy.apiLogin('admin@citizenlab.co', 'testtest').then((response) => {
      adminJwt = response.body.jwt;
    });
  });

  it('does not show it when no custom fields are enabled', () => {
    const firstName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const lastName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const email = `${Math.random().toString(36).substr(2, 12).toLowerCase()}@citizenlab.co`;
    const password = Math.random().toString(36).substr(2, 12).toLowerCase();

    // before
    cy.apiSignup(firstName, lastName, email, password);
    cy.login(email, password);
    cy.wait(1000);
    cy.visit('/');
    cy.get('#e2e-landing-page');
    cy.wait(1000);

    // test
    cy.visit('/complete-signup');
    cy.location('pathname').should('eq', '/en-GB/');
    cy.get('#e2e-landing-page');
  });

  it('can skip it when an optional custom field is enabled', () => {
    const randomFieldName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const firstName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const lastName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const email = `${Math.random().toString(36).substr(2, 12).toLowerCase()}@citizenlab.co`;
    const password = Math.random().toString(36).substr(2, 12).toLowerCase();

    // before
    createCustomField(randomFieldName, true, false).then((response) => {
      const customFieldId = response.body.data.id;
      cy.apiSignup(firstName, lastName, email, password);
      cy.login(email, password);
      cy.wait(1000);
      cy.visit('/');
      cy.get('#e2e-landing-page');
      cy.wait(1000);

      // test
      cy.visit('/complete-signup');
      cy.get('#e2e-signup-step2');
      cy.get('.e2e-signup-step2-skip-btn').click();
      cy.location('pathname').should('eq', '/en-GB/');
      cy.get('#e2e-landing-page');

      // after
      deleteCustomField(customFieldId);
    });
  });

  it('shows an error message when submitting an empty form that contains a required custom field', () => {
    let customFieldId: string = null as any;
    const randomFieldName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const firstName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const lastName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const email = `${Math.random().toString(36).substr(2, 12).toLowerCase()}@citizenlab.co`;
    const password = Math.random().toString(36).substr(2, 12).toLowerCase();

    // before
    createCustomField(randomFieldName, true, true).then((response) => {
      customFieldId = response.body.data.id;
      cy.apiSignup(firstName, lastName, email, password);
      cy.login(email, password);
      cy.wait(1000);
      cy.visit('/');
      cy.get('#e2e-landing-page');
      cy.wait(1000);

      // test
      cy.visit('/complete-signup');
      cy.get('#e2e-signup-step2');
      cy.get('.e2e-signup-step2-button').click();
      cy.get('.e2e-error-message').should('contain', 'This field is required');

      // after
      deleteCustomField(customFieldId);
    });
  });

  it('successfully completes when submitting a filled-in form that contains a required custom field', () => {
    const randomFieldName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const firstName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const lastName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const email = `${Math.random().toString(36).substr(2, 12).toLowerCase()}@citizenlab.co`;
    const password = Math.random().toString(36).substr(2, 12).toLowerCase();

    // before
    createCustomField(randomFieldName, true, true).then((response) => {
      const customFieldId = response.body.data.id;
      cy.apiSignup(firstName, lastName, email, password);
      cy.login(email, password);
      cy.wait(1000);
      cy.visit('/');
      cy.get('#e2e-landing-page');
      cy.wait(1000);

      // test
      cy.visit('/complete-signup');
      cy.get('#e2e-signup-step2');
      cy.get(`#root_${randomFieldName}`).type('test');
      cy.get('.e2e-signup-step2-button').click();
      cy.location('pathname').should('eq', '/en-GB/');
      cy.get('#e2e-landing-page');

      // after
      deleteCustomField(customFieldId);
    });
  });
});
