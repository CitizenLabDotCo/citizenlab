import { curry } from 'cypress/types/lodash';
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
    const headerContent = randomString();
    const subheaderContent = randomString();
    const ctaContent = randomString();
    const topInfoContent = randomString();

    // go to custom page creation form
    cy.get('#create-custom-page').click();

    // type title in each language
    cy.get('.e2e-localeswitcher').each((button) => {
      cy.wrap(button).click();
      cy.get('#title_multiloc').type(pageName);
    });

    // submit
    cy.get('[data-cy="submit-custom-page"]').click();

    // click the page content tab
    cy.contains('Page content').click();

    const sectionNames = [
      'banner_enabled',
      'top_info_section_enabled',
      'files_section_enabled',
    ];
    // toggle top info section and wait for requests to complete
    sectionNames.forEach((sectionName) => {
      // click the toggle
      cy.get(`[data-cy="e2e-admin-section-toggle-${sectionName}"]`).click();
      // wait for the call to complete
      cy.wait('@updateCustomPage');
      // wait for the toggle to become enabled in the UI
      cy.get(`[data-cy="e2e-admin-section-toggle-${sectionName}"]`)
        .find('i')
        .should('have.class', 'enabled');
    });

    // go to the hero banner edit
    cy.get('[data-cy="e2e-admin-edit-button-banner_enabled"]').click();

    // focus the header dropzone and drop an image onto it
    cy.get('#header-dropzone').attachFile('icon.png', {
      subjectType: 'drag-n-drop',
    });

    // update the header text
    cy.get('[data-cy="e2e-signed-out-header-section"]').scrollIntoView();
    cy.get('[data-cy="e2e-signed-out-header-section"]')
      .find('.e2e-localeswitcher')
      .each((button) => {
        cy.wrap(button).click();
        cy.get('[data-cy="e2e-signed-out-header-section"]')
          .find('input')
          .type(headerContent);
      });

    // update the subheader text
    cy.get('[data-cy="e2e-signed-out-subheader-section"]').scrollIntoView();
    cy.get('[data-cy="e2e-signed-out-subheader-section"]')
      .find('.e2e-localeswitcher')
      .each((button) => {
        cy.wrap(button).click();
        cy.get('[data-cy="e2e-signed-out-subheader-section"]')
          .find('input')
          .type(subheaderContent);
      });

    // enable custom button
    cy.get('[data-cy="e2e-cta-settings-custom-customized_button"]').click();

    cy.get('[data-cy="e2e-cta-settings-custom-customized_button"]')
      .find('.e2e-localeswitcher')
      .each((button) => {
        cy.wrap(button).click();
        cy.get('[data-testid="inputMultilocLocaleSwitcher"]')
          .find('input')
          .type(ctaContent);
      });

    // type the url
    cy.get('#buttonConfigInput').type('https://www.coolwebsite.biz');

    // submit form
    cy.get('.e2e-submit-wrapper-button').click();

    // scroll to breadcrumbs, go back to main page
    cy.get(`[data-cy="breadcrumbs-${pageName}"]`).click();

    // to do: test color and opacity
    // go to top info section edit page
    cy.get(
      '[data-cy="e2e-admin-edit-button-top_info_section_enabled"]'
    ).click();

    // fill out top info section
    cy.get('[data-cy="e2e-top-info-form"]')
      .find('.e2e-localeswitcher')
      .each((button) => {
        cy.wrap(button).click();
        // to do- remove locale from id, it doesn't work
        cy.get('#top_info_section_multiloc-en').type(topInfoContent);
        cy.wrap(button).get('.notEmpty');
      });

    // submit
    cy.get('[data-cy="e2e-top-info-section-submit"]').click();

    // wait for success toast
    cy.get('[data-testid="feedbackSuccessMessage"');

    //  go back to main page
    cy.get(`[data-cy="breadcrumbs-${pageName}"]`).click();

    // visit our customm page by slug
    cy.visit(`/en/pages/${pageName}`);

    // to do - test attachments (same way as drag and drop image, but has to not be png)
    // to do - find a way to check that the icon.png image was properly uploaded
    cy.contains(headerContent);
    cy.contains(subheaderContent);
    cy.contains(ctaContent);
    cy.contains(topInfoContent);
  });
});
