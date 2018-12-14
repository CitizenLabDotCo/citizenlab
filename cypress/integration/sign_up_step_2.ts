describe('Sign up step 2 page', () => {
  const adminJwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwNzFlZmNlMS1iMmNkLTQ1ZTEtOGI0Ni1iYzkyMTY1NmU1NTUifQ.s6nSGiPxbaRz-LdPamKE-eM5W3Cjff8YpylAE-YwAdE';

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

  const signup = (firstName: string, lastName: string, email: string, password: string) => {
    cy.request({
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      url: 'web_api/v1/users',
      body: {
        user: {
          email,
          password,
          locale: 'en-GB',
          first_name: firstName,
          last_name: lastName
        }
      }
    });
  };

  const login = (email: string, password: string) => {
    cy.request({
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      url: 'web_api/v1/user_token',
      body: {
        auth: {
          email,
          password
        }
      }
    });
  };

  it('does not show the 2nd step when no custom fields are enabled', () => {
    const firstName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const lastName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const email = `${Math.random().toString(36).substr(2, 12).toLowerCase()}@citizenlab.co`;
    const password = Math.random().toString(36).substr(2, 12).toLowerCase();

    // before
    signup(firstName, lastName, email, password);
    cy.login(email, password);

    // test
    cy.visit('/complete-signup');
    cy.location('pathname').should('eq', '/en-GB/');
    cy.get('#e2e-landing-page');
  });

  it('shows the 2nd step and can skip it when an optional custom field is enabled', () => {
    const randomFieldName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const firstName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const lastName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const email = `${Math.random().toString(36).substr(2, 12).toLowerCase()}@citizenlab.co`;
    const password = Math.random().toString(36).substr(2, 12).toLowerCase();

    // before
    createCustomField(randomFieldName, true, false).then((response) => {
      const customFieldId = response.body.data.id;
      signup(firstName, lastName, email, password);
      cy.login(email, password);

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

  it('shows the 2nd step and an error message when not filled in when a required custom field is enabled', () => {
    const randomFieldName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const firstName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const lastName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const email = `${Math.random().toString(36).substr(2, 12).toLowerCase()}@citizenlab.co`;
    const password = Math.random().toString(36).substr(2, 12).toLowerCase();

    // before
    createCustomField(randomFieldName, true, true).then((response) => {
      const customFieldId = response.body.data.id;
      signup(firstName, lastName, email, password);
      cy.login(email, password);

      // test
      cy.visit('/complete-signup');
      cy.get('#e2e-signup-step2');
      cy.get('.e2e-signup-step2-button').click();
      cy.get('.e2e-error-message').should('contain', 'This field is required');

      // after
      deleteCustomField(customFieldId);
    });
  });

  it('shows and successfully completes the 2nd step when filled in when a required custom field is enabled', () => {
    const randomFieldName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const firstName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const lastName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const email = `${Math.random().toString(36).substr(2, 12).toLowerCase()}@citizenlab.co`;
    const password = Math.random().toString(36).substr(2, 12).toLowerCase();

    // before
    createCustomField(randomFieldName, true, true).then((response) => {
      const customFieldId = response.body.data.id;
      signup(firstName, lastName, email, password);
      cy.login(email, password);

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
