import { randomString } from '../../support/commands';

describe('Custom Pages widget', () => {
  const pageTitle = randomString(8);
  let customPageId: string;

  before(() => {
    // Create a custom page so it can be selected in the widget
    cy.apiCreateCustomPage(pageTitle).then((page) => {
      customPageId = page.body.data.id;
    });
  });

  after(() => {
    if (customPageId) {
      cy.apiRemoveCustomPage(customPageId);
    }
  });

  it('can be added', () => {
    // Go to the homepage builder
    cy.setAdminLoginCookie();
    cy.visit('en/admin/pages-menu/homepage-builder');
    cy.get('#e2e-content-builder-frame').should('exist');
    cy.wait(1000);

    cy.get('#e2e-draggable-custom-pages').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );
    cy.wait(1000);

    // Add a custom page to the widget via its settings panel
    cy.get('#custom-page-search-input').type(pageTitle);
    cy.contains('[role="option"]', pageTitle, { timeout: 10000 }).click();

    // The widget now renders the selected page in the builder
    cy.get('.e2e-custom-pages-widget').should('exist');

    // Save
    cy.get('#e2e-content-builder-topbar-save').click();

    // Check if widget is displayed in homepage
    cy.goToLandingPage();
    cy.get('.e2e-custom-pages-widget').should('exist');
    cy.get('.e2e-custom-page-card').should('contain', pageTitle);

    // Delete widget again
    cy.setAdminLoginCookie();
    cy.visit('en/admin/pages-menu/homepage-builder');
    cy.get('#e2e-content-builder-frame').should('exist');
    cy.wait(1000);

    cy.get('.e2e-custom-pages-widget').click('top', { force: true });

    cy.get('#e2e-delete-button').click();

    // Save
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait(1000);

    // Make sure it's not on homepage
    cy.goToLandingPage();
    cy.reload();
    cy.wait(4000);
    cy.get('.e2e-custom-pages-widget').should('not.exist');
  });
});
