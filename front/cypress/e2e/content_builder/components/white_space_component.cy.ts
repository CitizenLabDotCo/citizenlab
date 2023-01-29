import { randomString } from '../../../support/commands';

describe('Content builder White space component', () => {
  let projectId = '';
  let projectSlug = '';

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
        projectSlug = projectTitle;
        cy.apiEnableContentBuilder({ projectId }).then(() => {
          cy.visit(`/admin/content-builder/projects/${projectId}/description`);
        });
      });
    });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
  });
  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('handles white space component correctly', () => {
    cy.intercept('**/content_builder_layouts/project_description/upsert').as(
      'saveContentBuilder'
    );

    cy.get('#e2e-draggable-white-space').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );
    cy.get('#e2e-white-space-divider-toggle').click({ force: true });

    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveContentBuilder');

    cy.visit(`/projects/${projectSlug}`);
    cy.get('#e2e-white-space').should('be.visible');
    cy.get('#e2e-white-space').within(() => {
      cy.get('hr').should('be.visible');
    });
  });

  it('deletes white space component correctly', () => {
    cy.intercept('**/content_builder_layouts/project_description/upsert').as(
      'saveContentBuilder'
    );
    cy.visit(`/admin/content-builder/projects/${projectId}/description`);

    cy.get('#e2e-white-space').click();
    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveContentBuilder');

    cy.visit(`/projects/${projectSlug}`);
    cy.get('#e2e-white-space').should('not.exist');
  });
});
