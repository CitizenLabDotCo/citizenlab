import { randomString } from '../../../support/commands';

describe('Spaces CRUD', () => {
  const spaceName = randomString(10);

  it('Space can be created', () => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/projects?tab=spaces');
    cy.dataCy('e2e-new-space-button').click();
    cy.get('.e2e-localeswitcher').each((button) => {
      cy.wrap(button).click();
      cy.get('input#spaceName').type(spaceName);
      cy.wait(1000);
    });

    cy.dataCy('space-name-save-button').click();
    cy.url().should('match', /\/admin\/projects\/spaces\/[a-zA-Z0-9]+/);
    cy.get('.e2e-resource-header').find('h1').should('have.text', spaceName);
  });

  it('Space can be deleted', () => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/projects?tab=spaces');
    const tableRow = cy.dataCy('spaces-overview-folder-table-row').first();
    tableRow.contains(spaceName);
    tableRow.find('.e2e-more-actions').click();

    const moreActionsTooltip = cy.get('.e2e-more-actions-list').first();
    moreActionsTooltip.find('button').first().contains('Delete space').click();

    cy.dataCy('typed-confirmation-input').find('input').type('DELETE');
    cy.dataCy('typed-confirmation-delete-button').click();
  });
});
