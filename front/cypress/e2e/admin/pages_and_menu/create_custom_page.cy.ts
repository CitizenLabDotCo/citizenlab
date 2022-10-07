import { randomString } from '../../../support/commands';

describe('Admin: create custom page', () => {
  before(() => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/pages-menu/');
    cy.acceptCookies();
  });

  it('creates a custom page successfully', () => {
    cy.intercept('POST', '**/static_pages/**').as('createCustomPage');
    cy.intercept('PATCH', '**/static_pages/**').as('updateCustomPage');
    cy.intercept('GET', '**/static_pages/**').as('getCustomPage');

    const pageName = randomString();
    const topInfoContent = randomString();
    const bottomInfoContent = randomString();

    // go to custom page creation form
    cy.get('#create-custom-page').click();

    // type title in each language
    cy.get('.e2e-localeswitcher').each((button) => {
      cy.wrap(button).click();
      cy.get('#title_multiloc').type(pageName);
    });

    // submit
    cy.get('#submit-custom-page').click();

    // click the page content tab
    cy.contains('Page content').click();

    const sectionNames = [
      'banner_enabled',
      'top_info_section_enabled',
      'files_section_enabled',
    ];
    // toggle top info section and wait for requests to complete
    sectionNames.forEach((sectionName) => {
      cy.get(`[data-cy="e2e-admin-section-toggle-${sectionName}"]`).click();
      cy.wait('@updateCustomPage');
      // wait for the next toggle to become disabled, then enabled again once it finishes toggling
      cy.get(`[data-cy="e2e-admin-section-toggle-${sectionName}"]`)
        .find('i')
        .should('have.class', 'enabled');
    });

    // // // go back home
    // cy.get('[data-cy="breadcrumbs-Home"]').click();

    // // // visit bottom into section edit page
    // cy.get('[data-cy="e2e-admin-edit-button"]').eq(2).click();
    // seedLanguages.forEach((language) => {
    //   cy.get(`.${language}`).click();
    //   cy.get('#bottom_info_section_multiloc-en')
    //     .clear()
    //     .type(bottomInfoContent);
    // });
    // cy.get('[data-cy="e2e-bottom-info-section-submit"').click();

    // cy.visit('/');

    // cy.get('[data-testid="e2e-landing-page-top-info-section"]').should(
    //   'not.exist'
    // );
    // cy.get('[data-testid="e2e-landing-page-bottom-info-section"]').should(
    //   'not.exist'
    // );
    // cy.get('[data-testid="e2e-events-widget-container"]').should('not.exist');

    // cy.visit('/admin/pages-menu/');
    // cy.get('[data-testid="edit-button"]').first().click();

    // // toggle top info section and wait for requests to complete
    // cy.get(
    //   '[data-cy="e2e-admin-section-toggle-top_info_section_enabled"]'
    // ).click();
    // cy.wait('@saveHomePage');

    // // wait for the next toggle to become disabled, then enabled again once it finishes toggling
    // cy.get('[data-cy="e2e-admin-section-toggle-bottom_info_section_enabled"]')
    //   .find('i')
    //   .should('have.class', 'disabled');
    // cy.get('[data-cy="e2e-admin-section-toggle-bottom_info_section_enabled"]')
    //   .find('i')
    //   .should('have.class', 'enabled');

    // // click bottom info section toggle and wait for requests to complete
    // cy.get(
    //   '[data-cy="e2e-admin-section-toggle-bottom_info_section_enabled"]'
    // ).click();
    // cy.wait('@saveHomePage');

    // // wait for the next toggle to become disabled, then enabled again once it finishes toggling
    // cy.get('[data-cy="e2e-admin-section-toggle-events_widget_enabled"]')
    //   .find('i')
    //   .should('have.class', 'disabled');
    // cy.get('[data-cy="e2e-admin-section-toggle-events_widget_enabled"]')
    //   .find('i')
    //   .should('have.class', 'enabled');

    // // toggle events section and wait for requests to complete
    // cy.get(
    //   '[data-cy="e2e-admin-section-toggle-events_widget_enabled"]'
    // ).click();
    // cy.wait('@saveHomePage');

    // // go back to homepage and see that the content is there correctly
    // cy.visit('/');
    // cy.contains(topInfoContent);
    // cy.contains(bottomInfoContent);
    // cy.get('[data-testid="e2e-events-widget-container"]').should('exist');
  });
});
