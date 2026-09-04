import { randomString } from '../../support/commands';

// File attachments resolve through the layout's own attachments rather than their node's
// fileId, so they fail silently in the front office when that context is missing.
describe('Custom page builder display', () => {
  const pageTitle = randomString();
  const topInfoText = randomString();
  const bottomInfoText = randomString();

  let pageId = '';
  let pageSlug = '';

  const setBuilderFeature = (enabled: boolean) =>
    cy.apiUpdateAppConfiguration({
      settings: { custom_page_builder: { allowed: true, enabled } },
    });

  before(() => {
    cy.setAdminLoginCookie();

    // Created with the flag off, so no layout is provisioned and the page is shaped like the
    // legacy pages the migration has to cope with: content in the columns, no craftjs graph.
    setBuilderFeature(false);

    cy.apiCreateCustomPage(pageTitle).then((page) => {
      pageId = page.body.data.id;
      pageSlug = page.body.data.attributes.slug;

      cy.apiUpdateCustomPage(pageId, {
        top_info_section_enabled: true,
        top_info_section_multiloc: { en: `<p>${topInfoText}</p>` },
        bottom_info_section_enabled: true,
        bottom_info_section_multiloc: { en: `<p>${bottomInfoText}</p>` },
        files_section_enabled: true,
      });

      cy.apiAddFileToCustomPage(pageId, 'example.pdf', 'example.pdf');
    });
  });

  after(() => {
    setBuilderFeature(false);
    if (pageId) cy.apiRemoveCustomPage(pageId);
  });

  it('renders the legacy sections while the feature is off', () => {
    setBuilderFeature(false);
    cy.visit(`/pages/${pageSlug}`);

    cy.contains(topInfoText).should('be.visible');
    cy.contains(bottomInfoText).should('be.visible');
  });

  it('derives the page content into the builder, attachments included', () => {
    setBuilderFeature(true);
    cy.setAdminLoginCookie();
    cy.visit(`/admin/custom-page-builder/pages/${pageId}`);

    // The builder bootstraps a layout on its first open, derived from the columns above.
    cy.get('div#ROOT');
    cy.contains(topInfoText).should('be.visible');
    cy.contains(bottomInfoText).should('be.visible');
    cy.get('#e2e-file-attachment').contains('example.pdf').should('be.visible');
  });

  it('offers the page’s own files in the widget settings', () => {
    setBuilderFeature(true);
    cy.setAdminLoginCookie();
    cy.visit(`/admin/custom-page-builder/pages/${pageId}`);
    cy.get('div#ROOT');

    // The widget takes no pointer events in the builder, so select the node around it.
    cy.get('#e2e-file-attachment')
      .parents('.e2e-render-node')
      .first()
      .click({ force: true });

    cy.dataCy('e2e-file-attachment-file-select').should('exist');
    cy.contains('Upload files to page').should('be.visible');
  });

  it('renders the saved layout in the front office, attachment included', () => {
    setBuilderFeature(true);
    cy.setAdminLoginCookie();
    cy.visit(`/admin/custom-page-builder/pages/${pageId}`);
    cy.get('div#ROOT');

    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait(1000);

    cy.visit(`/pages/${pageSlug}`);

    // The load-bearing assertion: without the layout context this renders as nothing at all.
    cy.get('#e2e-file-attachment').contains('example.pdf').should('be.visible');
    cy.contains(topInfoText).should('be.visible');
    cy.contains(bottomInfoText).should('be.visible');
  });
});
