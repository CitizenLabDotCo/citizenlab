import { addMonths, format, subMonths } from 'date-fns';

import { randomString } from '../../support/commands';

describe('Moving a survey phase on and off the timeline', () => {
  let projectId = '';
  let surveyPhaseId = '';

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
    });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.intercept('PATCH', `**/phases/${surveyPhaseId}`).as('updatePhase');
    cy.visit(`/admin/projects/${projectId}/phases/${surveyPhaseId}/setup`);
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('moves the survey off the timeline and back onto it', () => {
    cy.dataCy('e2e-phase-placement-move')
      .should('contain', 'Make it an extra survey')
      .click();
    cy.dataCy('e2e-phase-placement-confirm').click();
    cy.wait('@updatePhase')
      .its('response.body.data.attributes.placement_type')
      .should('eq', 'standalone');
    cy.contains('This survey runs alongside the timeline').should('exist');

    cy.dataCy('e2e-phase-placement-move')
      .should('contain', 'Move onto the timeline')
      .click();
    cy.dataCy('e2e-phase-placement-confirm').click();
    cy.wait('@updatePhase')
      .its('response.body.data.attributes.placement_type')
      .should('eq', 'on_timeline');
    cy.contains('This survey is a phase on the project timeline').should(
      'exist'
    );
  });

  it('cannot be moved while the form has unsaved changes', () => {
    cy.get('#title').first().type(' edited');

    cy.dataCy('e2e-phase-placement-move')
      .find('button')
      .should('have.attr', 'aria-disabled', 'true');
    cy.contains('Save your changes before you move the survey.').should(
      'exist'
    );
  });
});
