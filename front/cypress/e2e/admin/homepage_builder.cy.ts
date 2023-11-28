describe('Homepage builder', () => {
  it.skip('updates homepage builder content correctly', () => {
    cy.setAdminLoginCookie();
    cy.intercept('PATCH', '**/home_page').as('saveHomePage');
    cy.intercept('GET', '**/home_page').as('getHomePage');
    cy.intercept('GET', '**/pages-menu').as('getPages');
    cy.intercept('GET', '**/nav_bar_items').as('getNavbarItems');
    // go to admin page
    cy.visit('/admin/pages-menu/');

    cy.wait('@getPages');
    cy.wait('@getHomePage');
    cy.wait('@getNavbarItems');
    // go to page with homepage builder
    cy.get('[data-cy="e2e-navbar-item-edit-button"]').first().click();

    cy.get('#e2e-draggable-two-column').dragAndDrop('.e2e-signed-out-header', {
      position: 'below',
    });

    // Components added to all columns
    cy.get('#e2e-draggable-text-multiloc').dragAndDrop(
      'div.e2e-single-column',
      {
        position: 'inside',
      }
    );

    cy.get('div.e2e-text-box').should('have.length', 2);
    cy.get('div.e2e-text-box').first().click();
    cy.get('.ql-editor').type('first text');
    cy.get('div.e2e-text-box').last().click();
    cy.get('.ql-editor').type('last text');

    // Events
    cy.get('#e2e-draggable-events').dragAndDrop('.e2e-signed-out-header', {
      position: 'below',
    });

    // Proposals
    cy.get('#e2e-draggable-proposals').dragAndDrop('.e2e-signed-out-header', {
      position: 'below',
    });

    // Customize projects title
    cy.get('[data-cy="e2e-projects"]').click({
      force: true,
    });
    cy.get('#project_title').type('Custom projects title');

    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveHomePage');
    cy.visit(`/`);
    cy.get('#e2e-two-column').should('exist');
    cy.get('div.e2e-text-box').should('have.length', 2);
    cy.get('div.e2e-text-box').first().should('contain', 'first text');
    cy.get('div.e2e-text-box').last().should('contain', 'last text');
    cy.get('[data-cy="e2e-events"]').should('exist');
    cy.get('[data-cy="e2e-proposals"]').should('exist');
    cy.get('[data-cy="e2e-projects"]').should(
      'contain',
      'Custom projects title'
    );
  });

  it.skip('removes homepage builder content correctly', () => {
    cy.setAdminLoginCookie();
    cy.intercept('PATCH', '**/home_page').as('saveHomePage');
    cy.intercept('GET', '**/home_page').as('getHomePage');
    cy.intercept('GET', '**/pages-menu').as('getPages');
    cy.intercept('GET', '**/nav_bar_items').as('getNavbarItems');
    // go to admin page
    cy.visit('/admin/pages-menu/');

    cy.wait('@getPages');
    cy.wait('@getHomePage');
    cy.wait('@getNavbarItems');
    // go to page with homepage builder
    cy.get('[data-cy="e2e-navbar-item-edit-button"]').first().click();

    cy.get('#e2e-two-column').should('exist');

    // Delete two column
    cy.get('#e2e-two-column').click();
    cy.get('#e2e-delete-button').click();

    // Delete events
    cy.get('[data-cy="e2e-events"]').should('exist');
    cy.get('[data-cy="e2e-events"]').click({
      force: true,
    });
    cy.get('#e2e-delete-button').click();

    // Delete proposals
    cy.get('[data-cy="e2e-proposals"]').should('exist');
    cy.get('[data-cy="e2e-proposals"]').click({
      force: true,
    });
    cy.get('#e2e-delete-button').click();

    // Clear projects title
    cy.get('[data-cy="e2e-projects"]').click({
      force: true,
    });

    // Projects are not deletable
    cy.get('#e2e-delete-button').should('not.exist');
    cy.get('#project_title').clear();

    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveHomePage');
    cy.visit(`/`);
    cy.get('#e2e-two-column').should('not.exist');
    cy.get('div.e2e-text-box').should('not.exist');
    cy.get('[data-cy="e2e-events"]').should('not.exist');
    cy.get('[data-cy="e2e-proposals"]').should('not.exist');

    const regex = /currently working on/gi;
    cy.get('[data-cy="e2e-projects"]').should('contain', regex);
  });

  it('updates homepage banner correctly', () => {
    cy.intercept('PATCH', '**/home_page').as('saveHomePage');

    // Check homepage defaults signed - out
    cy.visit('/');
    cy.get('[data-cy="e2e-homepage-banner"]').should('exist');
    cy.get('[data-cy="e2e-full-width-banner-layout-container"]').should(
      'exist'
    );

    // Check homepage defaults signed - in
    cy.setAdminLoginCookie();

    // Update homepage banner

    cy.visit('/admin/pages-menu/homepage-builder');
    cy.get('[data-cy="e2e-homepage-banner"]').click({
      force: true,
    });

    // cy.get('[data-cy="e2e-full-width-banner-layout-option"]').click();
    // cy.get('[data-cy="e2e-two-row-layout-option"]').click();
    cy.get('[data-cy="e2e-fixed-ratio-layout-option"]').click();
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveHomePage');

    // Check updated content signed - in

    // Check updated content signed - out
    cy.logout();
    cy.visit('/');
    cy.get('[data-cy="e2e-homepage-banner"]').should('exist');
    cy.get('[data-cy="e2e-full-width-banner-layout-container"]').should(
      'not.exist'
    );
    cy.get('[data-cy="e2e-two-row-banner-layout-container"]').should(
      'not.exist'
    );
    cy.get('[data-cy="e2e-fixed-ratio-layout-container"]').should('exist');
  });
});
