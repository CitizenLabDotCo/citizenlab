import { randomString, randomEmail } from '../support/commands';

describe('Initiative form page', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  const initiativeTitle = randomString(10);
  const initiativeContent = randomString(30);
  const newInitiativeTitle = randomString(10);
  const newInitiativeContent = randomString(30);
  let jwt: string;
  let initiativeId: string;

  before(() => {
    cy.apiSignup(firstName, lastName, email, password);
    cy.apiLogin(email, password)
      .then((user) => {
        jwt = user.body.jwt;
        return cy.apiCreateInitiative({
          initiativeTitle,
          initiativeContent,
          jwt,
        });
      })
      .then((initiative) => {
        initiativeId = initiative.body.data.id;
      });
  });

  beforeEach(() => {
    cy.setLoginCookie(email, password);
    cy.visit(`/initiatives/edit/${initiativeId}`);
    cy.acceptCookies();
    cy.get('.e2e-initiative-edit-page');
  });

  it('has a working initiative edit form', () => {
    cy.intercept('PATCH', `**/initiatives/${initiativeId}`).as(
      'initiativePatchRequest'
    );

    cy.get('#title_multiloc').as('titleInput');
    cy.get('#e2e-initiative-form-description-section .ql-editor').as(
      'descriptionInput'
    );

    // check initial values
    cy.get('@titleInput').should('have.value', initiativeTitle);
    cy.get('@descriptionInput').contains(initiativeContent);

    // edit title and description
    cy.get('@titleInput').clear().type(newInitiativeTitle);
    cy.get('@descriptionInput').clear().type(newInitiativeContent);

    // verify the new values
    cy.get('@titleInput').should('have.value', newInitiativeTitle);
    cy.get('@descriptionInput').contains(newInitiativeContent);

    // add a topic
    cy.get('.e2e-topics-picker').find('button').eq(3).click();

    // verify that the topic has been selected
    cy.get('.e2e-topics-picker')
      .find('button.selected')
      .should('have.length', 1);

    // save the form
    cy.get('#e2e-initiative-publish-button').click();
    cy.wait('@initiativePatchRequest');

    // verify redirect to the initiative page
    cy.location('pathname').should('eq', `/en/initiatives/${initiativeTitle}`);

    // verify the content on the initiative page
    cy.get('#e2e-initiative-title').contains(newInitiativeTitle);
    cy.get('#e2e-initiative-description').contains(newInitiativeContent);
  });

  it('saves and removes the header/banner image', () => {
    cy.intercept('PATCH', `**/initiatives/${initiativeId}`).as(
      'initiativePatchRequest'
    );

    // NOTE: if this test fails, there's a decent chance there is also a main image.
    // Because of that, there will be two buttons with the e2e-remove-image-button.
    cy.get('#header_bg').attachFile('icon.png');
    // save the form
    cy.get('#e2e-initiative-publish-button').click();

    // // verify redirect to the initiative page
    cy.location('pathname').should('eq', `/en/initiatives/${initiativeTitle}`);
    // Verify banner image exists
    cy.get('[data-cy="e2e-initiative-banner-image"]').should('exist');

    // Back to edit form
    cy.visit(`/initiatives/edit/${initiativeId}`);
    cy.get('[data-cy="e2e-remove-image-button"]').click();

    // save the form
    cy.get('#e2e-initiative-publish-button').click();
    cy.wait('@initiativePatchRequest');

    // Verify banner image does not exist
    cy.get('[data-cy="e2e-initiative-banner-image"]').should('not.exist');
  });

  after(() => {
    cy.apiRemoveInitiative(initiativeId);
  });
});
