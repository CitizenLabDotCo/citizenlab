import { randomString } from '../../../support/commands';

describe.skip('Admin: create, update, and view custom page', () => {
  let customPageId: string;

  after(() => {
    cy.apiRemoveCustomPage(customPageId);
  });

  it('creates a custom page successfully', () => {
    cy.intercept('PATCH', '**/static_pages/**').as('updateCustomPage');
    cy.intercept('POST', '**/static_pages').as('createCustomPage');

    const pageName = randomString();
    const headerContent = randomString();
    const subheaderContent = randomString();
    const ctaContent = randomString();
    const topInfoContent = randomString();

    // log in as admin, visit the pages and menu section in admin
    cy.setAdminLoginCookie();
    cy.visit('/admin/pages-menu/');
    cy.acceptCookies();

    // go to custom page creation form
    cy.get('#create-custom-page').click();

    // type title in each language

    cy.get('.e2e-localeswitcher').each((button) => {
      cy.wrap(button).click();
      cy.get('#title_multiloc').type(pageName);
    });

    // submit
    cy.get('[data-cy="e2e-submit-custom-page"]').click();

    // intercept the response and save the ID of the new page
    cy.wait('@createCustomPage').then((interception) => {
      customPageId = interception.response?.body.data.id;
    });

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

    // check for section enabled banner and check that enable button is not present
    cy.contains('Shown on page').should('exist');
    cy.get('[data-cy="e2e-submit-wrapper-secondary-submit-button"]').should(
      'not.exist'
    );

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

    // enter button multiloc content
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

    // go to top info section edit page
    cy.get(
      '[data-cy="e2e-admin-edit-button-top_info_section_enabled"]'
    ).click();

    // check for enabled banner to exist
    cy.contains('Shown on page').should('exist');

    // fill out top info section
    cy.get('[data-cy="e2e-top-info-form"]')
      .find('.e2e-localeswitcher')
      .each((button) => {
        cy.wrap(button).click();
        cy.get('#top_info_section_multiloc-en').type(topInfoContent);
        cy.wrap(button).get('.notEmpty');
      });

    // submit
    cy.get('[data-cy="e2e-top-info-section-submit"]').click();

    // scroll to breadcrumbs, go back to main page
    cy.get(`[data-cy="breadcrumbs-${pageName}"]`).click();

    // go to attachments section edit page
    cy.get('[data-cy="e2e-admin-edit-button-files_section_enabled"]').click();

    // drop an example pdf file and wait for it to be uploaded
    cy.get('#local_page_files').selectFile('cypress/fixtures/example.pdf');
    cy.contains('example.pdf');

    // submit
    cy.get('[data-cy="e2e-attachments-section-submit"]').click();

    // wait for success toast
    cy.get('[data-testid="feedbackSuccessMessage"');

    //  go back to main page
    cy.get(`[data-cy="breadcrumbs-${pageName}"]`).click();

    // turn off top info section again
    cy.get(
      `[data-cy="e2e-admin-section-toggle-top_info_section_enabled"]`
    ).click();
    // wait for the call to complete
    cy.wait('@updateCustomPage');

    // wait for the toggle to become enabled in the UI
    cy.get(`[data-cy="e2e-admin-section-toggle-top_info_section_enabled"]`)
      .find('i')
      .should('have.class', 'enabled');

    // go to top info section edit page
    cy.get(
      '[data-cy="e2e-admin-edit-button-top_info_section_enabled"]'
    ).click();

    // check that the section is now disabled
    cy.contains('Not shown on page').should('exist');

    // enable it via the save + enable button
    cy.get('[data-cy="e2e-top-info-section-secondary-submit"]').click();

    // wait for the badge showing that it was enabled
    cy.contains('Shown on page').should('exist');

    // visit our custom page by slug
    cy.visit(`/en/pages/${pageName}`);

    // check for presence of image in header and text content
    cy.get('[data-cy="e2e-header-image-background"]')
      .should('have.attr', 'src')
      .should('include', '.png');
    cy.contains(headerContent);
    cy.contains(subheaderContent);
    cy.contains(ctaContent);
    cy.contains(topInfoContent);
    cy.contains('example.pdf');
  });
});
