describe('"In your area" (areas) widget', () => {
  before(() => {
    // Add widget to homepage
    // Go to the homepage builder
    cy.setAdminLoginCookie();
    cy.visit('en/admin/pages-menu/homepage-builder');
    cy.acceptCookies();

    // Drag in widget
    cy.get('#e2e-draggable-areas').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });
    cy.wait(1000);

    // Save
    cy.get('#e2e-content-builder-topbar-save').click();
  });

  after(() => {
    cy.visit('en/admin/pages-menu/homepage-builder');
    cy.get('[data-cy="e2e-areas-widget"]')
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
    cy.get('[data-cy="e2e-areas-widget"]').should('not.exist');
  });

  it('shows projects of the areas I follow', () => {
    // Create project with area
    cy.visit('/admin/projects/all');
    cy.get('[data-cy="e2e-new-project-button"]').click();
    cy.get('.e2e-project-general-form');

    const projectTitleEN = 'Project linked to Carrotgem area';
    cy.get('#e2e-project-title-setting-field').type(projectTitleEN);
    cy.get('.e2e-localeswitcher.nl-BE').click();
    cy.get('#e2e-project-title-setting-field').type(projectTitleEN);
    cy.get('.e2e-localeswitcher.nl-NL').click();
    cy.get('#e2e-project-title-setting-field').type(projectTitleEN);
    cy.get('.e2e-localeswitcher.fr-BE').click();
    cy.get('#e2e-project-title-setting-field').type(projectTitleEN);

    // Select 'Selection' as Areas option
    cy.get('.e2e-areas-selection').click();

    // Pick (only) area
    cy.get('#e2e-area-selector')
      .click()
      .find('input')
      .type('Carrotgem')
      .trigger('keydown', { keyCode: 13, which: 13 });

    // Submit and publish project
    cy.get('.e2e-submit-wrapper-button button').click();
    cy.get('#e2e-publish').click();

    // Go to the homepage
    cy.goToLandingPage();
    // Necessary to ensure our widget is loaded
    cy.reload();

    // Opens the modal
    cy.get('[data-cy="e2e-follow-areas-button"]').click();

    // Select area
    cy.contains('button', 'Carrotgem').click();

    // Closes the modal
    cy.get('[data-cy="e2e-follow-areas-modal-done-button"]').click();

    // Shows the project with title "Project linked to Carrotgem area"
    cy.get('[data-cy="e2e-areas-widget"]')
      .find('[data-cy="e2e-light-project-card"]')
      .should('contain', projectTitleEN);
  });
});
