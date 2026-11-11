import { randomString } from '../support/commands';

describe('Phase preview permissions and feature boundary', () => {
  let projectId: string;

  before(() => {
    cy.apiCreateProject({
      title: randomString(),
      descriptionPreview: randomString(),
      publicationStatus: 'published',
    }).then(({ body }) => {
      projectId = body.data.id;
    });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('updates posting and cached reaction permissions without saving the phase', () => {
    cy.setAdminLoginCookie();
    cy.apiCreatePhase({
      projectId,
      title: 'Live permissions',
      startAt: '2097-01-01',
      participationMethod: 'ideation',
      canPost: false,
      canReact: false,
    }).then(({ body }) => {
      const phaseId = body.data.id;
      cy.apiCreateIdea({
        phaseId,
        ideaTitle: 'Live reaction option',
        ideaContent: 'A fresh option for permission checks.',
      });
      cy.intercept('PATCH', `**/phases/${phaseId}`, () => {
        throw new Error('Live settings must not save the phase');
      });
      cy.visit(
        `admin/projects/${projectId}/phases/${phaseId}/setup?project_backoffice_redesign`
      );
      const phone = () =>
        cy
          .get('[data-cy="e2e-phase-preview"] iframe', { timeout: 60000 })
          .its('0.contentDocument.body')
          .should('not.be.empty')
          .then((body) => cy.wrap(body));
      cy.get('[role="group"][aria-label="Preview phase state"]')
        .contains('button', 'Open')
        .click();
      phone().find('#e2e-ideation-cta-button').should('not.exist');
      cy.contains('label', 'Submitting inputs').scrollIntoView().click();
      phone()
        .find('#e2e-ideation-cta-button button')
        .should('have.attr', 'aria-disabled', 'false');
      cy.contains('label', 'Submitting inputs').scrollIntoView().click();
      phone().find('#e2e-ideation-cta-button').should('not.exist');
      cy.get('[role="group"][aria-label="Preview phase state"]')
        .contains('button', 'Participation')
        .click();
      phone().contains('Live reaction option').should('be.visible');
      phone().find('.e2e-ideacard-like-button').should('not.exist');
      cy.contains('label', 'Reacting to inputs').scrollIntoView().click();
      phone().find('.e2e-ideacard-like-button').should('have.class', 'enabled');
      cy.contains('label', 'Reacting to inputs').scrollIntoView().click();
      phone().find('.e2e-ideacard-like-button').should('not.exist');
    });
  });

  (['ideation', 'native_survey', 'poll', 'voting'] as const).forEach(
    (method, index) => {
      it(`keeps the existing ${method} editor when the feature flag is off`, () => {
        cy.setAdminLoginCookie();
        cy.intercept('GET', '**/web_api/v1/app_configuration', (request) => {
          request.continue((response) => {
            response.body.data.attributes.settings.project_backoffice_redesign =
              { allowed: true, enabled: false };
          });
        });
        cy.apiCreatePhase({
          projectId,
          title: `Existing ${method}`,
          startAt: `${2098 + index}-01-01`,
          participationMethod: method,
          nativeSurveyTitleMultiloc:
            method === 'native_survey'
              ? { en: 'Survey', 'nl-BE': 'Survey' }
              : undefined,
          nativeSurveyButtonMultiloc:
            method === 'native_survey'
              ? { en: 'Take survey', 'nl-BE': 'Take survey' }
              : undefined,
          votingMethod: method === 'voting' ? 'multiple_voting' : undefined,
          votingMaxTotal: method === 'voting' ? 10 : undefined,
          votingMinTotal: method === 'voting' ? 1 : undefined,
          votingMaxVotesPerIdea: method === 'voting' ? 5 : undefined,
        }).then(({ body }) => {
          cy.visit(`admin/projects/${projectId}/phases/${body.data.id}/setup`);
          cy.get('[data-cy="e2e-admin-projects-project-index"]').should(
            'be.visible'
          );
          cy.get('#title input, input#title').should(
            'have.value',
            `Existing ${method}`
          );
          cy.get('[data-cy="e2e-phase-preview"]').should('not.exist');
          cy.get('[role="group"][aria-label="Preview phase state"]').should(
            'not.exist'
          );
        });
      });
    }
  );
});
