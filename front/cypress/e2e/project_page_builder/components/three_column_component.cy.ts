import { randomString } from '../../../support/commands';

describe('Project description builder Three Column component', () => {
  let projectId = '';
  let projectSlug = '';

  before(() => {
    cy.setAdminLoginCookie();
    cy.getAdminAuthUser().then((user) => {
      const projectTitle = randomString();
      const projectDescriptionPreview = randomString();
      const userId = user.body.data.id;

      cy.apiCreateProject({
        title: projectTitle,
        descriptionPreview: projectDescriptionPreview,
        publicationStatus: 'published',
        assigneeId: userId,
      }).then((project) => {
        projectId = project.body.data.id;
        projectSlug = projectTitle;
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

  it('handles Three Column component correctly', () => {
    cy.intercept('**/content_builder_layouts/project_page/upsert').as(
      'saveProjectDescriptionBuilder'
    );
    cy.get('#e2e-draggable-three-column').dragAndDrop(
      '#e2e-project-page-body',
      {
        position: 'inside',
      }
    );

    // Components added to all columns. The seeded layout has its own columns
    // and widgets, so scope everything to the dropped three-column.
    cy.get('#e2e-draggable-about-box').dragAndDrop(
      '.e2e-three-column div.e2e-single-column',
      { position: 'inside' }
    );
    cy.get('#e2e-draggable-text').dragAndDrop(
      '.e2e-three-column div.e2e-single-column',
      { position: 'inside' }
    );

    cy.get('.e2e-three-column div.e2e-text-box').should('have.length', 3);
    cy.get('.e2e-three-column div#e2e-about-box').should('have.length', 3);

    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveProjectDescriptionBuilder');

    // Check column and elements exist on page
    cy.visit(`/projects/${projectSlug}`);
    cy.get('.e2e-three-column').should('exist');
    cy.get('.e2e-three-column div.e2e-text-box').should('have.length', 3);
    cy.get('.e2e-three-column div#e2e-about-box').should('have.length', 3);
  });

  it('deletes Three Column component correctly', () => {
    cy.intercept('**/content_builder_layouts/project_page/upsert').as(
      'saveProjectDescriptionBuilder'
    );
    cy.visit(`/admin/project-page-builder/projects/${projectId}`);
    cy.get('.e2e-three-column').should('be.visible');

    cy.get('.e2e-three-column').click('top');
    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveProjectDescriptionBuilder');

    cy.visit(`/projects/${projectSlug}`);
    cy.get('.e2e-three-column').should('not.exist');
  });
});
