import { randomString } from '../../support/commands';

describe('Phase preview live edits', () => {
  let projectId: string;
  let phaseId: string;
  let surveyPhaseId: string;
  const editedTitle = `Updated ${randomString()}`;

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
          startAt: '2020-01-01',
          participationMethod: 'poll',
          allow_anonymous_participation: true,
        });
      })
      .then((phase) => {
        phaseId = phase.body.data.id;

        return cy.apiAddPoll(
          phaseId,
          [{ title: 'Choose an option', type: 'multiple_options' }],
          [['First option', 'Second option']]
        );
      })
      .then(() =>
        cy.apiCreatePhase({
          projectId,
          title: 'Future survey',
          startAt: '2090-01-01',
          participationMethod: 'native_survey',
          nativeSurveyTitleMultiloc: { en: 'Future survey' },
          nativeSurveyButtonMultiloc: { en: 'Answer future survey' },
        })
      )
      .then((phase) => {
        surveyPhaseId = phase.body.data.id;
      });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('keeps the same document and selected answer when the title changes', () => {
    cy.setAdminLoginCookie();
    cy.intercept('POST', '**/poll_responses', () => {
      throw new Error('Preview must not send poll responses to the server');
    });
    cy.visit(
      `admin/projects/${projectId}/phases/${phaseId}/setup?project_backoffice_redesign`
    );

    cy.get('[data-cy="e2e-phase-preview"] iframe')
      .its('0.contentDocument.body')
      .should('not.be.empty')
      .then((body) => {
        const previewDocument = body.ownerDocument;

        cy.wrap(body).find('.e2e-poll-option').first().click();
        cy.get('#phase-build-panel-title').clear().type(editedTitle);
        cy.wrap(body).contains('h3', editedTitle).should('be.visible');

        cy.get('[data-cy="e2e-phase-preview"] iframe')
          .its('0.contentDocument')
          .should('equal', previewDocument);
        cy.wrap(body)
          .find('.e2e-poll-option input:checked')
          .should('have.length', 1);
        cy.wrap(body).find('.e2e-send-poll').click();
        cy.wrap(body).find('.e2e-form-completed').should('be.visible');
      });
  });

  it('shows an unsaved visual phase without creating it or enabling participation', () => {
    cy.setAdminLoginCookie();
    cy.intercept('POST', `**/projects/${projectId}/phases`, () => {
      throw new Error('Visual preview must not create a phase');
    });
    cy.visit(
      `admin/projects/${projectId}/phases/new?participation_method=ideation&project_backoffice_redesign`
    );
    cy.get('#phase-build-panel-title').type('Unsaved preview title');
    cy.get('[data-cy="e2e-phase-preview"] iframe')
      .its('0.contentDocument.body')
      .should('not.be.empty')
      .then((body) => {
        cy.wrap(body)
          .contains('h3', 'Unsaved preview title')
          .should('be.visible');
        cy.wrap(body).contains('Dates to be announced').should('be.visible');
        cy.wrap(body).contains(
          'Save this phase to preview its participation form.'
        );
        cy.wrap(body)
          .find('#e2e-ideation-see-ideas-button')
          .should('be.disabled');
      });
  });

  it('targets the selected future survey instead of the active poll', () => {
    cy.setAdminLoginCookie();
    cy.visit(
      `admin/projects/${projectId}/phases/${surveyPhaseId}/setup?project_backoffice_redesign`
    );
    cy.get('[data-cy="e2e-phase-preview"] iframe')
      .its('0.contentDocument.body')
      .should('not.be.empty')
      .then((body) => {
        cy.wrap(body)
          .contains('button', 'Answer future survey')
          .should('be.visible');
        cy.wrap(body).find('#e2e-participation-cta-poll').should('not.exist');
      });
  });
});
