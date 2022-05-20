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

      cy.contains('.e2e-admin-projects-list-item', projectTitleToDelete)
        .find('.e2e-admin-delete-publication')
        .click();

      cy.on('window:confirm', () => true);

      cy.contains('.e2e-admin-projects-list-item', projectTitleToDelete).should(
        'not.exist'
      );
    });
  });

  it('deletes a published project folder', () => {
    cy.apiCreateFolder(generateProjectFolder({})).then((project) => {
      const folderTitleToDelete =
        project.body.data.attributes.title_multiloc['en'];
      cy.log(folderTitleToDelete);

      cy.contains('.e2e-admin-adminPublications-list-item', folderTitleToDelete)
        .find('.e2e-admin-delete-publication')
        .click();
      cy.on('window:confirm', () => true);

      cy.contains('.e2e-admin-projects-list-item', folderTitleToDelete).should(
        'not.exist'
      );
    });
  });
});
