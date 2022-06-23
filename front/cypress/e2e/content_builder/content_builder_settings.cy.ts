import { randomString } from '../../support/commands';

describe('Settings panel options', () => {
  let projectId = '';

  before(() => {
    cy.setAdminLoginCookie();
    cy.getAuthUser().then((user) => {
      const projectTitle = randomString();
      const projectDescriptionPreview = randomString();
      const projectDescription = 'Original project description.';
      const userId = user.body.data.id;

      cy.apiCreateProject({
        type: 'continuous',
        title: projectTitle,
        descriptionPreview: projectDescriptionPreview,
        description: projectDescription,
        publicationStatus: 'published',
        participationMethod: 'ideation',
        assigneeId: userId,
      }).then((project) => {
        projectId = project.body.data.id;
        cy.visit(`/admin/projects/${projectId}/description`);
        cy.get('#e2e-toggle-enable-content-builder')
          .find('input')
          .click({ force: true });
      });
    });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('handles close button click correctly', () => {
    cy.visit(`/admin/content-builder/projects/${projectId}/description`);
    cy.get('#e2e-draggable-text').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });

    cy.get('#e2e-text-box').click();
    cy.get('.e2eBuilderSettingsClose').click();

    cy.get('#e2e-node-label').should('not.exist');
    cy.get('#e2e-delete-button').should('not.exist');
  });
});
