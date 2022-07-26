import { randomString } from '../../../support/commands';

describe('Admin: update HomePage content', () => {
  before(() => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/pages-menu/');
    cy.acceptCookies();
    cy.wait(1000);
  });

  it('updates top and bottom info section content and visibility', () => {
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
    cy.get(
      '[data-testid="admin-edit-button-top_info_section_enabled"]'
    ).click();
    cy.get('#custom-section-en').clear().type(topInfoContent);
    cy.get('[data-testid="top-info-section-submit"]').click();

    // // go back home
    cy.get('[data-testid="breadcrumbs-Home"]').click();

    // // visit bottom into section edit page
    cy.get(
      '[data-testid="admin-edit-button-bottom_info_section_enabled"]'
    ).click();
    cy.get('#custom-section-en').clear().type(bottomInfoContent);
    cy.get('[data-testid="bottom-info-section-submit"]').click();

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
    cy.get('[data-testid="top_info_section_enabled-toggle"]').click();
    cy.wait(1000);
    cy.get('[data-testid="bottom_info_section_enabled-toggle"]').click();
    cy.wait(1000);
    cy.get('[data-testid="events_widget_enabled-toggle"]').click();
    cy.wait(1000);

    // go back to homepage and see that the content is there correctly
    cy.visit('/');
    cy.get('[data-testid="e2e-landing-page-top-info-section"]').contains(
      topInfoContent
    );
    cy.get('[data-testid="e2e-landing-page-bottom-info-section"]').contains(
      bottomInfoContent
    );
    cy.get('[data-testid="e2e-events-widget-container"]').should('exist');
  });
});
