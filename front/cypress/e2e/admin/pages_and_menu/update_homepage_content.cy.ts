import { randomString } from '../../../support/commands';

const seedLanguages = ['en', 'nl-BE', 'nl-NL', 'fr-BE'];

describe('Admin: update HomePage content', () => {
  before(() => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/pages-menu/');
    cy.acceptCookies();
    cy.apiUpdateHomepageSettings({
      top_info_section_enabled: false,
      bottom_info_section_enabled: false,
      events_widget_enabled: false,
    });
  });

  it('updates top and bottom info section content and visibility', () => {
    cy.intercept('PATCH', '**/home_page').as('saveHomePage');
    cy.intercept('GET', '**/home_page').as('getHomePage');

    const topInfoContent = randomString();
    const bottomInfoContent = randomString();

    // go to page with homepage settings toggles
    cy.get('[data-testid="edit-button"]').first().click();

    // visit top into section edit page
    cy.get('[data-cy="e2e-admin-edit-button"]').eq(1).click();
    seedLanguages.forEach((language) => {
      cy.get(`.${language}`).click();
      cy.get('#top_info_section_multiloc-en').clear().type(topInfoContent);
    });
    cy.get('[data-cy="e2e-top-info-section-submit"').click();

    // // go back home
    cy.get('[data-cy="breadcrumbs-Home"]').click();

    // // visit bottom into section edit page
    cy.get('[data-cy="e2e-admin-edit-button"]').eq(2).click();
    seedLanguages.forEach((language) => {
      cy.get(`.${language}`).click();
      cy.get('#bottom_info_section_multiloc-en')
        .clear()
        .type(bottomInfoContent);
    });
    cy.get('[data-cy="e2e-bottom-info-section-submit"').click();

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

    // toggle top info section and wait for requests to complete
    cy.get(
      '[data-cy="e2e-admin-section-toggle-top_info_section_enabled"]'
    ).click();
    cy.wait('@saveHomePage');

    // wait for the next toggle to become disabled, then enabled again once it finishes toggling
    cy.get('[data-cy="e2e-admin-section-toggle-bottom_info_section_enabled"]')
      .find('i')
      .should('have.class', 'disabled');
    cy.get('[data-cy="e2e-admin-section-toggle-bottom_info_section_enabled"]')
      .find('i')
      .should('have.class', 'enabled');

    // click bottom info section toggle and wait for requests to complete
    cy.get(
      '[data-cy="e2e-admin-section-toggle-bottom_info_section_enabled"]'
    ).click();
    cy.wait('@saveHomePage');

    // wait for the next toggle to become disabled, then enabled again once it finishes toggling
    cy.get('[data-cy="e2e-admin-section-toggle-events_widget_enabled"]')
      .find('i')
      .should('have.class', 'disabled');
    cy.get('[data-cy="e2e-admin-section-toggle-events_widget_enabled"]')
      .find('i')
      .should('have.class', 'enabled');

    // toggle events section and wait for requests to complete
    cy.get(
      '[data-cy="e2e-admin-section-toggle-events_widget_enabled"]'
    ).click();
    cy.wait('@saveHomePage');

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
