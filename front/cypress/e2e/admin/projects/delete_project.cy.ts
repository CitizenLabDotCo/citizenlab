import { generateProjectFolder } from '../../../fixtures';
import { randomString } from '../../../support/commands';

describe('Admin: delete project', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  it('deletes a published project', () => {
    const projectTitle = randomString();
    const projectDescriptionPreview = randomString();
    const projectDescription = randomString();
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    }).then((project) => {
      const projectId = project.body.data.id;
      cy.visit('/admin/projects/all');
      cy.acceptCookies();

      cy.get('#e2e-admin-projects-list-unsortable')
        .children()
        .first()
        .contains(projectTitle);

      cy.get('[data-testid="moreOptionsButton"]').first().should('exist');
      cy.get('[data-testid="moreOptionsButton"]').first().click();

      cy.intercept(`**/projects/${projectId}`).as('deleteProject');
      cy.intercept('GET', '**/admin_publications**').as('getAdminPublications');

      cy.contains('Delete project').should('exist');
      cy.contains('Delete project').click();

      cy.on('window:confirm', () => true);

      cy.wait('@deleteProject');
      cy.wait('@getAdminPublications');

      cy.contains(projectTitle).should('not.exist');
    });
  });

  it('deletes a published project folder', () => {
    cy.apiCreateFolder(generateProjectFolder({})).then((folder) => {
      const folderTitleToDelete =
        folder.body.data.attributes.title_multiloc['en'];
      const folderId = folder.body.data.id;
      cy.visit('/admin/projects/all');
      cy.acceptCookies();

      cy.contains(folderTitleToDelete).should('exist');

      cy.get('[data-testid="moreOptionsButton"]').first().should('exist');
      cy.get('[data-testid="moreOptionsButton"]').first().click();

      cy.intercept(`**/project_folders/${folderId}`).as('deleteFolder');
      cy.intercept('GET', '**/admin_publications**').as('getAdminPublications');

      cy.contains('Delete folder').should('exist');
      cy.contains('Delete folder').click();

      cy.on('window:confirm', () => true);

      cy.wait('@deleteFolder');
      cy.wait('@getAdminPublications');

      cy.contains(folderTitleToDelete).should('not.exist');
    });
  });
});
