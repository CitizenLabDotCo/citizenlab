import { randomString } from '../support/commands';

// The legacy names are covered by events_widget_legacy_nodes.cy.ts, which seeds stored nodes.
// This covers the other half: a widget an admin drops from a toolbox, which carries the
// canonical name and explicit props rather than a shim's defaults.

const node = (override: Record<string, unknown>) => ({
  nodes: [],
  props: {},
  custom: {},
  hidden: false,
  isCanvas: false,
  linkedNodes: {},
  ...override,
});

// The props the project page toolbox writes. Seeded rather than dragged because the default
// layout already carries an `EventsWidget`, and that node would supply the scroll target this
// test is checking the canonical node supplies for itself.
const projectPageLayoutWithEventsList = () => ({
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
    type: { resolvedName: 'EventsList' },
    props: {
      source: 'currentProject',
      timeFilters: ['upcoming', 'past'],
      limit: 'all',
    },
    parent: 'PROJECT_PAGE_BODY',
    displayName: 'EventsList',
  }),
});

const homepageLayoutWithEventsList = () => ({
  ROOT: node({
    type: { resolvedName: 'Container' },
    nodes: ['HOMEPAGE_EVENTS'],
    isCanvas: true,
    displayName: 'Container',
  }),
  HOMEPAGE_EVENTS: node({
    type: { resolvedName: 'EventsList' },
    props: {
      source: 'all',
      timeFilters: ['upcoming'],
      limit: 3,
      showEmptyMessage: true,
    },
    parent: 'ROOT',
    displayName: 'EventsList',
  }),
});

function waitForLayoutToRender() {
  cy.get('#e2e-content-builder-frame').children().should('have.length.gt', 0);
}

function goToHomepageBuilder() {
  cy.setAdminLoginCookie();
  cy.visit('en/admin/pages-menu/homepage-builder');
  waitForLayoutToRender();
}

function saveHomepage() {
  cy.intercept(
    'POST',
    '**/home_pages/content_builder_layouts/homepage/upsert'
  ).as('updateHomepage');
  cy.get('#e2e-content-builder-topbar-save').click();
  cy.wait('@updateHomepage').its('response.statusCode').should('eq', 200);
}

describe('Events widget added from a toolbox', () => {
  const projectTitle = randomString();
  const upcomingTitle = `Upcoming ${randomString()}`;
  const pastTitle = `Past ${randomString()}`;

  let projectId = '';
  let projectSlug = '';
  let homepageLayout: Record<string, unknown>;

  before(() => {
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
    cy.apiUpdateProjectPageLayout(projectId, projectPageLayoutWithEventsList());

    cy.visit(`/en/projects/${projectSlug}`);
    cy.contains(upcomingTitle).should('exist');

    cy.get('#e2e-project-page-events').should('contain', upcomingTitle);
  });

  // No shim frames a canonical node, so the widget has to constrain its own width. On the
  // homepage nothing above it does: every other widget there stops at the content width.
  it('constrains its own width on the homepage', () => {
    cy.apiUpdateHomepageLayout({
      craftjs_json: homepageLayoutWithEventsList(),
    });

    cy.goToLandingPage();
    cy.contains(upcomingTitle).should('exist');

    cy.dataCy('e2e-events-widget').invoke('outerWidth').should('be.lte', 1200);
  });

  // One card layout on every surface: three to a row at desktop width. A card wider than a
  // third of the widget means it has fallen back to the wide two-column grid.
  it('lays events out three to a row on both surfaces', () => {
    cy.apiUpdateHomepageLayout({
      craftjs_json: homepageLayoutWithEventsList(),
    });
    cy.goToLandingPage();
    cy.contains(upcomingTitle).should('exist');
    cy.dataCy('e2e-events-widget')
      .find('li')
      .first()
      .invoke('outerWidth')
      .should('be.lt', 420);

    cy.apiUpdateProjectPageLayout(projectId, projectPageLayoutWithEventsList());
    cy.visit(`/en/projects/${projectSlug}`);
    cy.contains(upcomingTitle).should('exist');
    cy.dataCy('e2e-events-widget')
      .find('li')
      .first()
      .invoke('outerWidth')
      .should('be.lt', 420);
  });
});
