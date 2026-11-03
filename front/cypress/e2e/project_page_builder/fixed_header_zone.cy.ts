import { randomString } from '../../support/commands';

describe('Project page builder fixed header zone', () => {
  let projectId = '';
  const projectTitle = randomString();

  // The page body only appears once the admin bundle has booted and the layout
  // query has resolved, which outlasts defaultCommandTimeout on a contended CI
  // node and by a wide margin against a local dev server.
  const BUILDER_BOOT_TIMEOUT = 60000;

  before(() => {
    cy.setAdminLoginCookie();
    cy.apiCreateProject({
      title: projectTitle,
      description: '',
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
    });
  });

  after(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit(`/admin/project-page-builder/projects/${projectId}`);
    cy.get('#e2e-project-page-body', {
      timeout: BUILDER_BOOT_TIMEOUT,
    }).should('exist');
  });

  it('shows  header zone with specific chip and tooltip', () => {
    cy.contains('Fixed — editable only').should('exist');
    cy.get('[data-cy="locked-zone-pill-tooltip"]').click();
    cy.contains(
      "Pinned to the top of the page — editable, but can't be moved or removed."
    ).should('be.visible');
  });

  // A chip is drawn 28px above its widget, and the canvas leaves only 24px of
  // top padding for it. So a chip is on screen only while the canvas is
  // scrolled to the top. Cypress scrolls its target to the top of the scroll
  // container before clicking it, which pushes that widget's own chip out.
  const scrollCanvasToTop = () =>
    cy
      .get('#e2e-project-page-content-builder-page')
      .children()
      .eq(1)
      .scrollTo('top');

  it('shows a specific chip when clicking on the banner or the title', () => {
    cy.get('#PROJECT_PAGE_BANNER').click();
    scrollCanvasToTop();
    cy.contains(
      "Project image - click to edit — can't be moved or removed"
    ).should('be.visible');
    cy.get('#PROJECT_PAGE_TITLE').click();
    scrollCanvasToTop();
    cy.contains("Title - click to edit — can't be moved or removed").should(
      'be.visible'
    );
  });
});
