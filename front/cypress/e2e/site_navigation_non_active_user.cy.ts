import { randomString, randomEmail } from '../support/commands';

describe('navigating platform as a non-active user', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  const randomFieldName = randomString();
  let customFieldId: string;

  before(() => {
    cy.apiCreateCustomField(randomFieldName, true, false).then((response) => {
      customFieldId = response.body.data.id;
      cy.apiSignup(firstName, lastName, email, password, {
        skipCustomFields: true,
      });
      cy.setLoginCookie(email, password);
      cy.goToLandingPage();
      cy.get('#e2e-user-menu-dropdown-button').click({ force: true });
      cy.get('#e2e-complete-registration-link').click({ force: true });
    });
  });

  after(() => {
    cy.apiRemoveCustomField(customFieldId);
  });

  it('shows new user menu dropdown option and hides user pages', () => {
    cy.goToLandingPage();
    cy.get('#e2e-user-menu-dropdown-button').click({ force: true });
    cy.get('#e2e-complete-registration-link').should('exist');
    cy.get('#e2e-my-ideas-page-link').should('not.exist');
    cy.get('#e2e-profile-edit-link').should('not.exist');

    // Visit user page URLs directly
    cy.visit(`/profile/${firstName}-${lastName}`);
    cy.get('#e2e-not-authorized').should('exist');
    cy.visit(`/profile/edit`);
    cy.get('#e2e-not-authorized').should('exist');
  });
});
