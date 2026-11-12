import moment = require('moment');

import { randomString } from '../support/commands';

// Links to the idea and survey forms used to carry the phase as `?phase_id=`
// (or no phase at all). They must keep working now that the phase is part of
// the path.
describe('Input form URL redirects', () => {
  let projectId: string;
  let projectSlug: string;
  let ideationPhaseId: string;
  let surveyPhaseId: string;

  before(() => {
    cy.apiCreateProject({
      title: randomString(),
      descriptionPreview: randomString(),
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;

      // The standalone survey starts first, so a client-side "first active
      // phase" lookup would pick it over the timeline phase.
      cy.apiCreateNativeSurveyPhase({
        projectId,
        title: randomString(),
        startAt: moment().subtract(2, 'month').format('DD/MM/YYYY'),
        placementType: 'standalone',
      }).then((phase) => {
        surveyPhaseId = phase.body.data.id;
      });

      cy.apiCreatePhase({
        projectId,
        title: randomString(),
        startAt: moment().subtract(1, 'month').format('DD/MM/YYYY'),
        endAt: moment().add(1, 'month').format('DD/MM/YYYY'),
        participationMethod: 'ideation',
        canPost: true,
        canReact: true,
        canComment: true,
      }).then((phase) => {
        ideationPhaseId = phase.body.data.id;
      });
    });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  describe('ideas/new', () => {
    it('opens the current timeline phase when no phase is given', () => {
      cy.visit(`/projects/${projectSlug}/ideas/new`);
      cy.location('pathname').should(
        'eq',
        `/en/projects/${projectSlug}/ideas/new/${ideationPhaseId}`
      );
    });

    it('moves phase_id into the path and keeps the other params', () => {
      cy.visit(
        `/projects/${projectSlug}/ideas/new?phase_id=${ideationPhaseId}&lat=50.5&lng=4.5`
      );
      cy.location('pathname').should(
        'eq',
        `/en/projects/${projectSlug}/ideas/new/${ideationPhaseId}`
      );
      cy.location('search').should('include', 'lat=50.5');
      cy.location('search').should('include', 'lng=4.5');
      cy.location('search').should('not.include', 'phase_id');
    });

    it('sends a survey phase to the survey form', () => {
      cy.visit(`/projects/${projectSlug}/ideas/new?phase_id=${surveyPhaseId}`);
      cy.location('pathname').should(
        'eq',
        `/en/projects/${projectSlug}/surveys/new/${surveyPhaseId}`
      );

      cy.visit(`/projects/${projectSlug}/ideas/new/${surveyPhaseId}`);
      cy.location('pathname').should(
        'eq',
        `/en/projects/${projectSlug}/surveys/new/${surveyPhaseId}`
      );
    });
  });

  describe('surveys/new', () => {
    it('moves phase_id into the path and keeps the other params', () => {
      cy.visit(
        `/projects/${projectSlug}/surveys/new?phase_id=${surveyPhaseId}&go_back=true`
      );
      cy.location('pathname').should(
        'eq',
        `/en/projects/${projectSlug}/surveys/new/${surveyPhaseId}`
      );
      cy.location('search').should('include', 'go_back');
      cy.location('search').should('not.include', 'phase_id');
    });
  });
});
