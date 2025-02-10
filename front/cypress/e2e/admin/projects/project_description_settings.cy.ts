import { randomString } from '../../../support/commands';

describe('Project description', () => {
  let projectId: string | null = null;

  beforeEach(() => {
    cy.setAdminLoginCookie();
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
    cy.apiCreateProject({
      title: randomString(),
      description: randomString(),
    }).then((project) => {
      projectId = project.body.data.id;
    });
  });

  describe('when the content builder toggle is disabled', () => {
    it('links to project description settings', () => {
      cy.visit(`admin/projects/${projectId}`);
      cy.acceptCookies();
      cy.get(
        '[data-cy="e2e-project-description-preview-link-to-multiloc-settings"]'
      ).click();
      cy.get('#e2e-project-description-multiloc-module-active').should('exist');
    });
  });

  describe('when the content builder toggle is enabled', () => {
    it('links to the content builder', () => {
      cy.visit(`admin/projects/${projectId}/settings/description`);
      cy.get('#e2e-toggle-enable-project-description-builder').click({
        force: true,
      });
      cy.visit(`admin/projects/${projectId}`);
      cy.get(
        '[data-cy="e2e-project-description-preview-link-to-content-builder"]'
      ).click();
      cy.get('#e2e-project-description-content-builder-page').should('exist');
    });
  });
});
