describe('Published projects and folders widget', () => {
  it('can be added', () => {
    // Go to the homepage builder
    cy.setAdminLoginCookie();
    cy.visit('en/admin/pages-menu/homepage-builder');
    cy.get('#e2e-content-builder-frame').should('exist');

    // Drag in widget
    cy.get('#e2e-draggable-published').dragAndDrop(
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
    cy.get('.e2e-published-projects-and-folders').should('exist');

    // Delete widget again
    cy.setAdminLoginCookie();
    cy.visit('en/admin/pages-menu/homepage-builder');
    cy.get('.e2e-published-projects-and-folders').should('exist');
    cy.get('.e2e-published-projects-and-folders')
      .first()
      .parent()
      .click({ force: true });

    cy.get('#e2e-delete-button').click();

    // Save
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait(1000);

    // Make sure it's not on homepage
    cy.goToLandingPage();
    cy.reload();
    cy.wait(4000);
    cy.get('.e2e-published-projects-and-folders').should('not.exist');
  });
});
