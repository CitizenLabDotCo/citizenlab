import { randomString } from '../../support/commands';

// Project pages on the content builder: the admin edit page with its preview, the builder, and
// the published page inside its project.
describe('Project page builder', () => {
  const projectTitle = randomString();
  const pageTitle = randomString();
  const eventTitle = `Event ${randomString()}`;
  const otherEventTitle = `Other ${randomString()}`;

  let projectId = '';
  let otherProjectId = '';
  let projectSlug = '';
  let pageId = '';
  let pageSlug = '';
  let projectPagesWasEnabled = false;
  let advancedWasEnabled = false;

  const setProjectPages = (enabled: boolean) =>
    cy.apiUpdateAppConfiguration({
      settings: { project_static_pages: { allowed: enabled, enabled } },
    });

  // The events widget can only be dragged in with advanced_custom_pages on.
  const setAdvancedCustomPages = (enabled: boolean) =>
    cy.apiUpdateAppConfiguration({
      settings: { advanced_custom_pages: { allowed: enabled, enabled } },
    });

  before(() => {
    cy.apiGetAppConfiguration().then((config) => {
      const settings = config.body.data.attributes.settings;
      projectPagesWasEnabled = settings.project_static_pages?.enabled === true;
      advancedWasEnabled = settings.advanced_custom_pages?.enabled === true;
    });
    setAdvancedCustomPages(true);
    setProjectPages(true);

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
    setProjectPages(projectPagesWasEnabled);
    setAdvancedCustomPages(advancedWasEnabled);
    if (pageId) cy.apiRemoveCustomPage(pageId);
    if (projectId) cy.apiRemoveProject(projectId);
    if (otherProjectId) cy.apiRemoveProject(otherProjectId);
  });

  it('edits the page from one page with a preview, and opens the builder', () => {
    cy.setAdminLoginCookie();
    cy.visit(`/admin/projects/${projectId}/pages/${pageId}`);

    // The route is lazily loaded and renders nothing until the project and the page answer,
    // which under CI contention has outlasted the suite's 15s default.
    cy.get('[data-cy="e2e-save-project-page"]', { timeout: 30000 }).should(
      'exist'
    );
    cy.get('[data-cy="e2e-project-page-preview-panel"]', { timeout: 30000 })
      .find('iframe')
      .should('have.attr', 'src')
      .and('include', `/projects/${projectSlug}/pages/${pageSlug}`);

    // The button only shows while the preview is hovered, which Cypress cannot do.
    cy.dataCy('e2e-edit-page-content').click({ force: true });
    cy.location('pathname').should(
      'include',
      `/admin/custom-page-builder/pages/${pageId}`
    );

    cy.get('#e2e-go-back-button').click();
    cy.location('pathname').should(
      'include',
      `/admin/projects/${projectId}/pages/${pageId}`
    );
  });

  // A project's page is about that project, as its project page is: an events widget lists that
  // project's events and offers no other source.
  it('adds an events widget about its project', () => {
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
    cy.dataCy('e2e-events-show-empty-message')
      .find('input')
      .should('be.checked');
    cy.dataCy('e2e-events-widget')
      .should('contain', eventTitle)
      .and('not.contain', otherEventTitle);
  });

  // The box finds its project through the page in the builder, and through the URL once
  // published. Without a project it renders nothing.
  it('adds a participation box about its project', () => {
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
