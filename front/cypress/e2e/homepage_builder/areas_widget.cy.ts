describe('"In your area" (areas) widget', () => {
  before(() => {
    // Add widget to homepage
    // Go to the homepage builder
    cy.setAdminLoginCookie();
    cy.visit('en/admin/pages-menu/homepage-builder');

    // Drag in widget
    cy.get('#e2e-draggable-areas').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });
    cy.wait(1000);

    // Save
    cy.get('#e2e-content-builder-topbar-save').click();
  });

  after(() => {
    // Delete widget again
    cy.setAdminLoginCookie();
    cy.visit('en/admin/pages-menu/homepage-builder');
    cy.get('.e2e-areas-widget').first().parent().click({ force: true });

    cy.get('#e2e-delete-button').click();

    // Save
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait(1000);

    // Make sure it's not on homepage
    cy.goToLandingPage();
    cy.reload();
    cy.wait(4000);
    cy.get('.e2e-areas-widget').should('not.exist');
  });

  it('exists', () => {
    // Check if widget is displayed in homepage
    cy.goToLandingPage();
    cy.get('.e2e-areas-widget').should('exist');
  });

  it('shows projects of the areas I follow', () => {
    // Go to the homepage
    cy.setAdminLoginCookie();
    cy.goToLandingPage();

    // Opens the modal
    cy.get('[data-cy="e2e-follow-areas-button"]').click();

    // Select areas
    // TODO

    // Closes the modal
    cy.get('[data-cy="e2e-follow-areas-modal-done-button"]').click();

    // Shows project(s) of the areas I follow
    // TODO
  });

  it('shows the fallback text when no areas are followed', () => {
    // Go to the homepage
    cy.setAdminLoginCookie();
    cy.goToLandingPage();

    // Shows fallback text
  });

  it('shows projects in my area after signing up', () => {});
});
