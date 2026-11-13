import { randomString } from '../../support/commands';

describe('Survey reuse feedback', () => {
  const projects: string[] = [];
  let targetId: string;
  let targetPhaseId: string;
  let sourcePhaseId: string;
  let otherPhaseId: string;
  let surveyTitle: string;
  let otherTitle: string;
  let ideaTitle: string;

  const create = (title: string, method: 'native_survey' | 'ideation') =>
    cy
      .apiCreateProject({
        title,
        descriptionPreview: randomString(),
        publicationStatus: 'draft',
      })
      .then(({ body }) => {
        const id = body.data.id;
        projects.push(id);
        return cy
          .apiCreatePhase({
            projectId: id,
            title,
            startAt: '2026-01-01',
            participationMethod: method,
            nativeSurveyTitleMultiloc:
              method === 'native_survey'
                ? { en: title, 'nl-BE': title }
                : undefined,
            nativeSurveyButtonMultiloc:
              method === 'native_survey'
                ? { en: 'Take the survey', 'nl-BE': 'Take the survey' }
                : undefined,
          })
          .then((phase) => ({ id, phaseId: phase.body.data.id }));
      });

  const visitSetup = () =>
    cy.visit(
      `/admin/projects/${targetId}/phases/${targetPhaseId}/setup?project_backoffice_redesign`
    );
  const openReuse = () => {
    cy.contains('button', 'Edit survey').click();
    cy.contains('Use a previous survey').click();
  };
  const chooseProject = (title: string) => {
    cy.get('[data-cy="e2e-copy-survey-modal"] input[role="combobox"]').type(
      title
    );
    cy.get('[role="option"]').contains(title).click();
  };

  beforeEach(() => {
    surveyTitle = `Source survey ${randomString()}`;
    otherTitle = `Other survey ${randomString()}`;
    ideaTitle = `Ideas only ${randomString()}`;
    cy.setConsentAndAdminLoginCookies();
    create(`Target survey ${randomString()}`, 'native_survey').then(
      ({ id, phaseId }) => {
        targetId = id;
        targetPhaseId = phaseId;
      }
    );
    create(surveyTitle, 'native_survey').then(({ phaseId }) => {
      sourcePhaseId = phaseId;
    });
    create(otherTitle, 'native_survey').then(({ phaseId }) => {
      otherPhaseId = phaseId;
    });
    create(ideaTitle, 'ideation');
  });

  afterEach(() => {
    projects.splice(0).forEach((id) => cy.apiRemoveProject(id));
  });

  it('filters source projects and clears the source survey on project changes and reopening', () => {
    cy.intercept('GET', '**/projects/for_admin?*native_survey*').as(
      'sourceProjects'
    );
    visitSetup();
    openReuse();
    chooseProject(surveyTitle);
    cy.wait('@sourceProjects')
      .its('request.url')
      .should('include', 'native_survey');
    cy.get('#e2e-phase-filter').select(sourcePhaseId);
    cy.dataCy('e2e-copy-survey-modal-duplicate')
      .find('button')
      .should('have.attr', 'aria-disabled', 'false');
    chooseProject(otherTitle);
    cy.dataCy('e2e-copy-survey-modal-duplicate')
      .find('button')
      .should('have.attr', 'aria-disabled', 'true');
    cy.get('#e2e-phase-filter').select(otherPhaseId);
    cy.dataCy('e2e-copy-survey-modal-duplicate')
      .find('button')
      .should('have.attr', 'aria-disabled', 'false');
    cy.get('[role="dialog"]').contains('button', 'Cancel').click();
    openReuse();
    cy.dataCy('e2e-copy-survey-modal-duplicate')
      .find('button')
      .should('have.attr', 'aria-disabled', 'true');
    cy.get('[data-cy="e2e-copy-survey-modal"] input[role="combobox"]').type(
      ideaTitle
    );
    cy.wait('@sourceProjects');
    cy.contains('[role="option"]', ideaTitle).should('not.exist');
  });

  it('shows the replacement warning immediately after the first form save without reloading', () => {
    visitSetup();
    cy.contains('button', 'Edit survey').click();
    cy.contains('Edit form').click();
    cy.get('[data-cy="e2e-field-row"]').contains('Your question').click();
    cy.get('#e2e-title-multiloc').clear().type('Saved manual question');
    cy.intercept(
      'PATCH',
      `**/phases/${targetPhaseId}/custom_fields/update_all`
    ).as('saveQuestions');
    cy.get('[data-cy="e2e-form-builder-top-bar"]')
      .contains('button', 'Save')
      .click();
    cy.wait('@saveQuestions').its('response.statusCode').should('eq', 200);
    cy.get('[data-cy="e2e-form-builder-top-bar"]')
      .contains('button', 'Save')
      .should('have.attr', 'aria-disabled', 'false');
    cy.contains('button', 'Go back').click();
    cy.get('body')
      .should(($body) => {
        const builderOpen =
          $body.find('[data-cy="e2e-form-builder-top-bar"]').length > 0;
        expect(
          !builderOpen ||
            $body.text().includes('Are you sure you want to leave?')
        ).to.eq(true);
      })
      .then(($body) => {
        if ($body.text().includes('Are you sure you want to leave?')) {
          cy.contains('Yes, I want to leave').click();
        }
      });
    openReuse();
    cy.get('[role="dialog"]').should(
      'contain',
      'You have already saved changes to this survey'
    );
  });

  it('validates a draft and opens reuse before its first explicit save', () => {
    cy.apiCreateProject({
      title: randomString(),
      descriptionPreview: randomString(),
      publicationStatus: 'draft',
    }).then(({ body }) => {
      projects.push(body.data.id);
      cy.visit(
        `/admin/projects/${body.data.id}/phases/new?project_backoffice_redesign&participation_method=native_survey`
      );
    });
    cy.contains('button', 'Add questions').click();
    cy.contains('Use a previous survey').click();
    cy.contains('.e2e-error-message', 'Missing start date').should(
      'be.visible'
    );
    cy.contains('The phase could not be saved').should('not.exist');
    cy.get('#phase-build-panel-title').type('Draft survey');
    cy.get('.e2e-date-phase-picker-input').click();
    cy.get('.rdp-today .rdp-day_button').first().click();
    cy.get('.e2e-date-phase-picker-input').click();
    cy.contains('button', 'Add questions').click();
    cy.contains('Use a previous survey').click();
    cy.dataCy('e2e-copy-survey-modal').should('be.visible');
    cy.location('pathname').should('not.include', '/phases/new');
    chooseProject(surveyTitle);
    cy.get('#e2e-phase-filter').select(sourcePhaseId);
    cy.dataCy('e2e-copy-survey-modal-duplicate')
      .find('button')
      .should('have.attr', 'aria-disabled', 'false');
  });

  it('keeps the legacy picker usable without survey-only project filtering', () => {
    cy.intercept('GET', '**/web_api/v1/app_configuration**', (request) => {
      request.continue((response) => {
        response.body.data.attributes.settings.project_backoffice_redesign.enabled =
          false;
      });
    });
    cy.visit(`/admin/projects/${targetId}/phases/${targetPhaseId}/survey-form`);
    cy.contains('button', 'Duplicate another survey').click();
    cy.get('[role="dialog"]').should(
      'not.contain',
      'Search projects with surveys'
    );
    chooseProject(ideaTitle);
    cy.get('[role="dialog"]').should('contain', 'No appropriate phases');
    cy.dataCy('e2e-copy-survey-modal-duplicate')
      .find('button')
      .should('have.attr', 'aria-disabled', 'true');
    chooseProject(surveyTitle);
    cy.get('#e2e-phase-filter').select(sourcePhaseId);
    cy.dataCy('e2e-copy-survey-modal-duplicate')
      .find('button')
      .should('have.attr', 'aria-disabled', 'false');
  });

  it('keeps survey reuse unavailable when responses exist', () => {
    cy.intercept('GET', `**/phases/${targetPhaseId}/submission_count`, {
      data: { type: 'submission_count', attributes: { totalSubmissions: 1 } },
    });
    visitSetup();
    cy.contains('button', 'Edit survey').click();
    cy.get('[role="dialog"]')
      .should('contain', 'Edit form')
      .and('not.contain', 'Use a previous survey');
  });
});
