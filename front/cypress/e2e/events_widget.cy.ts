import { randomString } from '../support/commands';

// One widget serves three surfaces under three stored names, so this covers all of them from
// one fixture: a node an admin drops from a toolbox (canonical `EventsList`), the two legacy
// names still in the database, and the settings panel that varies by surface. Custom pages are
// covered separately, in custom_page_builder/custom_page_events_derivation.cy.ts, because their
// derivation needs its own fixtures.

const node = (override: Record<string, unknown>) => ({
  nodes: [],
  props: {},
  custom: {},
  hidden: false,
  isCanvas: false,
  linkedNodes: {},
  ...override,
});

// Seeded rather than dragged wherever a stored name is the point: the toolbox writes the
// canonical name, so dragging would stop covering the legacy names these tests protect. The
// project page also ships an `EventsWidget` in its default layout, which would supply the
// scroll target the canonical node is here to supply for itself.
const homepageLayoutWith = (
  resolvedName: string,
  props: Record<string, unknown> = {}
) => ({
  ROOT: node({
    type: { resolvedName: 'Container' },
    nodes: ['EVENTS'],
    isCanvas: true,
    displayName: 'Container',
  }),
  EVENTS: node({
    type: { resolvedName },
    props,
    parent: 'ROOT',
    displayName: resolvedName,
  }),
});

const projectPageLayoutWith = (
  resolvedName: string,
  props: Record<string, unknown> = {}
) => ({
  ROOT: node({
    type: { resolvedName: 'ProjectPageRoot' },
    nodes: ['PROJECT_PAGE_BANNER', 'PROJECT_PAGE_TITLE', 'PROJECT_PAGE_BODY'],
    custom: { region: true },
    isCanvas: true,
    displayName: 'ProjectPageRoot',
  }),
  PROJECT_PAGE_BANNER: node({
    type: { resolvedName: 'ProjectBanner' },
    props: { image: {}, alt: {} },
    parent: 'ROOT',
    displayName: 'ProjectBanner',
  }),
  PROJECT_PAGE_TITLE: node({
    type: { resolvedName: 'ProjectTitle' },
    parent: 'ROOT',
    displayName: 'ProjectTitle',
  }),
  PROJECT_PAGE_BODY: node({
    type: { resolvedName: 'ProjectPageBody' },
    nodes: ['PROJECT_PAGE_EVENTS'],
    custom: { region: true },
    parent: 'ROOT',
    isCanvas: true,
    displayName: 'ProjectPageBody',
  }),
  PROJECT_PAGE_EVENTS: node({
    type: { resolvedName },
    props,
    parent: 'PROJECT_PAGE_BODY',
    displayName: resolvedName,
  }),
});

const TOOLBOX_PROJECT_PAGE_PROPS = {
  source: 'currentProject',
  timeFilters: ['upcoming', 'past'],
  limit: 'all',
};

describe('Events widget', () => {
  const projectTitle = randomString();
  const upcomingTitle = `Upcoming ${randomString()}`;
  const pastTitle = `Past ${randomString()}`;

  let projectId = '';
  let projectSlug = '';
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

  // A homepage may already carry events widgets of its own, and a test that drags one needs to
  // be reading the widget it dropped. Drop any before dragging the one under test.
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
      title: projectTitle,
      descriptionPreview: projectTitle,
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;

      cy.apiCreateEvent({
        projectId,
        title: upcomingTitle,
        description: upcomingTitle,
        location: 'Brussels',
        // Starts within the hour so it is among the soonest upcoming events, which is
        // what the homepage teaser shows: it caps the list at three.
        startDate: new Date(Date.now() + 60 * 1000),
        endDate: new Date(Date.now() + 60 * 60 * 1000),
      });

      // A past bucket renders nothing when it is empty, so switching it on has to have
      // something to show.
      cy.apiCreateEvent({
        projectId,
        title: pastTitle,
        description: pastTitle,
        location: 'Brussels',
        startDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
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

  it('renders with the props the toolbox wrote', () => {
    goToHomepageBuilder();

    cy.get('#e2e-draggable-events').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });

    saveHomepage();

    // Dropped with the homepage's defaults: upcoming only.
    cy.goToLandingPage();
    cy.contains(upcomingTitle).should('be.visible');
    cy.contains(pastTitle).should('not.exist');
  });

  // The project page's events CTAs scroll to this id. A page whose events widget is stored
  // under the canonical name has to offer it, exactly as a stored `EventsWidget` node does.
  it('offers the project page scroll target', () => {
    cy.apiUpdateProjectPageLayout(
      projectId,
      projectPageLayoutWith('EventsList', TOOLBOX_PROJECT_PAGE_PROPS)
    );

    cy.visit(`/en/projects/${projectSlug}`);
    cy.contains(upcomingTitle).should('exist');

    cy.get('#e2e-project-page-events').should('contain', upcomingTitle);
  });

  // The homepage node is a teaser: upcoming only, capped, with a link to the events page.
  it('renders a stored `Events` node as the homepage teaser', () => {
    cy.apiUpdateHomepageLayout({ craftjs_json: homepageLayoutWith('Events') });

    cy.intercept('GET', '**/events**').as('getEvents');
    cy.goToLandingPage();
    cy.wait('@getEvents');

    cy.dataCy('e2e-events').should('exist');
    cy.dataCy('e2e-events').should('contain', upcomingTitle);
    cy.dataCy('e2e-events').should('not.contain', pastTitle);
  });

  // The project page node is an archive: past events as well as upcoming. The affordances
  // useHasEventsWidget drives are already covered by project_page_information.cy.ts, which
  // exercises the EventsWidget node the default layout ships with.
  it('renders a stored `EventsWidget` node as the project page archive', () => {
    cy.apiUpdateProjectPageLayout(
      projectId,
      projectPageLayoutWith('EventsWidget')
    );

    cy.intercept('GET', '**/events**').as('getEvents');
    cy.visit(`/projects/${projectSlug}`);
    cy.wait('@getEvents');

    cy.get('#e2e-project-page-events').should('exist');
    cy.get('#e2e-project-page-events').should('contain', upcomingTitle);
    cy.get('#e2e-project-page-events').should('contain', pastTitle);
  });

  // Filtering is gated on custom pages only, so the homepage offers it whatever the
  // advanced_custom_pages flag says. A project page offers nothing to choose either way — its
  // events widget is about that project — not the dimensions, and not the archived-projects
  // filter the widget ignores there.
  it('offers a source choice on the homepage but not on a project page', () => {
    setFiltering(false);
    goToHomepageBuilder();

    cy.get('#e2e-draggable-events').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });

    cy.get('label[for="events-source-all"]').should('exist');
    cy.get('label[for="events-source-areas"]').should('exist');

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

  // A widget already filtering by spaces keeps that option once the feature goes, so the panel
  // shows what the page is doing. Drop it and nothing is selected, and the next click clears
  // the stored ids.
  it('keeps a stored spaces filter selectable once the feature is off', () => {
    setFiltering(true);
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
