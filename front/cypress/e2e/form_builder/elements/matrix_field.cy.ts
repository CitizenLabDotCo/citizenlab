import { randomString } from '../../../support/commands';
import moment = require('moment');

describe('Form builder matrix component', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;
  let projectSlug: string;
  let phaseId: string;

  beforeEach(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }

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
      });

    cy.setAdminLoginCookie();
  });

  it('adds matrix field and is displayed when filling survey', () => {
    cy.visit(
      `admin/projects/${projectId}/phases/${phaseId}/native-survey/edit`
    );
    cy.get('[data-cy="e2e-matrix"]').click();
    cy.get('#e2e-title-multiloc').type('Question title 2', { force: true });
    cy.get('#e2e-option-input-0').type('Statement 1 question 2', {
      force: true,
    });
    cy.get('form').submit();

    cy.visit(`/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`);
    cy.contains('Question title 2').should('exist');
    cy.contains('Statement 1 question 2').should('exist');
    cy.get('#e2e-matrix-control').should('exist');
    cy.injectAxe();
    cy.checkA11y();
  });

  after(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
  });
});
