import { randomString } from '../../../support/commands';

describe('Project description builder Two Column component', () => {
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

  it('handles Two Column component correctly', () => {
    cy.intercept('**/content_builder_layouts/project_page/upsert').as(
      'saveProjectDescriptionBuilder'
    );
    cy.get('#e2e-draggable-two-column').dragAndDrop('#e2e-project-page-body', {
      position: 'inside',
    });

    // The seeded layout already contains two-column widgets, so scope
    // everything to the dropped one.
    cy.get('.e2e-two-column').should('have.length', 3);

    // Components added to both columns of the dropped widget
    cy.get('#e2e-draggable-text').dragAndDrop(
      '.e2e-two-column:first div.e2e-single-column',
      { position: 'inside' }
    );
    cy.get('#e2e-draggable-about-box').dragAndDrop(
      '.e2e-two-column:first div.e2e-single-column',
      { position: 'inside' }
    );

    cy.get('.e2e-two-column:first div.e2e-text-box').should('have.length', 2);
    cy.get('.e2e-two-column:first div#e2e-about-box').should('have.length', 2);

    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveProjectDescriptionBuilder');

    cy.visit(`/projects/${projectSlug}`);
    cy.get('.e2e-two-column').should('have.length', 3);
    cy.get('.e2e-two-column:first div.e2e-text-box').should('have.length', 2);
    cy.get('.e2e-two-column:first div#e2e-about-box').should('have.length', 2);
  });

  it('deletes Two Column component correctly', () => {
    cy.intercept('**/content_builder_layouts/project_page/upsert').as(
      'saveProjectDescriptionBuilder'
    );
    cy.visit(`/admin/project-page-builder/projects/${projectId}`);
    cy.get('.e2e-two-column').should('have.length', 3);

    cy.get('.e2e-two-column:first').click('top');
    cy.get('#e2e-delete-button').click();
    cy.get('.e2e-two-column').should('have.length', 2);
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveProjectDescriptionBuilder');

    cy.visit(`/projects/${projectSlug}`);
    cy.get('.e2e-two-column').should('have.length', 2);
    cy.get('div#e2e-about-box').should('have.length', 1);
  });
});
