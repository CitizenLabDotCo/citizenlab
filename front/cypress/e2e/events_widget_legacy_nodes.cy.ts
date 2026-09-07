import { randomString } from '../support/commands';

// Seeded rather than dragged from a toolbox on purpose. The three events widgets are being
// merged behind one component, and the toolbox will write the new canonical name — so a spec
// that drags would stop covering the stored names it is here to protect.

const node = (override: Record<string, unknown>) => ({
  nodes: [],
  props: {},
  custom: {},
  hidden: false,
  isCanvas: false,
  linkedNodes: {},
  ...override,
});

const homepageLayoutWithEvents = () => ({
  ROOT: node({
    type: { resolvedName: 'Container' },
    nodes: ['EVENTS'],
    isCanvas: true,
    displayName: 'Container',
  }),
  EVENTS: node({
    type: { resolvedName: 'Events' },
    parent: 'ROOT',
    displayName: 'Events',
  }),
});

const projectPageLayoutWithEvents = () => ({
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
    type: { resolvedName: 'EventsWidget' },
    parent: 'PROJECT_PAGE_BODY',
    displayName: 'EventsWidget',
  }),
});

describe('Events widgets stored under their legacy names', () => {
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

  after(() => {
    cy.apiUpdateHomepageLayout({ craftjs_json: homepageLayout });
    if (projectId) cy.apiRemoveProject(projectId);
  });

  // The homepage node is a teaser: upcoming only, capped, with a link to the events page.
  it('renders a stored `Events` node as the homepage teaser', () => {
    cy.apiUpdateHomepageLayout({ craftjs_json: homepageLayoutWithEvents() });

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
    cy.apiUpdateProjectPageLayout(projectId, projectPageLayoutWithEvents());

    cy.intercept('GET', '**/events**').as('getEvents');
    cy.visit(`/projects/${projectSlug}`);
    cy.wait('@getEvents');

    cy.get('#e2e-project-page-events').should('exist');
    cy.get('#e2e-project-page-events').should('contain', upcomingTitle);
    cy.get('#e2e-project-page-events').should('contain', pastTitle);
  });
});
