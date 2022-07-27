import { randomString } from '../../../support/commands';

describe('Admin: update HomePage content', () => {
  before(() => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/pages-menu/');
    cy.acceptCookies();
  });

  it('updates top and bottom info section content and visibility', () => {
    cy.intercept('PATCH', '**/home_page').as('saveHomePage');
    cy.intercept('GET', '**/home_page').as('getHomePage');

    const topInfoContent = randomString();
    const bottomInfoContent = randomString();

    cy.apiUpdateHomepageSettings({
      top_info_section_enabled: false,
      bottom_info_section_enabled: false,
      events_widget_enabled: false,
    });
    // go to page with homepage settings toggles
    cy.get('[data-testid="edit-button"]').first().click();

    // visit top into section edit page
    cy.get('[data-cy="e2e-admin-edit-button"]').eq(1).click();
    cy.get('#custom-section-en').clear().type(topInfoContent);
    cy.get('.e2e-submit-wrapper-button').click();

    // // go back home
    cy.get('[data-cy="breadcrumbs-Home"]').click();

    // // visit bottom into section edit page
    cy.get('[data-cy="e2e-admin-edit-button"]').eq(2).click();
    cy.get('#custom-section-en').clear().type(bottomInfoContent);
    cy.get('.e2e-submit-wrapper-button').click();

    cy.visit('/');

    cy.get('[data-testid="e2e-landing-page-top-info-section"]').should(
      'not.exist'
    );
    cy.get('[data-testid="e2e-landing-page-bottom-info-section"]').should(
      'not.exist'
    );
    cy.get('[data-testid="e2e-events-widget-container"]').should('not.exist');

    cy.visit('/admin/pages-menu/');
    cy.get('[data-testid="edit-button"]').first().click();

    // toggle top and bottom info sections
    cy.get(
      '[data-cy="e2e-admin-section-toggle-top_info_section_enabled"]'
    ).click();
    cy.wait('@saveHomePage');
    cy.wait('@getHomePage');
    cy.wait(1000);
    cy.get(
      '[data-cy="e2e-admin-section-toggle-bottom_info_section_enabled"]'
    ).click();
    cy.wait('@saveHomePage');
    cy.wait('@getHomePage');
    cy.wait(1000);
    cy.get(
      '[data-cy="e2e-admin-section-toggle-events_widget_enabled"]'
    ).click();
    cy.wait('@saveHomePage');
    cy.wait('@getHomePage');
    cy.wait(1000);

    // go back to homepage and see that the content is there correctly
    cy.visit('/');
    cy.contains(topInfoContent);
    cy.contains(bottomInfoContent);
    cy.get('[data-testid="e2e-events-widget-container"]').should('exist');
  });
});
