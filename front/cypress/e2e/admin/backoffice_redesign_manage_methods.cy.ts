import { format, subMonths } from 'date-fns';

import { IIdeaData } from '../../../app/api/ideas/types';

import { randomString } from '../../support/commands';

describe('Redesigned method-specific Manage views', () => {
  let projectId: string;
  let phaseId: string;
  let inputTerm: string;
  let supporterId: string | undefined;
  const optionTitle = randomString();

  beforeEach(() => {
    cy.setAdminLoginCookie();
  });
  afterEach(() => {
    if (projectId) cy.apiRemoveProject(projectId);
    if (supporterId) cy.apiRemoveUser(supporterId);
    supporterId = undefined;
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
          reactingThreshold: method === 'proposals' ? 2 : undefined,
          expireDaysLimit: method === 'proposals' ? 30 : undefined,
        });
      })
      .then((phase) => {
        phaseId = phase.body.data.id;
        inputTerm = phase.body.data.attributes.input_term;
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
        cy.contains('button', 'Import paper').click();
        cy.get('[role="dialog"]').should('contain.text', 'Spreadsheet');
        cy.get('[role="dialog"] .e2e-modal-close-button').click();
        cy.contains('button', `New ${inputTerm}`).click();
        cy.get('[role="dialog"]').should('contain.text', 'Title');
      });
  });

  it('keeps the countdown after reaching the proposal threshold', () => {
    const supporterEmail = `${randomString()}@example.com`;
    const supporterPassword = randomString(16);
    let proposalId: string;
    let expired = false;

    cy.intercept('GET', '**/web_api/v1/ideas?*', (request) => {
      request.continue((response) => {
        if (!expired) return;

        const proposal = response.body.data.find(
          (idea: IIdeaData) => idea.id === proposalId
        );
        if (proposal) {
          proposal.attributes.expires_at = new Date(0).toISOString();
        }
      });
    });

    createMethod('proposals')
      .then(() =>
        cy.apiCreateIdea({
          phaseId,
          ideaTitle: optionTitle,
          ideaContent: randomString(30),
        })
      )
      .then((idea) => {
        proposalId = idea.body.data.id;
        return cy.apiSignup(
          'Proposal',
          'Supporter',
          supporterEmail,
          supporterPassword
        );
      })
      .then((supporter) => {
        supporterId = supporter.body.data.id;
        return cy.apiReactToIdea(
          supporterEmail,
          supporterPassword,
          proposalId,
          'up'
        );
      })
      .then(() => {
        cy.visit(
          `admin/projects/${projectId}/phases/${phaseId}/proposals?project_backoffice_redesign`
        );
        cy.get(`[data-cy="e2e-idea-row-${proposalId}"]`)
          .should('contain.text', 'threshold reached')
          .and('contain.text', '2 / 2')
          .and('contain.text', 'days left')
          .and('not.contain.text', 'Closed');

        cy.then(() => {
          expired = true;
        });
        cy.reload();
        cy.get(`[data-cy="e2e-idea-row-${proposalId}"]`).should(
          'contain.text',
          'Closed'
        );
        cy.then(() => {
          expired = false;
        });
        cy.reload();
        cy.get(`[data-cy="e2e-idea-row-${proposalId}"]`).should(
          'contain.text',
          'days left'
        );

        cy.apiSetIdeaStatus({
          ideaId: proposalId,
          statusCode: 'answered',
          participationMethod: 'proposals',
        });
        cy.reload();
        cy.get(`[data-cy="e2e-idea-row-${proposalId}"]`).should(
          'contain.text',
          'Closed'
        );
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
