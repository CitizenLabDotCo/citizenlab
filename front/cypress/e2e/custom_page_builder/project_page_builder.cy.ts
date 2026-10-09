import { randomString } from '../../support/commands';

// Project pages on the content builder: the admin edit page with its preview, the builder, and
// the published page inside its project.
describe('Project page builder', () => {
  const projectTitle = randomString();
  const pageTitle = randomString();
  const bodyText = randomString();
  const eventTitle = `Event ${randomString()}`;
  const otherEventTitle = `Other ${randomString()}`;

  let projectId = '';
  let otherProjectId = '';
  let projectSlug = '';
  let pageId = '';
  let pageSlug = '';
  let builderWasEnabled = false;
  let projectPagesWasEnabled = false;
  let advancedWasEnabled = false;

  const setFeatures = (enabled: boolean, projectPages: boolean) =>
    cy.apiUpdateAppConfiguration({
      settings: {
        custom_page_builder: { allowed: true, enabled },
        project_static_pages: { allowed: projectPages, enabled: projectPages },
      },
    });

  // The events widget can only be dragged in with advanced_custom_pages on.
  const setAdvancedCustomPages = (enabled: boolean) =>
    cy.apiUpdateAppConfiguration({
      settings: { advanced_custom_pages: { allowed: enabled, enabled } },
    });

  before(() => {
    cy.apiGetAppConfiguration().then((config) => {
      const settings = config.body.data.attributes.settings;
      builderWasEnabled = settings.custom_page_builder?.enabled === true;
      projectPagesWasEnabled = settings.project_static_pages?.enabled === true;
      advancedWasEnabled = settings.advanced_custom_pages?.enabled === true;
    });
    setAdvancedCustomPages(true);

    // Created with the builder off, so the page starts with legacy content and no layout.
    setFeatures(false, true);
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectTitle,
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;

      cy.apiCreateEvent({
        projectId,
        title: eventTitle,
        description: eventTitle,
        location: 'Brussels',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      });

      cy.apiCreateCustomPage(pageTitle, projectId).then((page) => {
        pageId = page.body.data.id;
        pageSlug = page.body.data.attributes.slug;
        cy.apiUpdateCustomPage(pageId, {
          top_info_section_enabled: true,
          top_info_section_multiloc: { en: `<p>${bodyText}</p>` },
        });
      });
    });

    // Sooner than this project's event, so a widget listing every project would show it.
    cy.apiCreateProject({
      title: `Other ${randomString()}`,
      descriptionPreview: 'Other project',
      publicationStatus: 'published',
    }).then((project) => {
      otherProjectId = project.body.data.id;
      cy.apiCreateEvent({
        projectId: otherProjectId,
        title: otherEventTitle,
        description: otherEventTitle,
        location: 'Brussels',
        startDate: new Date(Date.now() + 60 * 1000),
        endDate: new Date(Date.now() + 60 * 60 * 1000),
      });
    });
  });

  after(() => {
    setFeatures(builderWasEnabled, projectPagesWasEnabled);
    setAdvancedCustomPages(advancedWasEnabled);
    if (pageId) cy.apiRemoveCustomPage(pageId);
    if (projectId) cy.apiRemoveProject(projectId);
    if (otherProjectId) cy.apiRemoveProject(otherProjectId);
  });

  it('edits the page from one page with a preview, and opens the builder', () => {
    setFeatures(true, true);
    cy.setAdminLoginCookie();
    cy.intercept('POST', '**/content_builder_layouts/custom_page/upsert').as(
      'deriveLayout'
    );
    cy.visit(`/admin/projects/${projectId}/pages/${pageId}`);
    // The first visit derives the layout from the page's content.
    cy.wait('@deriveLayout');

    cy.dataCy('e2e-save-project-page').should('exist');
    cy.dataCy('e2e-project-page-preview-panel')
      .find('iframe')
      .should('have.attr', 'src')
      .and('include', `/projects/${projectSlug}/pages/${pageSlug}`);

    // The button only shows while the preview is hovered, which Cypress cannot do.
    cy.dataCy('e2e-edit-page-content').click({ force: true });
    cy.location('pathname').should(
      'include',
      `/admin/custom-page-builder/pages/${pageId}`
    );
    cy.contains(bodyText).should('exist');

    cy.get('#e2e-go-back-button').click();
    cy.location('pathname').should(
      'include',
      `/admin/projects/${projectId}/pages/${pageId}`
    );
  });

  // A project's page is about that project, as its project page is: an events widget lists that
  // project's events and offers no other source.
  it('adds an events widget about its project', () => {
    setFeatures(true, true);
    cy.setAdminLoginCookie();
    cy.visit(`/admin/custom-page-builder/pages/${pageId}`);
    cy.get('div#ROOT');
    cy.get('#e2e-draggable-text');

    cy.get('#e2e-draggable-events').dragAndDrop(
      '[data-cy="e2e-custom-page-body"]',
      { position: 'inside' }
    );

    // A dropped widget is selected, so its settings panel is open. A widget not pinned to its
    // project shows the source choice and the archived toggle; whatever the events on the
    // platform, neither shows.
    cy.get('#events-limit-all').should('exist');
    cy.get('label[for="events-source-all"]').should('not.exist');
    cy.contains('Include events from archived projects').should('not.exist');
    cy.dataCy('e2e-events-widget')
      .should('contain', eventTitle)
      .and('not.contain', otherEventTitle);
  });

  it('renders the derived layout on the published page, under its project', () => {
    setFeatures(true, true);
    cy.visit(`/projects/${projectSlug}/pages/${pageSlug}`);

    // Only the builder renders the title widget; the legacy header's title has no data-cy.
    cy.dataCy('e2e-custom-page-title').should('contain', pageTitle);
    cy.contains(bodyText).should('be.visible');
    cy.contains('a', projectTitle).should('be.visible');
  });

  // The box finds its project through the page in the builder, and through the URL once
  // published. Without a project it renders nothing.
  it('adds a participation box about its project', () => {
    setFeatures(true, true);
    cy.setAdminLoginCookie();
    cy.visit(`/admin/custom-page-builder/pages/${pageId}`);
    cy.get('div#ROOT');
    cy.get('#e2e-draggable-text');

    cy.get('#e2e-draggable-about-box').dragAndDrop(
      '[data-cy="e2e-custom-page-body"]',
      { position: 'inside' }
    );
    cy.get('#ROOT #e2e-project-sidebar').should('exist');

    cy.intercept('**/content_builder_layouts/custom_page/upsert').as(
      'saveCustomPageLayout'
    );
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveCustomPageLayout');

    cy.visit(`/projects/${projectSlug}/pages/${pageSlug}`);
    cy.get('#e2e-project-sidebar').should('exist');

    // The events it links to are on the project's page, not this one.
    cy.get('#e2e-project-see-events-button').click();
    cy.location('pathname').should('eq', `/en/projects/${projectSlug}`);
    cy.dataCy('e2e-events-widget').should('contain', eventTitle);
  });

  // The section holds a Participation box, so the editor has to resolve one or the drop crashes
  // the builder.
  it('adds the Info & accordions section', () => {
    setFeatures(true, true);
    cy.setAdminLoginCookie();
    cy.visit(`/admin/custom-page-builder/pages/${pageId}`);
    cy.get('div#ROOT');
    cy.get('#e2e-draggable-text');

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

    cy.visit(`/projects/${projectSlug}/pages/${pageSlug}`);
    cy.get('.e2e-accordion').should('have.length', 3);
  });
});
