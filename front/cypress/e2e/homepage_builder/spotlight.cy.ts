describe('Spotlight widget', () => {
  it('can be added', () => {
    // Go to the homepage builder
    cy.setAdminLoginCookie();
    cy.visit('en/admin/pages-menu/homepage-builder');
    cy.get('#e2e-content-builder-frame').should('exist');
    cy.wait(1000);
    // Drag in widget
    cy.get('#e2e-draggable-spotlight').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );
    cy.wait(1000);

    // Ideally would have liked to test the publication select,
    // but it's impossible to figure out how to test react-select.
    // So skipping for now

    // Save
    cy.get('#e2e-content-builder-topbar-save').click();

    // Check if widget is displayed in homepage
    cy.goToLandingPage();
    cy.get('.e2e-spotlight-widget').should('exist');

    // Delete widget again
    cy.setAdminLoginCookie();
    cy.visit('en/admin/pages-menu/homepage-builder');
    cy.get('#e2e-content-builder-frame').should('exist');
    cy.wait(1000);

    cy.get('.e2e-spotlight-widget').click('top', { force: true });

    cy.get('#e2e-delete-button').click();

    // Save
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait(1000);

    // Make sure it's not on homepage
    cy.goToLandingPage();
    cy.reload();
    cy.wait(4000);
    cy.get('.e2e-spotlight-widget').should('not.exist');
  });
});
