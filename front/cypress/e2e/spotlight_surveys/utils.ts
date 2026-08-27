import moment = require('moment');

import { randomString } from '../../support/commands';

type SpotlightSurveyConfig = {
  title?: string;
  startAt?: string;
  endAt?: string;
};

type SpotlightSurveysProjectResult = {
  projectId: string;
  projectSlug: string;
  surveyPhaseIds: string[];
};

// Creates a published project whose page contains the participation box, an
// optional current ideation phase on the timeline, and one standalone native
// survey phase (an "extra survey") per entry in `surveys`.
export const createProjectWithSpotlightSurveys = ({
  withIdeationPhase = true,
  surveys = [],
}: {
  withIdeationPhase?: boolean;
  surveys?: SpotlightSurveyConfig[];
} = {}): Cypress.Chainable<SpotlightSurveysProjectResult> => {
  return cy
    .apiCreateProject({
      title: randomString(),
      descriptionPreview: randomString(),
      description: randomString(),
      publicationStatus: 'published',
      withAboutBox: true,
    })
    .then((project) => {
      const projectId = project.body.data.id;
      const projectSlug = project.body.data.attributes.slug;
      const surveyPhaseIds: string[] = [];

      if (withIdeationPhase) {
        cy.apiCreatePhase({
          projectId,
          title: randomString(),
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          endAt: moment().add(3, 'month').format('DD/MM/YYYY'),
          participationMethod: 'ideation',
          canPost: true,
          canReact: true,
          canComment: true,
        });
      }

      surveys.forEach((survey) => {
        cy.apiCreateNativeSurveyPhase({
          projectId,
          title: survey.title ?? randomString(),
          startAt:
            survey.startAt ??
            moment().subtract(1, 'month').format('DD/MM/YYYY'),
          endAt: survey.endAt,
          placementType: 'standalone',
        }).then((phase) => {
          surveyPhaseIds.push(phase.body.data.id);
        });
      });

      return cy.wrap({ projectId, projectSlug, surveyPhaseIds });
    });
};

// The e2e class lands on the ButtonWithLink container; the interactive element
// (an anchor when enabled, a disabled button otherwise) is nested inside it.
export const clickSpotlightSurveyButton = () => {
  cy.get('#e2e-about-box .e2e-extra-survey-button')
    .first()
    .find('a, button')
    .first()
    .click({ force: true });
};
