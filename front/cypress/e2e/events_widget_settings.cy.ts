import { randomString } from '../support/commands';

// The panel is where an admin picks whose events a widget shows, and it is gated: without
// `advanced_custom_pages` there is nothing to choose and the widget shows every project.
describe('Events widget settings panel', () => {
  const areaTitle = randomString();
  const inAreaEvent = `InArea ${randomString()}`;
  const outsideEvent = `Outside ${randomString()}`;

  let areaId = '';
  let inAreaProjectId = '';
  let outsideProjectId = '';
  let homepageLayout: Record<string, unknown>;
  let filteringWasEnabled = false;

  const setFiltering = (enabled: boolean) =>
    cy.apiUpdateAppConfiguration({
      settings: { advanced_custom_pages: { allowed: enabled, enabled } },
    });

  const soon = (hours: number) => new Date(Date.now() + hours * 60 * 60 * 1000);

  function goToHomepageBuilder() {
    cy.setAdminLoginCookie();
    cy.visit('en/admin/pages-menu/homepage-builder');
    cy.get('#e2e-content-builder-frame').children().should('have.length.gt', 0);
  }

  function saveHomepage() {
    cy.intercept(
      'POST',
      '**/home_pages/content_builder_layouts/homepage/upsert'
    ).as('updateHomepage');
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@updateHomepage').its('response.statusCode').should('eq', 200);
  }

  function selectTheWidget() {
    cy.get('[data-cy="e2e-events-widget"]')
      .parents('.e2e-render-node')
      .first()
      .click({ force: true });
  }

  before(() => {
    cy.setAdminLoginCookie();

    cy.apiGetAppConfiguration().then((config) => {
      filteringWasEnabled =
        config.body.data.attributes.settings.advanced_custom_pages?.enabled ===
        true;
    });
    cy.apiGetHomepageLayout().then((layout) => {
      homepageLayout = layout.body.data.attributes.craftjs_json;
    });

    cy.apiCreateArea(areaTitle).then((area) => {
      areaId = area.body.data.id;

      cy.apiCreateProject({
        title: randomString(),
        descriptionPreview: randomString(),
        publicationStatus: 'published',
      }).then((project) => {
        inAreaProjectId = project.body.data.id;
        cy.apiSetProjectAreas(inAreaProjectId, [areaId]);
        cy.apiCreateEvent({
          projectId: inAreaProjectId,
          title: inAreaEvent,
          description: inAreaEvent,
          location: 'Brussels',
          startDate: soon(1),
          endDate: soon(2),
        });
      });

      cy.apiCreateProject({
        title: randomString(),
        descriptionPreview: randomString(),
        publicationStatus: 'published',
      }).then((project) => {
        outsideProjectId = project.body.data.id;
        cy.apiCreateEvent({
          projectId: outsideProjectId,
          title: outsideEvent,
          description: outsideEvent,
          location: 'Brussels',
          startDate: soon(1),
          endDate: soon(2),
        });
      });
    });
  });

  beforeEach(() => {
    cy.apiUpdateHomepageLayout({ craftjs_json: homepageLayout });
  });

  after(() => {
    cy.apiUpdateHomepageLayout({ craftjs_json: homepageLayout });
    setFiltering(filteringWasEnabled);
    if (inAreaProjectId) cy.apiRemoveProject(inAreaProjectId);
    if (outsideProjectId) cy.apiRemoveProject(outsideProjectId);
  });

  it('offers no choice of source without the filtering feature', () => {
    setFiltering(false);
    goToHomepageBuilder();

    cy.get('#e2e-draggable-events').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });
    selectTheWidget();

    cy.get('#events-source-all').should('not.exist');
    cy.get('#events-source-areas').should('not.exist');
  });

  it('shows the heading the widget falls back to as the placeholder', () => {
    setFiltering(true);
    goToHomepageBuilder();

    cy.get('#e2e-draggable-events').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });
    selectTheWidget();

    // Whatever the widget renders when the field is blank has to be what the field promises.
    cy.get('[data-cy="e2e-events-widget"]')
      .invoke('text')
      .then((rendered) => {
        cy.get('#events_heading')
          .invoke('attr', 'placeholder')
          .should((placeholder) => {
            expect(rendered).to.contain(placeholder);
          });
      });
  });
});
