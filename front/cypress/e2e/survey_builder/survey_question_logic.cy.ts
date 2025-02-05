import { randomString } from '../../support/commands';
import moment = require('moment');

describe('Survey question logic', () => {
  const projectTitle = randomString();
  const phaseTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string | undefined;
  let projectSlug: string | undefined;
  let phaseId: string | undefined;

  before(() => {
    cy.setAdminLoginCookie();
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    })
      .then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;
        return cy.apiCreatePhase({
          projectId: projectId as string,
          title: phaseTitle,
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
      });
  });

  after(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit(
      `/admin/projects/${projectId}/phases/${phaseId}/native-survey/edit`
    );

    // Add a new page
    cy.wait(1000);
    cy.get('[data-cy="e2e-page"').click();

    // Add another page
    cy.wait(1000);
    cy.get('[data-cy="e2e-page"').click();
    cy.get('[data-cy="e2e-field-row"]').should('have.length', 5);
  });

  it('');
});
