import { randomString } from '../../../support/commands';
import generateProject from '../../../fixtures/project';

describe('Admin: delete project', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/projects/');
  });

  it('deletes a published project', () => {
    cy.apiCreateProject(generateProject({})).then((project) => {
      const projectTitleToDelete =
        project.body.data.attributes.title_multiloc['en-GB'];

      cy.contains('.e2e-admin-projects-list-item', projectTitleToDelete)
        .find('.e2e-admin-delete-publication')
        .click();

      cy.on('window:confirm', () => true);
      cy.contains('.e2e-admin-projects-list-item', projectTitleToDelete).should(
        'not.exist'
      );
    });
  });
});
