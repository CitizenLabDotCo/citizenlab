import { randomString } from '../support/commands';

// The panel is where an admin picks whose events a widget shows, and it is gated: without
// `advanced_custom_pages` there is nothing to choose and the widget shows every project.
describe('Events widget settings panel', () => {
  const eventTitle = `Event ${randomString()}`;

  let projectId = '';
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

    cy.apiCreateProject({
      title: randomString(),
      descriptionPreview: randomString(),
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
      cy.apiCreateEvent({
        projectId,
        title: eventTitle,
        description: eventTitle,
        location: 'Brussels',
        startDate: soon(1),
        endDate: soon(2),
      });
    });
  });

  beforeEach(() => {
    cy.apiUpdateHomepageLayout({ craftjs_json: homepageLayout });
  });

  after(() => {
    cy.apiUpdateHomepageLayout({ craftjs_json: homepageLayout });
    setFiltering(filteringWasEnabled);
    if (projectId) cy.apiRemoveProject(projectId);
  });

  // Filtering is gated on custom pages only, so the homepage offers it whatever the
  // advanced_custom_pages flag says.
  it('offers a choice of source on the homepage', () => {
    setFiltering(false);
    goToHomepageBuilder();

    cy.get('#e2e-draggable-events').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });

    cy.get('label[for="events-source-all"]').should('exist');
    cy.get('label[for="events-source-areas"]').should('exist');
  });

  // A project description page is only ever about its own project, so the panel offers nothing
  // to choose — not the dimensions, and not the archived-projects filter the widget ignores there.
  it('offers no source or status choice on a project page', () => {
    cy.setAdminLoginCookie();
    cy.visit(`/admin/project-page-builder/projects/${projectId}`);
    cy.get('div#ROOT');

    // The widget takes no pointer events in the builder, so select the node around it.
    cy.dataCy('e2e-events-widget')
      .parents('.e2e-render-node')
      .first()
      .click({ force: true });

    cy.get('label[for="events-source-all"]').should('not.exist');
    cy.get('label[for="events-source-areas"]').should('not.exist');
    cy.contains('Include events from archived projects').should('not.exist');
  });

  it('shows the heading the widget falls back to as the placeholder', () => {
    setFiltering(true);
    goToHomepageBuilder();

    cy.get('#e2e-draggable-events').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });

    // Whatever the widget renders when the field is blank has to be what the field promises.
    cy.dataCy('e2e-events-widget')
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
