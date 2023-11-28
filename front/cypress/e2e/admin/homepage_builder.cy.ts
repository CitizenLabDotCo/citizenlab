describe('Homepage builder', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
  });
  it('updates homepage builder content correctly', () => {
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

    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveHomePage');
    cy.visit(`/`);
    cy.get('#e2e-two-column').should('exist');
    cy.get('div.e2e-text-box').should('have.length', 2);
    cy.get('div.e2e-text-box').first().should('contain', 'first text');
    cy.get('div.e2e-text-box').last().should('contain', 'last text');
  });
  it('deletes homepage builder content correctly', () => {
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

    cy.get('#e2e-two-column').should('be.visible');

    cy.get('#e2e-two-column').click('top');
    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveHomePage');
    cy.visit(`/`);
    cy.get('#e2e-two-column').should('not.exist');
    cy.get('div.e2e-text-box').should('not.exist');
  });
});
