import { randomString } from '../../../../support/commands';

describe('Adding survey questions before saving a phase', () => {
  let projectId: string;

  before(() => {
    cy.apiCreateProject({
      title: randomString(),
      descriptionPreview: randomString(),
      publicationStatus: 'draft',
    }).then((project) => {
      projectId = project.body.data.id;
    });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('stays on the draft when saving fails and opens survey setup after a retry', () => {
    const draftPath = `/admin/projects/${projectId}/phases/new`;
    cy.setConsentAndAdminLoginCookies();
    cy.intercept('POST', `**/web_api/v1/projects/${projectId}/phases`).as(
      'createPhase'
    );
    cy.visit(
      `${draftPath}?project_backoffice_redesign&participation_method=native_survey`
    );

    cy.get('[data-cy="add-draft-survey-questions"]').click();
    cy.contains('The phase could not be saved.')
      .scrollIntoView()
      .should('be.visible');
    cy.contains('Missing start date').should('exist');
    cy.location('pathname').should('include', draftPath);

    cy.get('.e2e-date-phase-picker-input').click();
    cy.get('.rdp-today .rdp-day_button').first().click();
    cy.get('.e2e-date-phase-picker-input').click();

    cy.get('[data-cy="add-draft-survey-questions"]').click();
    cy.wait('@createPhase').its('response.statusCode').should('eq', 422);
    cy.contains('This cannot be empty.').should('exist');
    cy.contains('The phase could not be saved.')
      .scrollIntoView()
      .should('be.visible');
    cy.location('pathname').should('include', draftPath);
    cy.get('[role="dialog"]').should('not.exist');

    cy.get('#phase-build-panel-title').type('Survey for the neighbourhood');
    cy.get('[data-cy="add-draft-survey-questions"]').click();

    cy.wait('@createPhase').then(({ response }) => {
      expect(response?.statusCode).to.eq(201);
      const phasePath = `/admin/projects/${projectId}/phases/${response?.body.data.id}`;

      cy.location('pathname').should('include', `${phasePath}/setup`);
      cy.get('[role="dialog"]')
        .contains('button', /^(Start from scratch|Edit form)$/)
        .click();
      cy.location('pathname').should(
        'include',
        `${phasePath}/survey-form/edit`
      );
    });
  });
});
