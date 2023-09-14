import { randomEmail, randomString } from '../support/commands';

describe('Initiatives with anonymous participation allowed', () => {
  const email = randomEmail();
  const password = randomString(15);
  let userId: string;

  before(() => {
    cy.apiSignup('firstName', 'lastName', email, password).then((response) => {
      userId = response.body.data.id;
    });
    cy.setAdminLoginCookie();

    // This could be replaced with apiUpdateAppConfiguration if test is flaky
    cy.visit('/admin/initiatives/settings');
    cy.apiGetAppConfiguration().then(() => {
      cy.get('#e2e-anonymous-posting-toggle').click();
      cy.get('#e2e-initiative-settings-submit-button').click();
    });
  });

  it('admin can submit anonymous initiatives', () => {
    const initiativeTitle = randomString(10);
    const initiativeContent = randomString(30);
    cy.setAdminLoginCookie();
    cy.visit(`/initiatives/new`);
    cy.acceptCookies();

    cy.get('#title_multiloc').as('titleInput');
    cy.get('#e2e-initiative-form-description-section .ql-editor').as(
      'descriptionInput'
    );
    cy.contains('What is your proposal?').should('exist');

    // add title and description
    cy.get('@titleInput').type(initiativeTitle);
    cy.get('@descriptionInput').type(initiativeContent, { delay: 1 });

    // verify the values
    cy.get('@titleInput').should('contain.value', initiativeTitle);
    cy.get('@descriptionInput').contains(initiativeContent);

    // add a topic
    cy.get('.e2e-topics-picker').find('button').eq(3).click();

    // set to anonymous
    cy.get('#e2e-post-anonymously-checkbox').click();
    cy.get('#e2e-continue-anonymous-participation-btn').click();

    // save the form
    cy.get('#e2e-initiative-publish-button').click();

    // verify redirect to the newly created initiative page
    cy.location('pathname').should('eq', `/en/initiatives/${initiativeTitle}`);
    cy.get('#e2e-initiative-show', { timeout: 200000 });

    // verify that the author is anonymous
    cy.get('#e2e-anonymous-username').should('exist');
  });

  it('resident can submit anonymous initiatives', () => {
    const initiativeTitle = randomString(10);
    const initiativeContent = randomString(30);
    cy.setLoginCookie(email, password);
    cy.visit(`/initiatives/new`);
    cy.acceptCookies();
    cy.get('#title_multiloc').as('titleInput');
    cy.get('#e2e-initiative-form-description-section .ql-editor').as(
      'descriptionInput'
    );

    // add title and description
    cy.get('@titleInput').type(initiativeTitle);
    cy.get('@descriptionInput').type(initiativeContent, { delay: 1 });

    // verify the values
    cy.get('@titleInput').should('contain.value', initiativeTitle);
    cy.get('@descriptionInput').contains(initiativeContent);

    // add a topic
    cy.get('.e2e-topics-picker').find('button').eq(3).click();

    // set to anonymous
    cy.get('#e2e-post-anonymously-checkbox').click();
    cy.get('#e2e-continue-anonymous-participation-btn').click();

    // save the form
    cy.get('#e2e-initiative-publish-button').click();

    // verify redirect to the newly created initiative page
    cy.location('pathname').should('eq', `/en/initiatives/${initiativeTitle}`);
    cy.get('#e2e-initiative-show', { timeout: 200000 });

    // verify that the author is anonymous
    cy.get('#e2e-anonymous-username').should('exist');
  });
});
