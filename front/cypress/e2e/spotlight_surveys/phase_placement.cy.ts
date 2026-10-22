import { addMonths, format, subMonths } from 'date-fns';

import { randomString } from '../../support/commands';

describe('Moving a survey phase on and off the timeline', () => {
  let projectId = '';
  let surveyPhaseId = '';
  let spotlightPhaseId = '';

  before(() => {
    cy.apiCreateProject({
      title: randomString(),
      descriptionPreview: randomString(),
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;

      cy.apiCreateNativeSurveyPhase({
        projectId,
        title: randomString(),
        startAt: format(subMonths(new Date(), 1), 'dd/MM/yyyy'),
        endAt: format(addMonths(new Date(), 1), 'dd/MM/yyyy'),
      }).then((phase) => {
        surveyPhaseId = phase.body.data.id;
      });

      cy.apiCreateNativeSurveyPhase({
        projectId,
        title: randomString(),
        startAt: format(subMonths(new Date(), 1), 'dd/MM/yyyy'),
        endAt: format(addMonths(new Date(), 1), 'dd/MM/yyyy'),
        placementType: 'standalone',
      }).then((phase) => {
        spotlightPhaseId = phase.body.data.id;
      });
    });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.intercept('PATCH', `**/phases/${surveyPhaseId}`).as('updatePhase');
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  // The confirm button stays disabled until the timeline phases have loaded.
  const confirmMove = () => {
    cy.dataCy('e2e-phase-placement-confirm')
      .find('button')
      .should('have.attr', 'aria-disabled', 'false')
      .click();
  };

  describe('in the old back office', () => {
    let redesignWasEnabled = false;

    before(() => {
      cy.apiGetAppConfiguration().then((config) => {
        redesignWasEnabled =
          config.body.data.attributes.settings.project_backoffice_redesign
            ?.enabled === true;
      });
      cy.apiUpdateAppConfiguration({
        settings: {
          project_backoffice_redesign: { allowed: true, enabled: false },
        },
      });
    });

    after(() => {
      cy.apiUpdateAppConfiguration({
        settings: {
          project_backoffice_redesign: {
            allowed: true,
            enabled: redesignWasEnabled,
          },
        },
      });
    });

    it('moves the survey off the timeline and back onto it', () => {
      cy.visit(`/admin/projects/${projectId}/phases/${surveyPhaseId}/setup`);

      cy.dataCy('e2e-phase-placement-move')
        .should('contain', 'Move to spotlight surveys')
        .click();
      confirmMove();
      cy.wait('@updatePhase')
        .its('response.body.data.attributes.placement_type')
        .should('eq', 'standalone');
      cy.contains('This is a spotlight survey.').should('exist');

      cy.dataCy('e2e-phase-placement-move')
        .should('contain', 'Move to timeline')
        .click();
      confirmMove();
      cy.wait('@updatePhase')
        .its('response.body.data.attributes.placement_type')
        .should('eq', 'on_timeline');
      cy.contains('This survey is a phase on the project timeline.').should(
        'exist'
      );
    });

    it('cannot be moved while the form has unsaved changes', () => {
      cy.visit(`/admin/projects/${projectId}/phases/${surveyPhaseId}/setup`);
      cy.get('#title').first().type(' edited');

      cy.dataCy('e2e-phase-placement-move')
        .find('button')
        .should('have.attr', 'aria-disabled', 'true');
      cy.contains('Save your changes before you move the survey.').should(
        'exist'
      );
    });
  });

  describe('in the redesigned back office', () => {
    beforeEach(() => {
      cy.intercept(
        'GET',
        `**/projects/${projectId}/phases?placement_type=standalone`
      ).as('spotlightSurveys');
      cy.visit(`/admin/projects/${projectId}?project_backoffice_redesign`);
      cy.wait('@spotlightSurveys');
    });

    // A moved row only changes list once the spotlight surveys are refetched.
    const moveFromSidebar = (label: string, placementType: string) => {
      cy.dataCy(`e2e-phase-options-${surveyPhaseId}`).click();
      cy.get('.e2e-action-move-phase').should('contain', label).click();
      confirmMove();
      cy.wait('@updatePhase')
        .its('response.body.data.attributes.placement_type')
        .should('eq', placementType);
      cy.wait('@spotlightSurveys');
    };

    it('moves the survey from its menu in the sidebar', () => {
      moveFromSidebar('Move to spotlight surveys', 'standalone');
      moveFromSidebar('Move to timeline', 'on_timeline');
    });

    it('deletes a spotlight survey from its menu in the sidebar', () => {
      cy.dataCy(`e2e-phase-options-${spotlightPhaseId}`).click();
      cy.get('.e2e-action-delete-phase').click();
      cy.dataCy('typed-confirmation-input').type('DELETE');
      cy.dataCy('typed-confirmation-delete-button').click();

      cy.dataCy(`e2e-phase-options-${spotlightPhaseId}`).should('not.exist');
    });
  });
});
