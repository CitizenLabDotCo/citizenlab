import { randomEmail, randomString } from '../../../support/commands';

describe('Spaces CRUD', () => {
  const spaceName = randomString(10);
  const spaceModEmail = randomEmail();

  before(() => {
    cy.apiSignup('Space', 'Moderator', spaceModEmail, 'password');
  });

  it('Space can be created', () => {
    cy.setAdminLoginCookie();
    cy.visit(`/admin/projects?tab=spaces&search=${spaceName}`);
    cy.dataCy('e2e-new-space-button').click();
    cy.get('.e2e-localeswitcher').each((button) => {
      cy.wrap(button).click();
      cy.get('input#spaceName').type(spaceName);
      cy.wait(300);
    });

    cy.dataCy('space-name-save-button').click();
    cy.url().should('match', /\/admin\/projects\/spaces\/[a-zA-Z0-9]+/);
    cy.get('.e2e-resource-header').find('h1').should('have.text', spaceName);
  });

  it('A space moderator can be assigned and removed', () => {
    cy.setAdminLoginCookie();

    // Assign space moderator
    cy.visit(`/admin/projects?tab=spaces&search=${spaceName}`);
    cy.get('.space-table-row-title').contains(spaceName).click();
    cy.get('.e2e-resource-header').find('h1').should('have.text', spaceName);

    cy.get('nav.e2e-resource-tabs').find('a').contains('Settings').click();

    cy.get('#projectModeratorUserSearchInputId').type(spaceModEmail);
    cy.get(`[data-cy="e2e-user-${spaceModEmail}"]`).click();
    cy.dataCy('e2e-add-moderator-button').click();

    // Remove space moderator
    cy.dataCy('moderators-table-row').first().contains(spaceModEmail);
    cy.dataCy('remove-manager-button').first().click();
    cy.dataCy('moderators-table-row').should('not.exist');
  });

  it('Space can be deleted', () => {
    cy.setAdminLoginCookie();
    cy.visit(`/admin/projects?tab=spaces&search=${spaceName}`);
    cy.dataCy('spaces-overview-folder-table-row')
      .first()
      .contains(spaceName)
      .dataCy('spaces-overview-folder-table-row')
      .first()
      .find('.e2e-more-actions')
      .click();

    cy.get('.e2e-more-actions-list')
      .first()
      .find('button')
      .first()
      .contains('Delete space')
      .click();

    cy.dataCy('typed-confirmation-input').find('input').type('DELETE');
    cy.dataCy('typed-confirmation-delete-button').click();

    cy.contains('No spaces found').should('exist');
  });
});
