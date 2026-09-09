import { randomString } from '../support/commands';

// The panel is where an admin picks whose events a widget shows, and it is gated: without
// `advanced_custom_pages` there is nothing to choose and the widget shows every project.
describe('Events widget settings panel', () => {
  const eventTitle = `Event ${randomString()}`;
  const pastEventTitle = `Past event ${randomString()}`;

  let projectId = '';
  let homepageLayout: Record<string, unknown>;
  let filteringWasEnabled = false;
  let spacesWasEnabled = false;

  const setFiltering = (enabled: boolean) =>
    cy.apiUpdateAppConfiguration({
      settings: { advanced_custom_pages: { allowed: enabled, enabled } },
    });

  const setSpaces = (enabled: boolean) =>
    cy.apiUpdateAppConfiguration({
      settings: { spaces: { allowed: enabled, enabled } },
    });

  const soon = (hours: number) => new Date(Date.now() + hours * 60 * 60 * 1000);
  const ago = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000);

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

  // A homepage may already carry events widgets of its own, and this test compares two
  // headings that must come from the same widget. Drop any before dragging the one under test.
  const homepageWithoutEvents = () => {
    const nodes = JSON.parse(JSON.stringify(homepageLayout)) as Record<
      string,
      { type?: { resolvedName?: string }; nodes?: string[] }
    >;
    const eventIds = Object.keys(nodes).filter((id) =>
      ['Events', 'EventsList'].includes(nodes[id].type?.resolvedName ?? '')
    );
    eventIds.forEach((id) => delete nodes[id]);
    Object.values(nodes).forEach((node) => {
      if (node.nodes) {
        node.nodes = node.nodes.filter((id) => !eventIds.includes(id));
      }
    });
    return nodes;
  };

  before(() => {
    cy.setAdminLoginCookie();

    cy.apiGetAppConfiguration().then((config) => {
      filteringWasEnabled =
        config.body.data.attributes.settings.advanced_custom_pages?.enabled ===
        true;
      spacesWasEnabled =
        config.body.data.attributes.settings.spaces?.enabled === true;
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
      // A past bucket renders nothing when it is empty, so switching it on has to have
      // something to show.
      cy.apiCreateEvent({
        projectId,
        title: pastEventTitle,
        description: pastEventTitle,
        location: 'Brussels',
        startDate: ago(48),
        endDate: ago(47),
      });
    });
  });

  beforeEach(() => {
    cy.apiUpdateHomepageLayout({ craftjs_json: homepageLayout });
  });

  after(() => {
    cy.apiUpdateHomepageLayout({ craftjs_json: homepageLayout });
    setFiltering(filteringWasEnabled);
    setSpaces(spacesWasEnabled);
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

  // With both buckets on each section gets its own subheading, and the widget heading has to
  // say something else — a default that repeats the first subheading reads as a stray title.
  it('does not repeat the section subheading as the widget heading', () => {
    cy.apiUpdateHomepageLayout({ craftjs_json: homepageWithoutEvents() });
    goToHomepageBuilder();

    cy.get('#e2e-draggable-events').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });
    cy.contains('label', 'Past').click();

    cy.get('#e2e-project-page-upcoming-events')
      .find('h3')
      .first()
      .invoke('text')
      .then((subheading) => {
        cy.dataCy('e2e-events-widget')
          .find('h2')
          .first()
          .invoke('text')
          .should('not.eq', subheading);
      });
  });

  // A widget already filtering by spaces keeps that option once the feature goes, so the panel
  // shows what the page is doing. Drop it and nothing is selected, and the next click clears
  // the stored ids.
  it('keeps a stored spaces filter selectable once the feature is off', () => {
    setSpaces(true);
    cy.apiUpdateHomepageLayout({ craftjs_json: homepageWithoutEvents() });
    goToHomepageBuilder();

    cy.get('#e2e-draggable-events').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });
    cy.get('label[for="events-source-spaces"]').click();
    saveHomepage();

    setSpaces(false);
    goToHomepageBuilder();
    cy.dataCy('e2e-events-widget')
      .parents('.e2e-render-node')
      .first()
      .click({ force: true });

    cy.get('#events-source-spaces').should('exist').and('be.checked');
  });

  // A query that is switched off keeps serving its last result, so a bucket has to be read
  // through its own setting rather than through the query: switching one off and back on must
  // not leave the old section on screen.
  it('stops showing a bucket that is switched off again', () => {
    cy.apiUpdateHomepageLayout({ craftjs_json: homepageWithoutEvents() });
    goToHomepageBuilder();

    cy.get('#e2e-draggable-events').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });

    cy.contains('label', 'Past').click();
    cy.get('#e2e-project-page-past-events').should('exist');
    cy.contains('label', 'Past').click();
    cy.get('#e2e-project-page-past-events').should('not.exist');

    // The other bucket, which cannot be switched off until this one is back on.
    cy.contains('label', 'Past').click();
    cy.contains('label', 'Upcoming and ongoing').click();
    cy.get('#e2e-project-page-upcoming-events').should('not.exist');
    cy.get('#e2e-project-page-past-events').should('exist');
  });
});
