import { randomString } from '../../support/commands';
import moment = require('moment');

describe('Verified action', () => {
  let projectId: string;
  let projectSlug: string;
  let phaseId: string;

  before(() => {
    cy.apiCreateProject({
      title: randomString(),
      descriptionPreview: randomString(),
      description: randomString(),
      publicationStatus: 'published',
    })
      .then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;

        return cy.apiCreatePhase({
          projectId,
          title: 'firstPhaseTitle',
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          participationMethod: 'native_survey',
          nativeSurveyButtonMultiloc: { en: 'Take the survey' },
          nativeSurveyTitleMultiloc: { en: 'Survey' },
          canPost: true,
          canComment: true,
          canReact: true,
        });
      })
      .then((phase) => {
        phaseId = phase.body.data.id;

        // Select verified action
        cy.setAdminLoginCookie();
        cy.visit(
          `/admin/projects/${projectId}/phases/${phaseId}/access-rights`
        );
      });
  });

  it('Works', () => {});

  it('Does not ask for email when no email is returned', () => {});
});
