import { randomString } from '../../../support/commands';

describe('Admin: update HomePage content', () => {
  before(() => {
    cy.apiUpdateHomepageSettings({
      top_info_section_enabled: false,
      bottom_info_section_enabled: false,
      events_widget_enabled: false,
    });
  });

  beforeEach(() => {
    cy.setLoginCookie('admin@citizenlab.co', 'democracy2.0');
  });

  it('updates top and bottom info section content and visibility', () => {
    cy.intercept('PATCH', '**/home_page').as('saveHomePage');
    cy.intercept('GET', '**/home_page').as('getHomePage');

    const topInfoContent = randomString();
    const bottomInfoContent = randomString();

    // go to admin page
    cy.visit('/admin/pages-menu/');
    cy.acceptCookies();

    // go to page with homepage settings toggles
    cy.get('[data-cy="e2e-navbar-item-edit-button"]').first().click();

    // visit top into section edit page
    cy.get('[data-cy="e2e-admin-edit-button"]').eq(1).click();
    cy.get('.e2e-localeswitcher').each((el) => {
      cy.wrap(el).click();
      cy.get('#top_info_section_multiloc-en').clear();
      cy.get('#top_info_section_multiloc-en').type(topInfoContent);
      cy.get('#top_info_section_multiloc-en').should('contain', topInfoContent);
    });

    // submit form and wait for success toast
    cy.get('[data-cy="e2e-top-info-section-submit"').click();
    cy.contains('Top info section saved').should('exist');

    // go back home
    cy.get('[data-cy="breadcrumbs-Home"]').click();

    // visit bottom into section edit page
    cy.get('[data-cy="e2e-admin-edit-button"]').eq(2).click();

    // update content for each language
    cy.get('.e2e-localeswitcher').each((el) => {
      cy.wrap(el).click();
      cy.get('#bottom_info_section_multiloc-en').clear();
      cy.get('#bottom_info_section_multiloc-en').type(bottomInfoContent);
      cy.get('#bottom_info_section_multiloc-en').should(
        'contain',
        bottomInfoContent
      );
    });

    // submit form and wait for success toast
    cy.get('[data-cy="e2e-bottom-info-section-submit"').click();
    cy.contains('Bottom info section saved').should('exist');

    // go to homepage and check that the content isn't there until sections are enabled
    cy.visit('/');
    cy.get('[data-testid="e2e-landing-page-top-info-section"]').should(
      'not.exist'
    );
    cy.get('[data-testid="e2e-landing-page-bottom-info-section"]').should(
      'not.exist'
    );
    cy.get('[data-testid="e2e-events-widget-container"]').should('not.exist');

    // go back to admin page
    cy.visit('/admin/pages-menu/');

    // go to homepage edit section
    cy.get('[data-cy="e2e-navbar-item-edit-button"]').first().click();

    // toggle top info section and wait for requests to complete
    cy.get(
      '[data-cy="e2e-admin-section-toggle-top_info_section_enabled"]'
    ).click();
    cy.wait('@saveHomePage');

    // wait for the bottom info section toggle to be enabled when the request finishes
    cy.get('[data-cy="e2e-admin-section-toggle-bottom_info_section_enabled"]')
      .find('i')
      .should('have.class', 'enabled');

    // click bottom info section toggle and wait for requests to complete
    cy.get(
      '[data-cy="e2e-admin-section-toggle-bottom_info_section_enabled"]'
    ).click();
    cy.wait('@saveHomePage');

    // wait for the events toggle to become enabled after the request completes
    cy.get('[data-cy="e2e-admin-section-toggle-events_widget_enabled"]')
      .find('i')
      .should('have.class', 'enabled');

    // toggle events section and wait for requests to complete
    cy.get(
      '[data-cy="e2e-admin-section-toggle-events_widget_enabled"]'
    ).click();
    cy.wait('@saveHomePage');

    // wait for the toggle to be enabled on the UI again
    cy.get('[data-cy="e2e-admin-section-toggle-events_widget_enabled"]')
      .find('i')
      .should('have.class', 'enabled');

    // go back to homepage and see that the content is there correctly
    cy.visit('/');
    cy.contains(topInfoContent);
    cy.contains(bottomInfoContent);
    cy.get('[data-testid="e2e-events-widget-container"]').should('exist');
  });

  after(() => {
    cy.apiUpdateHomepageSettings({
      top_info_section_enabled: false,
      bottom_info_section_enabled: false,
      events_widget_enabled: false,
    });
  });
});
