import { format, subMonths } from 'date-fns';

import { randomString } from '../../support/commands';

const GREEN_500 = 'rgb(4, 136, 76)';
const RED_600 = 'rgb(214, 22, 7)';

describe('Project page builder drop feedback', () => {
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
      // A project without a phase collapses the timeline and events widgets,
      // which leaves the page body too short to aim at anything but its edges.
      return cy.apiCreatePhase({
        projectId,
        title: 'firstPhaseTitle',
        startAt: format(subMonths(new Date(), 1), 'dd/MM/yyyy'),
        participationMethod: 'ideation',
        canPost: true,
        canComment: true,
        canReact: true,
      });
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

  // The overlay is inert (`pointer-events: none`), so Cypress reads every part
  // of it as covered by the page underneath and `be.visible` never holds.
  it('marks the page content as the drop zone and invites the drop', () => {
    cy.get('#e2e-draggable-events').dragOver('#PROJECT_PAGE_PHASES', {
      position: 'above',
    });

    cy.get('[data-cy="drop-zone-outline"]').should('exist');
    cy.get('[data-cy="drop-indicator-bar"]')
      .should('exist')
      .and('have.css', 'background-color', GREEN_500);
    cy.contains('Place here').should('exist');
    cy.get('[data-cy="fixed-zone-veil"]').should('not.exist');

    cy.get('#e2e-draggable-events').drop();
  });

  it('explains why the fixed header refuses a widget', () => {
    cy.get('#e2e-draggable-events').dragOver('#PROJECT_PAGE_TITLE', {
      position: 'above',
    });

    cy.get('[data-cy="drop-indicator-bar"]')
      .should('exist')
      .and('have.css', 'background-color', RED_600);
    cy.contains("Can't place widgets in the fixed header").should('exist');
    cy.get('[data-cy="fixed-zone-veil"]').should('exist');
    cy.contains('The project image and title are fixed').should('exist');

    cy.get('#e2e-draggable-events').drop();
  });
});
