import { randomString } from '../../../support/commands';

describe('Project description builder Text component', () => {
  let projectId = '';
  let projectSlug = '';

  before(() => {
    cy.setAdminLoginCookie();
    cy.getAdminAuthUser().then((user) => {
      const projectTitle = randomString();
      const projectDescriptionPreview = randomString();
      const projectDescription = '';
      const userId = user.body.data.id;

      cy.apiCreateProject({
        title: projectTitle,
        descriptionPreview: projectDescriptionPreview,
        description: projectDescription,
        publicationStatus: 'published',
        assigneeId: userId,
      }).then((project) => {
        projectId = project.body.data.id;
        projectSlug = projectTitle;
        cy.apiToggleProjectDescriptionBuilder({ projectId });
        cy.visit(`/admin/project-page-builder/projects/${projectId}`);
      });
    });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('handles Text component correctly', () => {
    cy.intercept('**/content_builder_layouts/project_page/upsert').as(
      'saveProjectDescriptionBuilder'
    );
    cy.get('#e2e-draggable-text').dragAndDrop('#e2e-project-page-body', {
      position: 'inside',
    });

    // The seeded layout already contains text widgets, so target the dropped one.
    cy.get('div.e2e-text-box').should('have.length', 3);
    cy.get('div.e2e-text-box').first().click();
    cy.get('.ql-editor').click();
    cy.get('.ql-editor').type('Edited text.', { force: true });

    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveProjectDescriptionBuilder');

    cy.visit(`/projects/${projectSlug}`);
    cy.contains('Edited text.').should('be.visible');
  });

  it('deletes Text component correctly', () => {
    cy.intercept('**/content_builder_layouts/project_page/upsert').as(
      'saveProjectDescriptionBuilder'
    );
    cy.visit(`/admin/project-page-builder/projects/${projectId}`);

    cy.contains('.e2e-text-box', 'Edited text.').click();
    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveProjectDescriptionBuilder');

    cy.visit(`/projects/${projectSlug}`);
    cy.contains('Edited text.').should('not.exist');
  });
});
