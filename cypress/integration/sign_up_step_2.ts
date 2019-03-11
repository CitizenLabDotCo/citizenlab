import { randomString, randomEmail } from '../support/commands';

describe('Sign up step 2 page', () => {
  it('does not show it when no custom fields are enabled', () => {
    const firstName = randomString();
    const lastName = randomString();
    const email = randomEmail();
    const password = randomString();

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
    const randomFieldName = randomString();
    const firstName = randomString();
    const lastName = randomString();
    const email = randomEmail();
    const password = randomString();

    // before
    cy.apiCreateCustomField(randomFieldName, true, false).then((response) => {
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
      cy.apiRemoveCustomField(customFieldId);
    });
  });

  it('shows an error message when submitting an empty form that contains a required custom field', () => {
    let customFieldId: string = null as any;
    const randomFieldName = randomString();
    const firstName = randomString();
    const lastName = randomString();
    const email = randomEmail();
    const password = randomString();

    // before
    cy.apiCreateCustomField(randomFieldName, true, true).then((response) => {
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
      cy.apiRemoveCustomField(customFieldId);
    });
  });

  it('successfully completes when submitting a filled-in form that contains a required custom field', () => {
    const randomFieldName = randomString();
    const firstName = randomString();
    const lastName = randomString();
    const email = randomEmail();
    const password = randomString();

    // before
    cy.apiCreateCustomField(randomFieldName, true, true).then((response) => {
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
      cy.apiRemoveCustomField(customFieldId);
    });
  });
});
