import { format, subMonths } from 'date-fns';

import { randomEmail, randomString } from '../../support/commands';

describe('Redesigned Common Ground manager', () => {
  let projectId: string;
  let phaseId: string;
  let sourcePhaseId: string;
  let userId: string | undefined;
  const projectTitle = randomString();
  const sourcePhaseTitle = randomString();
  const firstTitle = randomString();
  const secondTitle = randomString();

  beforeEach(() => {
    userId = undefined;

    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: randomString(),
      publicationStatus: 'published',
    })
      .then((project) => {
        projectId = project.body.data.id;
        return cy.apiCreatePhase({
          projectId,
          title: sourcePhaseTitle,
          startAt: format(subMonths(new Date(), 2), 'dd/MM/yyyy'),
          endAt: format(subMonths(new Date(), 1), 'dd/MM/yyyy'),
          participationMethod: 'ideation',
          canPost: true,
        });
      })
      .then((phase) => {
        sourcePhaseId = phase.body.data.id;
        return cy.apiCreatePhase({
          projectId,
          title: randomString(),
          startAt: format(subMonths(new Date(), 1), 'dd/MM/yyyy'),
          participationMethod: 'common_ground',
          canPost: true,
          canReact: true,
        });
      })
      .then((phase) => {
        phaseId = phase.body.data.id;
      });

    cy.setAdminLoginCookie();
  });

  afterEach(() => {
    cy.apiRemoveProject(projectId);
    if (userId) cy.apiRemoveUser(userId);
  });

  it('counts neutral-only reactions in the statements table', () => {
    const email = randomEmail();
    const password = randomString();
    let statementId: string;

    cy.apiSignup(randomString(), randomString(), email, password)
      .then((user) => {
        userId = user.body.data.id;
        return cy.apiCreateIdea({
          phaseId,
          ideaTitle: firstTitle,
          ideaContent: randomString(30),
        });
      })
      .then((idea) => {
        statementId = idea.body.data.id;
        return cy.apiReactToIdea(email, password, statementId, 'neutral');
      })
      .then(() => {
        cy.visit(
          `admin/projects/${projectId}/phases/${phaseId}/ideas?project_backoffice_redesign`
        );
        cy.get(`[data-cy="e2e-statement-row-${statementId}"]`).within(() => {
          cy.get('td').eq(2).should('have.text', '0%');
          cy.get('td').eq(3).should('have.text', '1');
        });
      });
  });

  it('refreshes the empty state and counts after importing statements', () => {
    [firstTitle, secondTitle].forEach((title) => {
      cy.then(() =>
        cy.apiCreateIdea({
          phaseId: sourcePhaseId,
          ideaTitle: title,
          ideaContent: randomString(30),
        })
      );
    });

    cy.then(() => {
      cy.visit(
        `admin/projects/${projectId}/phases/${phaseId}/ideas?project_backoffice_redesign`
      );
    });
    cy.contains('No inputs yet').should('be.visible');
    cy.contains('0 statements').should('be.visible');
    cy.contains('button', 'Import inputs').click();
    cy.get('[role="dialog"]').within(() => {
      cy.get('[role="combobox"]').first().type(projectTitle);
      cy.contains('[role="option"]', projectTitle).click();
      cy.get('#e2e-phase-filter').select(sourcePhaseId);
      cy.contains('2 inputs will be imported').should('be.visible');
      cy.contains('button', 'Import inputs').click();
    });

    cy.contains('2 statements', { timeout: 30000 }).should('be.visible');
    cy.contains('No inputs yet').should('not.exist');
    cy.contains('[data-cy^="e2e-statement-row-"]', firstTitle).should(
      'be.visible'
    );
    cy.contains('[data-cy^="e2e-statement-row-"]', secondTitle).should(
      'be.visible'
    );
    cy.contains('Statements').parent().should('contain.text', '2');
  });
});
