import { base64 } from '../../fixtures/base64img';
import { randomString } from '../../support/commands';

// One page carrying everything the builder derives — info sections, an attachment, a filtered
// projects list and events list, a banner — so one derivation on the first builder visit
// serves every check below. The examples build on each other in order, as the flag and the
// paid filtering feature are switched through the run.
describe('Custom page builder', () => {
  const pageTitle = randomString();
  const renamedPageTitle = `Renamed ${randomString()}`;
  const topInfoText = randomString();
  const bottomInfoText = randomString();
  const bannerHeaderText = `Banner ${randomString()}`;
  const areaTitle = randomString();
  const projectTitle = `In area ${randomString()}`;
  const otherProjectTitle = `Outside ${randomString()}`;
  const eventTitle = `Event ${randomString()}`;
  const otherEventTitle = `Other ${randomString()}`;

  let pageId = '';
  let pageSlug = '';
  let projectId = '';
  let otherProjectId = '';
  let areaId = '';
  let filteringWasEnabled = false;

  const setBuilderFeature = (enabled: boolean) =>
    cy.apiUpdateAppConfiguration({
      settings: { custom_page_builder: { allowed: true, enabled } },
    });

  const setFiltering = (enabled: boolean) =>
    cy.apiUpdateAppConfiguration({
      settings: { advanced_custom_pages: { allowed: enabled, enabled } },
    });

  const eventDates = () => ({
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
  });

  // Ready means the toolbox is up as well as the canvas: a click before then selects nothing.
  const openBuilder = () => {
    cy.setAdminLoginCookie();
    cy.visit(`/admin/custom-page-builder/pages/${pageId}`);
    cy.get('div#ROOT');
    cy.get('#e2e-draggable-text');
  };

  // The widgets take no pointer events in the builder, so select the node around them. The
  // layout is fetched more than once while the builder settles, and each refetch
  // re-deserializes the frame and drops the selection, so a click in the first seconds after
  // load is lost: retry until the settings panel is open.
  const selectNodeContaining = (find: () => Cypress.Chainable, attempt = 0) => {
    find()
      .parents('.e2e-render-node')
      .first()
      .scrollIntoView()
      .click({ force: true });
    cy.get('body').then(($body) => {
      if ($body.find('#e2e-content-builder-settings').length > 0) return;
      expect(attempt, 'attempts to select the node').to.be.lessThan(6);
      cy.wait(500);
      selectNodeContaining(find, attempt + 1);
    });
    cy.get('#e2e-content-builder-settings').should('be.visible');
  };

  before(() => {
    cy.setAdminLoginCookie();

    // Created with the builder flag off, so no layout is provisioned and the page is shaped
    // like the legacy pages the migration has to cope with: content in the columns, no graph.
    // Filtering has to be on when the layout is derived, or the lists are not derived at all.
    setBuilderFeature(false);
    cy.apiGetAppConfiguration().then((config) => {
      filteringWasEnabled =
        config.body.data.attributes.settings.advanced_custom_pages?.enabled ===
        true;
    });
    setFiltering(true);

    cy.apiCreateArea(areaTitle).then((area) => {
      areaId = area.body.data.id;

      cy.apiCreateProject({
        title: projectTitle,
        descriptionPreview: projectTitle,
        publicationStatus: 'published',
      }).then((project) => {
        projectId = project.body.data.id;
        cy.apiSetProjectAreas(projectId, [areaId]);
        cy.apiCreateEvent({
          projectId,
          title: eventTitle,
          description: eventTitle,
          location: 'Brussels',
          ...eventDates(),
        });
      });

      // Outside the area, so neither it nor its event may appear once the filter is carried
      // across.
      cy.apiCreateProject({
        title: otherProjectTitle,
        descriptionPreview: otherProjectTitle,
        publicationStatus: 'published',
      }).then((project) => {
        otherProjectId = project.body.data.id;
        cy.apiCreateEvent({
          projectId: otherProjectId,
          title: otherEventTitle,
          description: otherEventTitle,
          location: 'Brussels',
          ...eventDates(),
        });
      });

      cy.apiCreateCustomPage(pageTitle).then((page) => {
        pageId = page.body.data.id;
        pageSlug = page.body.data.attributes.slug;

        cy.apiUpdateCustomPage(pageId, {
          top_info_section_enabled: true,
          top_info_section_multiloc: { en: `<p>${topInfoText}</p>` },
          bottom_info_section_enabled: true,
          bottom_info_section_multiloc: { en: `<p>${bottomInfoText}</p>` },
          files_section_enabled: true,
          projects_enabled: true,
          events_widget_enabled: true,
          projects_filter_type: 'areas',
          area_ids: [areaId],
          banner_enabled: true,
          banner_layout: 'full_width_banner_layout',
          banner_header_multiloc: { en: bannerHeaderText },
          header_bg: base64,
        });

        cy.apiAddFileToCustomPage(pageId, 'example.pdf', 'example.pdf');
      });
    });
  });

  after(() => {
    setBuilderFeature(false);
    setFiltering(filteringWasEnabled);
    if (pageId) cy.apiRemoveCustomPage(pageId);
    if (projectId) cy.apiRemoveProject(projectId);
    if (otherProjectId) cy.apiRemoveProject(otherProjectId);
    if (areaId) cy.apiRemoveArea(areaId);
  });

  it('renders the legacy page while the feature is off', () => {
    setBuilderFeature(false);
    cy.visit(`/pages/${pageSlug}`);

    cy.get('.e2e-signed-out-header-title').should('contain', bannerHeaderText);
    cy.contains(topInfoText).should('be.visible');
    cy.contains(bottomInfoText).should('be.visible');
  });

  // A page with no layout yet derives one and saves it on this first open. Everything after
  // this reads that stored graph, so the wait matters: without it the next visit derives
  // again, possibly with different features.
  it('derives the page content into the builder', () => {
    setBuilderFeature(true);
    cy.intercept('POST', '**/content_builder_layouts/custom_page/upsert').as(
      'deriveLayout'
    );
    openBuilder();
    cy.wait('@deriveLayout');

    // The canvas scrolls inside a fixed frame, so anything below the banner needs scrolling
    // into view before it counts as visible.
    cy.get('#ROOT .e2e-signed-out-header-title').should(
      'contain',
      bannerHeaderText
    );
    // A page with a banner keeps its title, hidden; the builder says so.
    cy.contains(`still called "${pageTitle}"`)
      .scrollIntoView()
      .should('be.visible');
    cy.contains(topInfoText).scrollIntoView().should('be.visible');
    cy.contains(bottomInfoText).scrollIntoView().should('be.visible');
    cy.dataCy('e2e-file-attachment')
      .contains('example.pdf')
      .scrollIntoView()
      .should('be.visible');
    cy.dataCy('e2e-events-widget').should('exist');
    // The page already has its banner, so the toolbox does not offer another.
    cy.get('#e2e-draggable-custom-page-banner').should('not.exist');
  });

  it('offers the page’s own files in the widget settings', () => {
    openBuilder();

    selectNodeContaining(() => cy.dataCy('e2e-file-attachment'));

    // The placeholder and empty options are hidden, so these are the real choices.
    cy.dataCy('e2e-file-attachment-file-select')
      .find('option:not([hidden])')
      .then((options) => {
        expect(options.toArray().map((o) => o.textContent)).to.eql([
          'example.pdf',
        ]);
      });
    cy.dataCy('e2e-upload-files-to-page').should('be.visible');
  });

  it('renders the derived layout in the front office, filters carried across', () => {
    // Cards mount one at a time, so a count alone is satisfied by the first one to land — even
    // on an unfiltered page. Waiting for the list response first makes the count meaningful.
    cy.intercept('GET', '**/admin_publications?*').as('publications');
    cy.visit(`/pages/${pageSlug}`);
    cy.wait('@publications');

    // The layout owns the header now: the banner renders from it, and the legacy page title
    // is not rendered alongside.
    cy.get('.e2e-signed-out-header-title').should('contain', bannerHeaderText);
    cy.contains('h1', pageTitle).should('not.exist');
    // The load-bearing assertion for attachments: without the layout context this renders as
    // nothing at all.
    cy.dataCy('e2e-file-attachment')
      .contains('example.pdf')
      .should('be.visible');
    cy.contains(topInfoText).should('be.visible');
    cy.contains(bottomInfoText).should('be.visible');
    cy.dataCy('e2e-project-card').should('have.length', 1);
    cy.contains(projectTitle).should('be.visible');
    cy.contains(eventTitle).should('be.visible');
    cy.contains(otherEventTitle).should('not.exist');
  });

  // The title is the page's own name, so editing it in the builder renames the page; showing
  // it puts the heading under the banner rather than above it.
  it('shows the edited title under the banner once switched on', () => {
    openBuilder();

    selectNodeContaining(() => cy.contains(`still called "${pageTitle}"`));
    cy.get('#e2e-custom-page-title-toggle').click({ force: true });
    cy.get('#e2e-custom-page-title-input').clear().type(renamedPageTitle);

    cy.intercept('PATCH', `**/static_pages/${pageId}`).as('renamePage');
    cy.intercept('**/content_builder_layouts/custom_page/upsert').as(
      'saveCustomPageLayout'
    );
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@renamePage');
    cy.wait('@saveCustomPageLayout');

    cy.visit(`/pages/${pageSlug}`);
    cy.contains('h1', renamedPageTitle).should('be.visible');
    // The document title reads the page record, so this is the rename having landed there.
    cy.title().should('include', renamedPageTitle);
    // Both selectors matched in document order: the banner comes first.
    cy.get('.e2e-signed-out-header-title, [data-cy="e2e-custom-page-title"]')
      .first()
      .should('have.class', 'e2e-signed-out-header-title');
  });

  // Filtering is the paid capability on this surface. The nodes were derived while the tenant
  // still had it, so this is the downgrade a stored node outlives: the events widget keeps its
  // filter but offers no choice of source, and the projects list — itself the paid capability
  // here — leaves the toolbox altogether.
  it('withdraws the filtering choices once the tenant loses advanced_custom_pages', () => {
    setFiltering(false);
    openBuilder();

    selectNodeContaining(() => cy.dataCy('e2e-events-widget'));
    cy.get('label[for="events-source-areas"]').should('not.exist');
    cy.get('label[for="events-source-all"]').should('not.exist');

    cy.get('#e2e-draggable-events').should('exist');
    cy.get('#e2e-draggable-projects-by-filter').should('not.exist');
  });
});
