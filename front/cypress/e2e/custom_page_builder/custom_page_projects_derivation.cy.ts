import { randomString } from '../../support/commands';

// A legacy page renders its project list from the page's own `projects_filter_type`, resolved
// server-side. The derived widget carries that selection in its own props instead, so this
// checks the migration lands on the same projects.
describe('Custom page projects derivation', () => {
  const pageTitle = randomString();
  const areaTitle = randomString();
  const projectTitle = `In area ${randomString()}`;
  const otherProjectTitle = `Outside ${randomString()}`;

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

  before(() => {
    cy.setAdminLoginCookie();
    setBuilderFeature(false);

    cy.apiGetAppConfiguration().then((config) => {
      filteringWasEnabled =
        config.body.data.attributes.settings.advanced_custom_pages?.enabled ===
        true;
    });

    cy.apiCreateArea(areaTitle).then((area) => {
      areaId = area.body.data.id;

      cy.apiCreateProject({
        title: projectTitle,
        descriptionPreview: projectTitle,
        publicationStatus: 'published',
      }).then((project) => {
        projectId = project.body.data.id;
        cy.apiSetProjectAreas(projectId, [areaId]);
      });

      // Outside the area, so it must not appear once the filter is carried across.
      cy.apiCreateProject({
        title: otherProjectTitle,
        descriptionPreview: otherProjectTitle,
        publicationStatus: 'published',
      }).then((project) => {
        otherProjectId = project.body.data.id;
      });

      cy.apiCreateCustomPage(pageTitle).then((page) => {
        pageId = page.body.data.id;
        pageSlug = page.body.data.attributes.slug;
        cy.apiUpdateCustomPage(pageId, {
          projects_enabled: true,
          projects_filter_type: 'areas',
          area_ids: [areaId],
        });
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

  it('carries the page filter onto the derived projects widget', () => {
    setBuilderFeature(true);
    setFiltering(true);
    cy.setAdminLoginCookie();
    // A page with no layout yet derives one and saves it on this first open, so the front
    // office below has to wait for that write rather than the frame appearing.
    cy.intercept('POST', '**/content_builder_layouts/custom_page/upsert').as(
      'deriveLayout'
    );
    cy.visit(`/admin/custom-page-builder/pages/${pageId}`);
    cy.get('div#ROOT');
    cy.wait('@deriveLayout');

    // Cards mount one at a time, so a count alone is satisfied by the first one to land — even
    // on an unfiltered page. Waiting for the list response first makes the count meaningful.
    cy.intercept('GET', '**/admin_publications?*').as('publications');
    cy.visit(`/pages/${pageSlug}`);
    cy.wait('@publications');

    cy.dataCy('e2e-project-card').should('have.length', 1);
    cy.contains(projectTitle).should('be.visible');
  });

  // The project list is itself the paid capability here, where for events only the filtering
  // is, so the whole entry goes rather than one of its settings.
  it('offers no projects widget in the toolbox without advanced_custom_pages', () => {
    setBuilderFeature(true);
    setFiltering(false);
    cy.setAdminLoginCookie();
    cy.visit(`/admin/custom-page-builder/pages/${pageId}`);
    cy.get('div#ROOT');

    cy.get('#e2e-draggable-events').should('exist');
    cy.get('#e2e-draggable-projects-by-filter').should('not.exist');
  });
});
