import { randomString } from '../../support/commands';

// A legacy page filters its events through the page's own `projects_filter_type`, resolved
// server-side. The derived widget carries that selection in its own props instead, so this
// checks the migration lands on the same events.
describe('Custom page events derivation', () => {
  const pageTitle = randomString();
  const areaTitle = randomString();
  const projectTitle = randomString();
  const eventTitle = `Event ${randomString()}`;
  const otherEventTitle = `Other ${randomString()}`;

  let pageId = '';
  let pageSlug = '';
  let projectId = '';
  let otherProjectId = '';
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
      const areaId = area.body.data.id;

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
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        });
      });

      // Outside the area, so it must not appear once the filter is carried across.
      cy.apiCreateProject({
        title: `${projectTitle} other`,
        descriptionPreview: projectTitle,
        publicationStatus: 'published',
      }).then((project) => {
        otherProjectId = project.body.data.id;
        cy.apiCreateEvent({
          projectId: otherProjectId,
          title: otherEventTitle,
          description: otherEventTitle,
          location: 'Brussels',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        });
      });

      cy.apiCreateCustomPage(pageTitle).then((page) => {
        pageId = page.body.data.id;
        pageSlug = page.body.data.attributes.slug;
        cy.apiUpdateCustomPage(pageId, {
          events_widget_enabled: true,
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
  });

  // Filtering is the paid capability on this surface, and the only surface it is gated on.
  it('offers no choice of source without advanced_custom_pages', () => {
    setBuilderFeature(true);
    setFiltering(false);
    cy.setAdminLoginCookie();
    cy.visit(`/admin/custom-page-builder/pages/${pageId}`);
    cy.get('div#ROOT');

    cy.get('[data-cy="e2e-events-widget"]')
      .parents('.e2e-render-node')
      .first()
      .click({ force: true });

    cy.get('label[for="events-source-areas"]').should('not.exist');
    cy.get('label[for="events-source-all"]').should('not.exist');
  });

  it('carries the page filter onto the derived events widget', () => {
    setBuilderFeature(true);
    setFiltering(true);
    cy.setAdminLoginCookie();
    // Open the builder once so the layout is derived, then check what a visitor sees.
    cy.visit(`/admin/custom-page-builder/pages/${pageId}`);
    cy.get('div#ROOT');

    cy.visit(`/pages/${pageSlug}`);

    cy.contains(eventTitle).should('be.visible');
    cy.contains(otherEventTitle).should('not.exist');
  });
});
