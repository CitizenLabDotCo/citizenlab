import { randomString } from '../../../support/commands';
import moment = require('moment');

describe('Form builder single choice field', () => {
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

  it('adds single select multiple choice field and is displayed when filling survey', () => {
    cy.visit(
      `admin/projects/${projectId}/phases/${phaseId}/native-survey/edit`
    );
    cy.get('[data-cy="e2e-single-choice"]').click();
    cy.get('form').submit();
    cy.contains('Provide a question title').should('exist');
    cy.contains('Provide at least 1 answer').should('exist');
    cy.get('#e2e-title-multiloc').type('Question title', { force: true });
    cy.get('#e2e-option-input-0').type('Option 1', { force: true });
    cy.contains('Save').click();
    cy.visit(`/projects/${projectSlug}/ideas/new?phase_id=${phaseId}`);
    cy.contains('Question title').should('exist');
    cy.contains('Option 1').should('exist');
    cy.contains('Survey').should('exist');
    cy.get('#e2e-single-select-control').should('exist');
  });

  after(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
  });
});
