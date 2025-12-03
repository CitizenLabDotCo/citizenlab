import { randomString } from '../../support/commands';
import moment = require('moment');

describe('Settings panel options', () => {
  let projectId = '';
  let phaseId: string;

  beforeEach(() => {
    cy.setAdminLoginCookie();
    if (projectId) {
      cy.apiRemoveProject(projectId);
      projectId = '';
    }

    cy.getAuthUser().then((user) => {
      const projectTitle = randomString();
      const projectDescriptionPreview = randomString();
      const projectDescription = 'Original project description.';
      const userId = user.body.data.id;

      cy.apiCreateProject({
        title: projectTitle,
        descriptionPreview: projectDescriptionPreview,
        description: projectDescription,
        publicationStatus: 'published',
        assigneeId: userId,
      })
        .then((project) => {
          projectId = project.body.data.id;
          return cy.apiCreatePhase({
            projectId,
            title: 'firstPhaseTitle',
            startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
            participationMethod: 'ideation',
            canPost: true,
            canComment: true,
            canReact: true,
          });
        })
        .then((phase) => {
          phaseId = phase.body.data.id;
          cy.visit(`/admin/projects/${projectId}/general`);
          cy.get('#e2e-toggle-enable-project-description-builder').click({
            force: true,
          });
        });
    });
  });

  after(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
      projectId = '';
    }
  });

  it('handles close button click correctly', () => {
    cy.visit(`/admin/description-builder/projects/${projectId}/description`);
    cy.get('#e2e-draggable-text').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });

    cy.get('.e2e-text-box').click();
    cy.get('.e2eBuilderSettingsClose').click();

    cy.get('#e2e-node-label').should('not.exist');
    cy.get('#e2e-delete-button').should('not.exist');
  });
});
