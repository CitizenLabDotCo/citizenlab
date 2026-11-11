import { format, subMonths } from 'date-fns';

import { randomString } from '../../support/commands';

describe('Redesigned method-specific Manage views', () => {
  let projectId: string;
  let phaseId: string;
  const optionTitle = randomString();

  beforeEach(() => {
    cy.setAdminLoginCookie();
  });
  afterEach(() => {
    if (projectId) cy.apiRemoveProject(projectId);
  });

  const createMethod = (method: 'voting' | 'proposals' | 'volunteering') =>
    cy
      .apiCreateProject({
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
          participationMethod: method,
          votingMethod: method === 'voting' ? 'single_voting' : undefined,
          canPost: true,
          canReact: true,
        });
      })
      .then((phase) => {
        phaseId = phase.body.data.id;
      });

  it('saves offline votes through the voting action', () => {
    createMethod('voting')
      .then(() =>
        cy.apiCreateIdea({
          phaseId,
          ideaTitle: optionTitle,
          ideaContent: randomString(30),
        })
      )
      .then((idea) => {
        cy.visit(
          `admin/projects/${projectId}/phases/${phaseId}/ideas?project_backoffice_redesign`
        );
        cy.contains('button', 'Import paper').should('not.exist');
        cy.get('thead')
          .should('contain.text', 'Votes')
          .and('contain.text', 'Online')
          .and('contain.text', 'Offline')
          .and('not.contain.text', 'Assignee')
          .and('not.contain.text', 'Status');
        cy.contains('button', 'Import options').click();
        cy.get('[role="dialog"]').should('contain.text', 'Spreadsheet');
        cy.get('[role="dialog"] .e2e-modal-close-button').click();
        cy.contains('button', 'Add offline votes').click();
        cy.get('[role="dialog"]').within(() => {
          cy.get('[aria-label="Remove one"]').should(
            'have.attr',
            'aria-disabled',
            'true'
          );
          cy.get('[aria-label="Add one"]').click();
          cy.get('input[type="number"]')
            .should('have.value', '1')
            .clear()
            .type('7');
          cy.contains('button', 'Save offline votes').click();
        });
        cy.get('[role="dialog"]').should('not.exist');
        cy.get(`[data-cy="e2e-idea-row-${idea.body.data.id}"]`).should(
          'contain.text',
          '7'
        );
        cy.reload();
        cy.get(`[data-cy="e2e-idea-row-${idea.body.data.id}"]`).should(
          'contain.text',
          '7'
        );
      });
  });

  it('shows proposal support and time left by default', () => {
    createMethod('proposals')
      .then(() =>
        cy.apiCreateIdea({
          phaseId,
          ideaTitle: optionTitle,
          ideaContent: randomString(30),
        })
      )
      .then(() => {
        cy.visit(
          `admin/projects/${projectId}/phases/${phaseId}/proposals?project_backoffice_redesign`
        );
        cy.get('thead')
          .should('contain.text', 'Votes')
          .and('contain.text', 'Comments')
          .and('contain.text', 'Time left');
        cy.contains('button', 'Import paper').should('not.exist');
      });
  });

  it('offers signup date filtering even before the first volunteer', () => {
    createMethod('volunteering').then(() => {
      cy.visit(
        `admin/projects/${projectId}/phases/${phaseId}/volunteering?project_backoffice_redesign`
      );
      cy.contains('No volunteers yet').should('be.visible');
      cy.intercept('GET', `**/phases/${phaseId}/volunteers*`).as('volunteers');
      cy.get('[aria-label="Filter"]')
        .click()
        .should('have.attr', 'aria-expanded', 'true');
      cy.contains('button', 'Signed up').click();
      cy.contains('button', 'Earlier').click();
      cy.wait('@volunteers')
        .its('request.query.signed_up')
        .should('eq', 'earlier');
      cy.contains('No volunteers match these filters.').should('be.visible');
    });
  });
});
