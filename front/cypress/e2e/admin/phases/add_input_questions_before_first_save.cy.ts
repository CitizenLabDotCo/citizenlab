import { randomString } from '../../../support/commands';

describe('Adding input questions before saving a phase', () => {
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

  ['ideation', 'proposals'].forEach((method) => {
    it(`validates and saves a draft ${method} phase before opening its form`, () => {
      const draftPath = `/admin/projects/${projectId}/phases/new`;
      cy.intercept('POST', `**/web_api/v1/projects/${projectId}/phases`).as(
        'createPhase'
      );
      cy.visit(
        `${draftPath}?project_backoffice_redesign&participation_method=${method}`
      );

      cy.get('[data-cy="add-draft-input-questions"]').click();
      cy.contains('The phase could not be saved.').should('exist');
      cy.contains('Missing start date').should('exist');
      cy.location('pathname').should('include', draftPath);
      cy.get('@createPhase.all').should('have.length', 0);

      cy.get('.e2e-date-phase-picker-input').click();
      cy.get('.rdp-today .rdp-day_button').first().click();
      cy.get('.e2e-date-phase-picker-input').click();
      cy.get('[data-cy="add-draft-input-questions"]').scrollIntoView().click();
      cy.wait('@createPhase').its('response.statusCode').should('eq', 422);
      cy.contains('This cannot be empty.').should('exist');
      cy.location('pathname').should('include', draftPath);

      cy.get('#phase-build-panel-title').type('Input collection');
      cy.get('[data-cy="add-draft-input-questions"]').scrollIntoView().click();
      cy.wait('@createPhase').then(({ response }) => {
        expect(response?.statusCode).to.eq(201);
        cy.location('pathname').should(
          'include',
          `/phases/${response?.body.data.id}/form/edit`
        );
      });
    });
  });

  it('warns about the shared ideation form and keeps the saved phase when cancelled', () => {
    cy.apiCreatePhase({
      projectId,
      title: randomString(),
      startAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      endAt: new Date(Date.now() - 86400000).toISOString(),
      participationMethod: 'ideation',
    });
    cy.intercept('POST', `**/web_api/v1/projects/${projectId}/phases`).as(
      'createPhase'
    );
    cy.visit(
      `/admin/projects/${projectId}/phases/new?project_backoffice_redesign&participation_method=ideation`
    );
    cy.get('.e2e-date-phase-picker-input').click();
    cy.get('.rdp-today .rdp-day_button').first().click();
    cy.get('.e2e-date-phase-picker-input').click();
    cy.get('#phase-build-panel-title').type('Another ideation phase');
    cy.get('[data-cy="add-draft-input-questions"]').scrollIntoView().click();
    cy.wait('@createPhase').then(({ response }) => {
      expect(response?.statusCode).to.eq(201);
      cy.get('[data-cy="e2e-form-input-edit-warning-modal"]').should(
        'be.visible'
      );
      cy.get('[role="dialog"] .e2e-modal-close-button').click();
      cy.location('pathname').should(
        'include',
        `/phases/${response?.body.data.id}/setup`
      );
      cy.get('@createPhase.all').should('have.length', 1);
    });
  });
});
