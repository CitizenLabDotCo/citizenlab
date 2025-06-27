import { randomString } from '../../../support/commands';

describe('Admin: can', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/pages-menu/');
    cy.acceptCookies();
  });

  describe('create', () => {
    const page1 = randomString(4);
    let customPageId1: string;

    after(() => {
      if (customPageId1) {
        cy.apiRemoveCustomPage(customPageId1);
      }
    });

    it('and view a custom page successfully', () => {
      cy.intercept('POST', '**/static_pages').as('createCustomPage');

      cy.visit('/admin/pages-menu/');

      // go to custom page creation form
      cy.get('#create-custom-page').click();

      // type title in each language
      cy.clickLocaleSwitcherAndType(page1);

      // submit
      cy.dataCy('e2e-submit-custom-page').click();

      cy.wait('@createCustomPage').then((interception) => {
        customPageId1 = interception.response?.body.data.id;
      });

      // visit our custom page by slug
      cy.visit(`/en/pages/${page1}`);
      cy.contains(page1).should('exist');
    });
  });

  describe('edit or add', () => {
    const page2 = randomString(4);
    const page3 = randomString(4);
    const page4 = randomString(4);
    let customPageId2: string;
    let customPageId3: string;
    let customPageId4: string;
    const headerContent = randomString();
    const subheaderContent = randomString();
    const ctaContent = randomString();
    const topInfoContent = randomString();

    before(() => {
      cy.apiCreateCustomPage(page2).then((page) => {
        customPageId2 = page.body.data.id;
      });
      cy.apiCreateCustomPage(page3).then((page) => {
        customPageId3 = page.body.data.id;
      });
      cy.apiCreateCustomPage(page4).then((page) => {
        customPageId4 = page.body.data.id;
      });
    });

    after(() => {
      [customPageId2, customPageId3, customPageId4].forEach((id) => {
        if (id) {
          cy.apiRemoveCustomPage(id);
        }
      });
    });

    it('custom page banner and view it', () => {
      cy.intercept('PATCH', '**/static_pages/**').as('updateCustomPage');

      cy.visit(`/en/admin/pages-menu/pages/${customPageId2}/content`);

      // toggle banner section
      cy.dataCy('e2e-admin-section-toggle-banner_enabled').click();
      // wait for the call to complete
      cy.wait('@updateCustomPage');
      // wait for the toggle to become enabled in the UI
      cy.dataCy('e2e-admin-section-toggle-banner_enabled')
        .find('i')
        .should('have.class', 'enabled');

      // go to the hero banner edit
      cy.dataCy('e2e-admin-edit-button-banner_enabled').click();

      // check for section enabled banner and check that enable button is not present
      cy.contains('Shown on page').should('exist');
      cy.dataCy('e2e-submit-wrapper-secondary-submit-button').should(
        'not.exist'
      );

      // focus the header dropzone and drop an image onto it
      cy.get('#header-dropzone').attachFile('icon.png', {
        subjectType: 'drag-n-drop',
      });

      // update the header text
      cy.dataCy('e2e-signed-out-header-section').scrollIntoView();
      cy.dataCy('e2e-signed-out-header-section')
        .find('.e2e-localeswitcher')
        .each((button) => {
          cy.wrap(button).click();
          cy.dataCy('e2e-signed-out-header-section')
            .find('input')
            .type(headerContent);
        });

      // update the subheader text
      cy.dataCy('e2e-signed-out-subheader-section').scrollIntoView();
      cy.dataCy('e2e-signed-out-subheader-section')
        .find('.e2e-localeswitcher')
        .each((button) => {
          cy.wrap(button).click();
          cy.dataCy('e2e-signed-out-subheader-section')
            .find('input')
            .type(subheaderContent);
        });

      // enable custom button
      cy.dataCy('e2e-cta-settings-custom-customized_button').click();

      // enter button multiloc content
      cy.dataCy('e2e-cta-settings-custom-customized_button')
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
      cy.get('.e2e-submit-wrapper-button button').click();

      cy.visit(`/en/pages/${page2}`);

      cy.dataCy('e2e-header-image-background')
        .should('have.attr', 'src')
        .should('include', '.png');
      cy.contains(headerContent);
      cy.contains(subheaderContent);
      cy.contains(ctaContent);
    });

    it('custom page top info section and view it', () => {
      cy.intercept('PATCH', '**/static_pages/**').as('updateCustomPage');

      cy.visit(`/en/admin/pages-menu/pages/${customPageId3}/content`);

      // toggle top info section
      cy.dataCy('e2e-admin-section-toggle-top_info_section_enabled').click();
      // wait for the call to complete
      cy.wait('@updateCustomPage');
      // wait for the toggle to become enabled in the UI
      cy.dataCy('e2e-admin-section-toggle-top_info_section_enabled')
        .find('i')
        .should('have.class', 'enabled');

      // go to top info section edit page
      cy.dataCy('e2e-admin-edit-button-top_info_section_enabled').click();

      cy.contains('Shown on page').should('exist');

      // fill out top info section
      cy.dataCy('e2e-top-info-form')
        .find('.e2e-localeswitcher')
        .each((button) => {
          cy.wrap(button).click();
          cy.get('#top_info_section_multiloc-en').type(topInfoContent);
          cy.wrap(button).get('.notEmpty');
        });

      // submit
      cy.dataCy('e2e-top-info-section-submit').click();

      // scroll to breadcrumbs, go back to main page to test enabling it differently
      cy.visit(`/en/admin/pages-menu/pages/${customPageId3}/content`);
      // turn off top info section again
      cy.get(
        `[data-cy="e2e-admin-section-toggle-top_info_section_enabled"]`
      ).click();
      // wait for the call to complete
      cy.wait('@updateCustomPage');

      // go to top info section edit page
      cy.dataCy('e2e-admin-edit-button-top_info_section_enabled').click();

      // check that the section is now disabled
      cy.contains('Not shown on page').should('exist');

      // enable it via the save + enable button
      cy.dataCy('e2e-top-info-section-secondary-submit').click();

      // wait for the badge showing that it was enabled
      cy.contains('Shown on page').should('exist');

      cy.visit(`/en/pages/${page3}`);

      // check that top info section content is present
      cy.contains(topInfoContent);
    });

    it('custom page attachments and view them', () => {
      cy.intercept('PATCH', '**/static_pages/**').as('updateCustomPage');
      cy.intercept('POST', `**/static_pages/${customPageId4}/files`).as(
        'addFiles'
      );
      cy.intercept('GET', `**/static_pages/${customPageId4}/files`).as(
        'getFiles'
      );

      cy.visit(`/en/admin/pages-menu/pages/${customPageId4}/content`);

      // wait for toggle to be visible
      cy.dataCy('e2e-admin-section-toggle-files_section_enabled');
      cy.wait(1000);

      // toggle attachments section
      cy.get(
        '[data-cy="e2e-admin-section-toggle-files_section_enabled"] > div'
      ).click();

      // wait for the call to complete
      cy.wait('@updateCustomPage');

      // wait for the toggle to become enabled in the UI
      cy.dataCy('e2e-admin-section-toggle-files_section_enabled')
        .find('i')
        .should('have.class', 'enabled');

      // go to attachments section edit page
      cy.wait(1000);
      cy.dataCy('e2e-admin-edit-button-files_section_enabled').click();

      cy.contains('Shown on page').should('exist');

      cy.get('#local_page_files').should('exist');
      cy.wait('@getFiles');

      cy.wait(2000);
      cy.get('#local_page_files').selectFile('cypress/fixtures/example.pdf', {
        force: true,
      });

      cy.wait(2000);
      cy.dataCy('e2e-file-uploader-container').should('exist');
      cy.dataCy('e2e-file-uploader-container').contains('example.pdf');

      // submit
      cy.dataCy('e2e-attachments-section-submit').click();

      cy.wait('@addFiles');
      cy.get('[data-testid="feedbackSuccessMessage"');

      cy.visit(`/en/pages/${page4}`);
      cy.wait(1000);
      cy.contains('example.pdf');
    });
  });
});
