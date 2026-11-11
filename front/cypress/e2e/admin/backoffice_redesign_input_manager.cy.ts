import { format, subMonths } from 'date-fns';

import { randomString } from '../../support/commands';

describe('Redesigned input manager', () => {
  const firstTitle = randomString(10);
  const secondTitle = randomString(10);
  let projectId: string;
  let phaseId: string;
  let firstIdeaId: string;
  let secondIdeaId: string;

  before(() => {
    cy.apiCreateProject({
      title: randomString(),
      descriptionPreview: randomString(),
      publicationStatus: 'published',
    })
      .then((project) => {
        projectId = project.body.data.id;
        return cy.apiCreatePhase({
          projectId,
          title: randomString(),
          startAt: format(subMonths(new Date(), 1), 'dd/MM/yyyy'),
          participationMethod: 'ideation',
          canPost: true,
          canComment: true,
          canReact: true,
        });
      })
      .then((phase) => {
        phaseId = phase.body.data.id;
        return cy.apiCreateIdea({
          phaseId,
          ideaTitle: firstTitle,
          ideaContent: randomString(30),
        });
      })
      .then((idea) => {
        firstIdeaId = idea.body.data.id;
        return cy.apiCreateIdea({
          phaseId,
          ideaTitle: secondTitle,
          ideaContent: randomString(30),
        });
      })
      .then((idea) => {
        secondIdeaId = idea.body.data.id;
      });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit(
      `admin/projects/${projectId}/phases/${phaseId}/ideas?project_backoffice_redesign`
    );
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('opens an input in the side panel through the url', () => {
    cy.get(`[data-cy="e2e-idea-row-${firstIdeaId}"]`)
      .contains(firstTitle)
      .click();

    cy.location('search').should('include', `selected_idea_id=${firstIdeaId}`);
    cy.get('#e2e-side-modal-content').contains(firstTitle);

    cy.reload();
    cy.get('#e2e-side-modal-content').contains(firstTitle);

    cy.get('.e2e-modal-close-button').click();
    cy.location('search').should('not.include', 'selected_idea_id');
  });

  it('keeps the preview open when selecting an input property', () => {
    cy.get(`[data-cy="e2e-idea-row-${firstIdeaId}"]`)
      .contains(firstTitle)
      .click();
    cy.get('#e2e-side-modal-content').within(() => {
      cy.get('[aria-haspopup="menu"]').first().click();
      cy.get('[role="menuitemcheckbox"][aria-checked="true"]').click();
      cy.contains(firstTitle).scrollIntoView().should('be.visible');
    });
    cy.location('search').should('include', `selected_idea_id=${firstIdeaId}`);
  });

  it('starts with the timeline open and platform navigation hidden', () => {
    cy.contains('Participation').should('be.visible');
    cy.get('[data-project-workspace-header]').then((header) => {
      cy.get('[aria-label="Platform navigation"]').should((button) => {
        expect(button[0].getBoundingClientRect().top).to.eq(
          header[0].getBoundingClientRect().top
        );
      });
    });
    cy.get('[aria-label="Platform navigation"]')
      .should('have.attr', 'aria-expanded', 'false')
      .click();
    cy.get('[aria-label="Platform navigation"]').should(
      'have.attr',
      'aria-expanded',
      'true'
    );
    cy.get('[aria-label="Platform navigation"]').trigger('keydown', {
      key: 'Escape',
    });
    cy.get('[aria-label="Platform navigation"]').should(
      'have.attr',
      'aria-expanded',
      'false'
    );
  });

  it('opens the export dropdown without displaying an AI banner', () => {
    cy.contains('Explore AI-powered summaries').should('not.exist');
    cy.contains('button', 'Export').click();
    cy.get('[role="menu"]')
      .should('be.visible')
      .and('contain.text', 'Export all project inputs');
  });

  it('filters the inputs with the search', () => {
    cy.get(`[data-cy="e2e-idea-row-${secondIdeaId}"]`).should('exist');

    cy.get('[data-cy="e2e-input-manager-search-toggle"]').click();
    cy.get('[data-cy="e2e-input-manager-search"] input').type(firstTitle);

    cy.location('search').should('include', `search=${firstTitle}`);
    cy.get(`[data-cy="e2e-idea-row-${firstIdeaId}"]`).should('exist');
    cy.get(`[data-cy="e2e-idea-row-${secondIdeaId}"]`).should('not.exist');
  });
});
