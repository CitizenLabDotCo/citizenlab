import { randomString } from '../../../support/commands';

describe('Opening setup settings before saving a phase', () => {
  let projectId: string;

  beforeEach(() => {
    cy.apiCreateProject({
      title: randomString(),
      descriptionPreview: randomString(),
      publicationStatus: 'draft',
    }).then((project) => {
      projectId = project.body.data.id;
    });
    cy.setConsentAndAdminLoginCookies();
  });

  afterEach(() => {
    cy.apiRemoveProject(projectId);
  });

  it('keeps the draft on failed saves, then saves once and opens access settings', () => {
    cy.intercept(
      'POST',
      `**/web_api/v1/projects/${projectId}/phases`,
      (request) => {
        request.continue((response) => {
          if (response.statusCode === 201) response.setDelay(2000);
        });
      }
    ).as('createPhase');
    const draftPath = `/admin/projects/${projectId}/phases/new`;
    cy.visit(
      `${draftPath}?project_backoffice_redesign&participation_method=ideation`
    );
    cy.contains(
      'Access rights, notifications and other settings become available'
    ).should('not.exist');
    cy.get('[data-cy="draft-access-settings"]').scrollIntoView().click();
    cy.contains('The phase could not be saved.').should('exist');
    cy.contains('Missing start date').should('exist');
    cy.location('pathname').should('include', draftPath);
    cy.get('@createPhase.all').should('have.length', 0);

    cy.get('.e2e-date-phase-picker-input').click();
    cy.get('.rdp-today .rdp-day_button').first().click();
    cy.get('.e2e-date-phase-picker-input').click();
    cy.get('[data-cy="draft-access-settings"]').scrollIntoView().click();
    cy.wait('@createPhase').its('response.statusCode').should('eq', 422);
    cy.contains('This cannot be empty.').should('exist');
    cy.location('pathname').should('include', draftPath);
    cy.get('[role="dialog"]').should('not.exist');

    cy.get('#phase-build-panel-title').type('Ideas with access settings');
    cy.get('[data-cy="draft-access-settings"]').scrollIntoView().click();
    cy.wait('@createPhase').then(({ response }) => {
      expect(response?.statusCode).to.eq(201);
      cy.location('pathname').should(
        'include',
        `/phases/${response?.body.data.id}/setup`
      );
    });
    cy.get('[role="dialog"]').contains('Edit access').should('be.visible');
    cy.get('[role="dialog"]')
      .contains('You can specify who can take each action')
      .should('be.visible');
    cy.get('[role="dialog"] .e2e-modal-close-button').click();
    cy.location('search').should('not.include', 'setup_action');
    cy.get('@createPhase.all').should('have.length', 2);
  });

  [
    { method: 'information', action: 'access' },
    { method: 'native_survey', action: 'notification' },
    { method: 'proposals', action: 'notification' },
    { method: 'voting', action: 'moderation' },
    { method: 'ideation', action: 'moderation' },
    { method: 'proposals', action: 'moderation' },
  ].forEach(({ method, action }) => {
    it(`opens ${action} settings after saving a ${method} phase`, () => {
      cy.intercept('POST', `**/web_api/v1/projects/${projectId}/phases`).as(
        'createPhase'
      );
      cy.visit(
        `/admin/projects/${projectId}/phases/new?project_backoffice_redesign&participation_method=${method}`
      );
      cy.get('.e2e-date-phase-picker-input').click();
      cy.get('.rdp-today .rdp-day_button').first().click();
      cy.get('.e2e-date-phase-picker-input').click();
      cy.get('#phase-build-panel-title').type('Phase with setup settings');
      cy.get(`[data-cy="draft-${action}-settings"]`).scrollIntoView().click();
      cy.wait('@createPhase').then(({ response }) => {
        expect(response?.statusCode).to.eq(201);
        cy.location('pathname').should(
          'include',
          `/phases/${response?.body.data.id}/setup`
        );
      });
      if (action === 'access') {
        cy.get('[role="dialog"]').contains('Edit access').should('be.visible');
      } else if (action === 'notification') {
        cy.contains('button', 'Notifications').should(
          'have.attr',
          'aria-expanded',
          'true'
        );
      } else {
        cy.get('#phase-moderation-settings')
          .contains('Assignee')
          .should('be.visible');
        cy.get('#phase-moderation-settings')
          .find('button[aria-haspopup="true"]')
          .should('be.visible');
        cy.get('[role="radiogroup"][aria-label="Assignee"]').should(
          'be.visible'
        );
      }
      cy.get('@createPhase.all').should('have.length', 1);
    });
  });
});
