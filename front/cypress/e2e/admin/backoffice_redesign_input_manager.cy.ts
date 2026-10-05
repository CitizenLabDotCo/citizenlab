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
    cy.get('#e2e-side-modal-content').contains('h2', firstTitle);

    cy.reload();
    cy.get('#e2e-side-modal-content').contains('h2', firstTitle);

    cy.get('.e2e-modal-close-button').click();
    cy.location('search').should('not.include', 'selected_idea_id');
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
