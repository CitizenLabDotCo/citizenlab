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
      cy.visit('/admin/projects');

      cy.dataCy('projects-overview-sort-select').select(
        'recently_created_desc'
      );
      cy.dataCy('projects-overview-table-row').first().contains(projectTitle);

      cy.get('[data-testid="moreOptionsButton"]').first().should('exist');
      cy.get('[data-testid="moreOptionsButton"]').first().click();

      cy.intercept(`**/projects/${projectId}`).as('deleteProject');
      cy.intercept('GET', '**/projects/for_admin**').as('getProjectsForAdmin');

      cy.contains('Delete project').should('exist');
      cy.contains('Delete project').click();

      // Type confirmation word in the modal
      cy.dataCy('typed-confirmation-input').find('input').type('DELETE');
      cy.dataCy('typed-confirmation-delete-button').click();

      cy.wait('@deleteProject');
      cy.wait('@getProjectsForAdmin');

      cy.contains(projectTitle).should('not.exist');
    });
  });

  it('deletes a published project folder', () => {
    cy.apiCreateFolder(generateProjectFolder({})).then((folder) => {
      const folderTitleToDelete =
        folder.body.data.attributes.title_multiloc['en'];
      const folderId = folder.body.data.id;

      cy.visit('/admin/projects');
      cy.dataCy('projects-overview-folders-tab').click();

      cy.contains(folderTitleToDelete).should('exist');

      cy.get('[data-testid="moreOptionsButton"]').first().should('exist');
      cy.get('[data-testid="moreOptionsButton"]').first().click();

      cy.intercept(`**/project_folders/${folderId}`).as('deleteFolder');
      cy.intercept('GET', '**/project_folders/for_admin**').as(
        'getFoldersForAdmin'
      );

      cy.contains('Delete folder').should('exist');
      cy.contains('Delete folder').click();

      // Type confirmation word in the modal
      cy.dataCy('typed-confirmation-input').find('input').type('DELETE');
      cy.dataCy('typed-confirmation-delete-button').click();

      cy.wait('@deleteFolder');
      cy.wait('@getFoldersForAdmin');

      cy.contains(folderTitleToDelete).should('not.exist');
    });
  });
});
