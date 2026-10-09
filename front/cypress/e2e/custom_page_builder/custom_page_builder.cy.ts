import { base64 } from '../../fixtures/base64img';
import { randomString } from '../../support/commands';

// One page holds everything the builder derives, so one derivation serves every example. The
// examples run in order and build on each other.
describe('Custom page builder', () => {
  const pageTitle = randomString();
  const renamedPageTitle = `Renamed ${randomString()}`;
  const topInfoText = randomString();
  const bottomInfoText = randomString();
  const bannerHeaderText = `Banner ${randomString()}`;
  const editedBannerHeaderText = `Edited banner ${randomString()}`;
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
  let builderWasEnabled = false;
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

  // Widgets take no pointer events in the builder, so click the node around them. The layout is
  // refetched while the builder settles, which drops the selection, so retry until the panel opens.
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
    cy.apiGetAppConfiguration().then((config) => {
      builderWasEnabled =
        config.body.data.attributes.settings.custom_page_builder?.enabled ===
        true;
      filteringWasEnabled =
        config.body.data.attributes.settings.advanced_custom_pages?.enabled ===
        true;
    });
    setBuilderFeature(false);
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
    setBuilderFeature(builderWasEnabled);
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

  // Renaming the title updates the page record. The banner's text saves with the layout.
  it('shows the edited title under the edited banner once switched on', () => {
    openBuilder();

    selectNodeContaining(() => cy.get('#ROOT .e2e-signed-out-header-title'));
    cy.dataCy('e2e-signed-out-header-section')
      .find('input')
      .clear()
      .type(editedBannerHeaderText);

    // The dropzone takes no file while it holds one.
    cy.dataCy('e2e-remove-image-button').click();
    cy.intercept('POST', '**/content_builder_layout_images').as('postImage');
    cy.get('#header-dropzone').attachFile('testimage.png');
    cy.wait('@postImage')
      .its('response.body.data.attributes.code')
      .as('uploadedImageCode');

    selectNodeContaining(() => cy.contains(`still called "${pageTitle}"`));
    cy.get('#e2e-custom-page-title-toggle').click({ force: true });
    cy.get('#e2e-custom-page-title-input').clear().type(renamedPageTitle);
    cy.get('#ROOT [data-cy="e2e-custom-page-title"]').should(
      'contain',
      renamedPageTitle
    );

    cy.intercept('PATCH', `**/static_pages/${pageId}`).as('renamePage');
    cy.intercept('**/content_builder_layouts/custom_page/upsert').as(
      'saveCustomPageLayout'
    );
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@renamePage');
    cy.wait('@saveCustomPageLayout').then(({ request }) => {
      const nodes: {
        type: { resolvedName?: string };
        props: { title?: unknown; image?: { dataCode?: string } };
      }[] = Object.values(request.body.content_builder_layout.craftjs_json);
      const nodeNamed = (name: string) =>
        nodes.find((node) => node.type.resolvedName === name);

      expect(nodeNamed('CustomPageTitle')?.props).not.to.have.property('title');
      cy.get('@uploadedImageCode').then((code) => {
        expect(nodeNamed('CustomPageBanner')?.props.image?.dataCode).to.eq(
          code
        );
      });
    });

    cy.visit(`/pages/${pageSlug}`);
    cy.get('.e2e-signed-out-header-title').should(
      'contain',
      editedBannerHeaderText
    );
    cy.contains('h1', renamedPageTitle).should('be.visible');
    // The document title reads the page record, so this is the rename having landed there.
    cy.title().should('include', renamedPageTitle);
    // Both selectors matched in document order: the banner comes first.
    cy.get('.e2e-signed-out-header-title, [data-cy="e2e-custom-page-title"]')
      .first()
      .should('have.class', 'e2e-signed-out-header-title');
  });

  // The widgets stay listed, greyed out with an upsell, and one already on the page keeps its
  // settings.
  it('greys out its widgets once the tenant loses advanced_custom_pages', () => {
    setFiltering(false);
    openBuilder();

    selectNodeContaining(() => cy.dataCy('e2e-events-widget'));
    cy.get('#events-source-areas').should('be.checked');
    cy.get('label[for="events-source-all"]').should('exist');
    cy.get('label[for="events-source-global_topics"]').should('exist');

    cy.get('#e2e-draggable-events').should(
      'have.attr',
      'aria-disabled',
      'true'
    );
    cy.get('#e2e-draggable-projects-by-filter')
      .should('have.attr', 'aria-disabled', 'true')
      .trigger('mouseenter');
    cy.contains('not included in your current plan').should('be.visible');
    cy.get('#e2e-draggable-text').should('not.have.attr', 'aria-disabled');
  });

  // The Call to action is the homepage widget worth checking on a published page: its buttons
  // used to render only while the editor was enabled, which the homepage never turns off but a
  // published custom page does.
  it('renders homepage widgets added in the builder on the published page', () => {
    const buttonText = `Go ${randomString()}`;
    setFiltering(true);
    openBuilder();

    cy.get('#e2e-draggable-published').dragAndDrop(
      '[data-cy="e2e-custom-page-body"]',
      { position: 'inside' }
    );
    cy.get('#e2e-draggable-call-to-action').dragAndDrop(
      '[data-cy="e2e-custom-page-body"]',
      { position: 'inside' }
    );

    // A dropped widget is selected, so its settings panel is open.
    cy.get('#highlight_primaryButtonText').type(buttonText);
    cy.get('#highlight_primaryButtonLink').type('/projects');

    cy.intercept('**/content_builder_layouts/custom_page/upsert').as(
      'saveCustomPageLayout'
    );
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveCustomPageLayout');

    cy.visit(`/pages/${pageSlug}`);
    cy.get('.e2e-published-projects-and-folders').should('exist');
    cy.contains(buttonText).should('be.visible');
  });

  // The section places a Participation box, which is not in this toolbox. The editor has to
  // resolve it anyway, or dropping the section crashes the builder.
  it('adds the Info & accordions section and renders it on the published page', () => {
    openBuilder();

    cy.get('#e2e-draggable-info-accordions').dragAndDrop(
      '[data-cy="e2e-custom-page-body"]',
      { position: 'inside' }
    );
    cy.get('#ROOT .e2e-accordion').should('have.length', 3);

    cy.intercept('**/content_builder_layouts/custom_page/upsert').as(
      'saveCustomPageLayout'
    );
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveCustomPageLayout');

    cy.visit(`/pages/${pageSlug}`);
    cy.get('.e2e-accordion').should('have.length', 3);
  });

  // With the builder on, one page replaces the settings and content tabs: the settings form beside
  // a preview, and the builder one click away.
  it('edits the page from one page with a preview', () => {
    cy.setAdminLoginCookie();
    cy.visit(`/admin/pages-menu/pages/${pageId}/settings`);

    cy.get('[data-testid="customPageSettingsForm"]').should('be.visible');
    cy.get('.e2e-resource-tabs').should('not.exist');
    // The builder's widgets list projects and events, so the form's linked items are gone.
    cy.get('[id^="projects_filter_type_"]').should('not.exist');
    cy.dataCy('e2e-custom-page-preview')
      .find('iframe')
      .should('have.attr', 'src')
      .and('include', `/pages/${pageSlug}`);

    // The button only shows while the preview is hovered, which Cypress cannot do.
    cy.dataCy('e2e-edit-page-content').click({ force: true });
    cy.location('pathname').should(
      'include',
      `/admin/custom-page-builder/pages/${pageId}`
    );
    cy.get('#e2e-draggable-text');

    cy.get('#e2e-go-back-button').click();
    cy.location('pathname').should(
      'include',
      `/admin/pages-menu/pages/${pageId}/settings`
    );
  });
});
