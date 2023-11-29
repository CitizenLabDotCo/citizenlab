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
    cy.get('[data-cy="e2e-projects"]').should(($el) => {
      const text = $el.text();
      expect(text).to.match(regex);
    });
  });

  it('updates homepage banner correctly', () => {
    cy.intercept('PATCH', '**/home_page').as('saveHomePage');
    cy.intercept('GET', '**/home_page').as('getHomePage');
    cy.intercept('GET', '**/pages-menu').as('getPages');
    cy.intercept('GET', '**/nav_bar_items').as('getNavbarItems');
    cy.intercept('POST', '**/content_builder_layout_images').as('postImage');

    // Check homepage defaults signed - out
    cy.visit('/');
    cy.get('[data-cy="e2e-homepage-banner"]').should('exist');
    cy.get('[data-cy="e2e-full-width-banner-layout-container"]').should(
      'exist'
    );

    cy.get('[data-cy="e2e-full-width-banner-layout-header-image"]').should(
      'have.css',
      'background-image',
      'none'
    );
    const signedOutHeaderEnglish =
      /Let’s shape the future of New Douglaschester together/gi;
    const signedOutSubheaderEnglish =
      /Welcome to the participation platform of/gi;

    cy.get('#hook-header-content').should(($el) => {
      const text = $el.text();
      expect(text).to.match(signedOutHeaderEnglish);
    });

    cy.get('#hook-header-content').should(($el) => {
      const text = $el.text();
      expect(text).to.match(signedOutSubheaderEnglish);
    });

    cy.get('#hook-header-content')
      .find('[data-testid=avatarBubblesContainer]')
      .should('exist');

    cy.get('[data-cy=e2e-full-width-layout-header-image-overlay]').should(
      'exist'
    );
    cy.get('[data-cy=e2e-full-width-layout-header-image-overlay]').should(
      'have.css',
      'background-color',
      'rgb(10, 81, 89)'
    );
    cy.get('[data-cy=e2e-full-width-layout-header-image-overlay]').should(
      'have.css',
      'opacity',
      '0.9'
    );

    // Check homepage defaults signed - in
    cy.setAdminLoginCookie();
    const signedInHeaderEnglish = /is listening to you/gi;
    cy.visit('/');
    cy.get('.e2e-signed-in-header').should('exist');
    cy.get('#e2e-signed-in-header-default-cta').should(($el) => {
      const text = $el.text();
      expect(text).to.match(signedInHeaderEnglish);
    });
    cy.get("[data-cy='e2e-signed-in-header-image-overlay']").should(
      'have.css',
      'background-color',
      'rgb(10, 81, 89)'
    );
    cy.get("[data-cy='e2e-signed-in-header-image-overlay']").should(
      'have.css',
      'opacity',
      '0.9'
    );

    cy.get("[data-cy='e2e-signed-in-header-image']").should('not.exist');

    // go to admin page
    cy.visit('/admin/pages-menu/homepage-builder');

    // Update homepage banner

    cy.visit('/admin/pages-menu/homepage-builder');
    cy.wait('@getHomePage');
    cy.get('[data-cy="e2e-homepage-banner"]').click({
      force: true,
    });
    // Update image
    cy.get('#bannerImage').attachFile('testimage.png');
    cy.wait('@postImage');
    cy.wait(1000);

    // Update avatar bubbles
    cy.get('[data-cy="e2e-banner-avatar-toggle"]').find('i').click();

    // Save homepage

    cy.get('#e2e-content-builder-topbar-save').click({
      force: true,
    });
    cy.wait('@saveHomePage');
    cy.wait(1000);

    // Check updated content signed - in
    cy.visit('/');
    cy.get("[data-cy='e2e-signed-in-header-image']").should('exist');

    // Check updated content signed - out
    cy.logout();
    cy.visit('/');
    cy.get('[data-cy="e2e-homepage-banner"]').should('exist');
    cy.get('[data-cy="e2e-full-width-banner-layout-container"]').should(
      'exist'
    );

    cy.get('[data-cy="e2e-full-width-banner-layout-header-image"]')
      .should('have.css', 'background-image')
      .and('include', '.png');

    cy.get('#hook-header-content')
      .find('[data-testid=avatarBubblesContainer]')
      .should('not.exist');

    // Layout checks
    // cy.get('[data-cy="e2e-fixed-ratio-layout-option"]').click();

    // cy.get('[data-cy="e2e-homepage-banner"]').should('exist');
    // cy.get('[data-cy="e2e-fixed-ratio-layout-container"]').should('exist');

    // // Two row layout
    // cy.setAdminLoginCookie();
    // cy.visit('/admin/pages-menu/homepage-builder');
    // cy.get('[data-cy="e2e-homepage-banner"]').click({
    //   force: true,
    // });
    // cy.get('[data-cy="e2e-two-row-layout-option"]').click();
    // cy.get('#e2e-content-builder-topbar-save').click();
    // cy.wait('@saveHomePage');

    // cy.logout();
    // cy.visit('/');
    // cy.get('[data-cy="e2e-homepage-banner"]').should('exist');
    // cy.get('[data-cy="e2e-two-row-layout-container"]').should('exist');
  });
});
