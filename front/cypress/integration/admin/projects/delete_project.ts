import { randomString } from '../../../support/commands';
import { generateProject, generateProjectFolder } from '../../../fixtures';

describe('Admin: delete project', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/projects/');
  });

  it('deletes a published project', () => {
    cy.apiCreateProject(generateProject({})).then((project) => {
      const projectTitleToDelete =
        project.body.data.attributes.title_multiloc['en'];
      const projectIdToDelete = project.body.data.id;

      cy.route2({
        path: `/web_api/v1/projects/${projectIdToDelete}`,
        method: 'DELETE',
      }).as('deleteProject');

      cy.contains('.e2e-admin-projects-list-item', projectTitleToDelete)
        .find('.e2e-admin-delete-publication')
        .click();
      cy.on('window:confirm', () => true);
      cy.wait('@deleteProject', { responseTimeout: 10000 }).then(() => {
        cy.contains(
          '.e2e-admin-projects-list-item',
          projectTitleToDelete
        ).should('not.exist');
      });
    });
  });

  it('deletes a published project folder', () => {
    cy.apiCreateFolder(generateProjectFolder({})).then((project) => {
      const folderTitleToDelete =
        project.body.data.attributes.title_multiloc['en'];
      const folderIdToDelete = project.body.data.id;
      cy.log(folderTitleToDelete);
      cy.route2({
        path: `/web_api/v1/project_folders/${folderIdToDelete}`,
        method: 'DELETE',
      }).as('deleteFolder');

      cy.contains('.e2e-admin-adminPublications-list-item', folderTitleToDelete)
        .find('.e2e-admin-delete-publication')
        .click();
      cy.on('window:confirm', () => true);
      cy.wait('@deleteFolder', { responseTimeout: 10000 }).then(() => {
        cy.contains(
          '.e2e-admin-projects-list-item',
          folderTitleToDelete
        ).should('not.exist');
      });
    });
  });
});
