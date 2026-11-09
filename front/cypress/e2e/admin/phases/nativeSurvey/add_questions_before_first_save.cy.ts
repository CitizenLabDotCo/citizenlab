import { randomString } from '../../../../support/commands';

describe('Adding survey questions before saving a phase', () => {
  let projectId: string;

  beforeEach(() => {
    cy.apiCreateProject({
      title: randomString(),
      descriptionPreview: randomString(),
      publicationStatus: 'draft',
    }).then((project) => {
      projectId = project.body.data.id;
    });
  });

  afterEach(() => {
    cy.apiRemoveProject(projectId);
  });

  it('saves only after choosing an action and opens the form after a valid retry', () => {
    const draftPath = `/admin/projects/${projectId}/phases/new`;
    cy.setConsentAndAdminLoginCookies();
    cy.intercept(
      'POST',
      `**/web_api/v1/projects/${projectId}/phases`,
      (request) => {
        request.continue((response) => {
          if (response.statusCode === 201) response.setDelay(800);
        });
      }
    ).as('createPhase');
    cy.visit(
      `${draftPath}?project_backoffice_redesign&participation_method=native_survey`
    );

    cy.get('[data-cy="add-draft-survey-questions"]').click();
    cy.get('[role="dialog"]').contains('button', 'Start from scratch').click();
    cy.contains('The phase could not be saved.')
      .scrollIntoView()
      .should('be.visible');
    cy.contains('Missing start date').should('exist');
    cy.location('pathname').should('include', draftPath);

    cy.get('.e2e-date-phase-picker-input').click();
    cy.get('.rdp-today .rdp-day_button').first().click();
    cy.get('.e2e-date-phase-picker-input').click();

    cy.get('[data-cy="add-draft-survey-questions"]').click();
    cy.get('[role="dialog"]').contains('button', 'Start from scratch').click();
    cy.wait('@createPhase').its('response.statusCode').should('eq', 422);
    cy.contains('This cannot be empty.').should('exist');
    cy.contains('The phase could not be saved.')
      .scrollIntoView()
      .should('be.visible');
    cy.location('pathname').should('include', draftPath);
    cy.get('[role="dialog"]').should('not.exist');

    cy.get('#phase-build-panel-title').type('Survey for the neighbourhood');
    cy.get('[data-cy="add-draft-survey-questions"]').scrollIntoView().click();
    cy.get('[role="dialog"]')
      .contains('button', 'Start from scratch')
      .should('be.visible');
    cy.get('[role="dialog"] .e2e-modal-close-button').click();
    cy.get('[role="dialog"]').should('not.exist');
    cy.get('@createPhase.all').should('have.length', 1);
    cy.location('pathname').should('include', draftPath);

    cy.get('[data-cy="add-draft-survey-questions"]').click();
    cy.get('[role="dialog"]').contains('button', 'Start from scratch').click();

    cy.get('[role="dialog"]')
      .contains('Saving the phase and opening your selection')
      .should('be.visible');

    cy.wait('@createPhase').then(({ response }) => {
      expect(response?.statusCode).to.eq(201);
      const phasePath = `/admin/projects/${projectId}/phases/${response?.body.data.id}`;

      cy.location('pathname').should(
        'include',
        `${phasePath}/survey-form/edit`
      );
    });
  });

  it('opens the copy picker after saving the destination phase', () => {
    const draftPath = `/admin/projects/${projectId}/phases/new`;
    cy.setConsentAndAdminLoginCookies();
    cy.intercept('POST', `**/web_api/v1/projects/${projectId}/phases`).as(
      'createPhase'
    );
    cy.visit(
      `${draftPath}?project_backoffice_redesign&participation_method=native_survey`
    );

    cy.get('.e2e-date-phase-picker-input').click();
    cy.get('.rdp-today .rdp-day_button').first().click();
    cy.get('.e2e-date-phase-picker-input').click();
    cy.get('#phase-build-panel-title').type('Survey for the neighbourhood');

    cy.get('[data-cy="add-draft-survey-questions"]').scrollIntoView().click();
    cy.get('[role="dialog"]')
      .contains('button', 'Use a previous survey')
      .click();
    cy.wait('@createPhase').its('response.statusCode').should('eq', 201);
    cy.get('[data-cy="e2e-copy-survey-modal"]').should('be.visible');

    cy.get('[role="dialog"] .e2e-modal-close-button').click();
    cy.get('[role="dialog"]').should('not.exist');
    cy.location('search').should('not.include', 'survey_action');
  });
});
