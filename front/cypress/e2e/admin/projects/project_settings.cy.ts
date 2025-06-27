import { randomString } from '../../../support/commands';

describe('Project settings', () => {
  let globalProjectId: string | null = null;
  let globalFolderId: string | null = null;

  beforeEach(() => {
    cy.setAdminLoginCookie();

    cy.apiCreateProject({
      title: randomString(),
      description: randomString(),
    }).then((project) => {
      const projectId = project.body.data.id;
      if (typeof projectId === 'string') {
        globalProjectId = projectId;

        cy.apiCreateFolder({
          title: randomString(),
          description: randomString(),
          publicationStatus: 'published',
        }).then((folder) => {
          const folderId = folder.body.data.id;
          if (typeof folderId === 'string') {
            globalFolderId = folderId;
            cy.apiAddProjectsToFolder([projectId], folderId);
          }
        });
      }
    });
  });

  describe('Folder', () => {
    it('The folder preview links to the folder selector', () => {
      cy.visit(`admin/projects/${globalProjectId}`);
      cy.dataCy('e2e-folder-preview-link-to-settings').click();
      cy.dataCy('e2e-project-folder-setting-field').should('exist');
    });
  });

  describe('Project title', () => {
    it('The title preview links to project title settings', () => {
      cy.visit(`admin/projects/${globalProjectId}`);
      cy.dataCy('e2e-project-title-preview-link-to-settings').click();
      cy.get('#e2e-project-title-setting-field').should('exist');
    });
  });

  describe('Project description', () => {
    describe('when the content builder toggle is disabled', () => {
      it('links to project description settings', () => {
        cy.visit(`admin/projects/${globalProjectId}`);
        cy.acceptCookies();
        cy.dataCy(
          'e2e-project-description-preview-link-to-multiloc-settings'
        ).click();
        // Check if the description multiloc field is displayed
        cy.get('#e2e-project-description-multiloc-module-active').should(
          'exist'
        );
      });
    });

    describe('when the content builder toggle is enabled', () => {
      it('links to the content builder', () => {
        cy.visit(`admin/projects/${globalProjectId}/settings/description`);
        cy.get('#e2e-toggle-enable-project-description-builder').click({
          force: true,
        });
        cy.visit(`admin/projects/${globalProjectId}`);
        cy.dataCy(
          'e2e-project-description-preview-link-to-content-builder'
        ).click();
        cy.get('#e2e-project-description-content-builder-page').should('exist');
      });
    });
  });

  afterEach(() => {
    if (globalProjectId) {
      cy.apiRemoveProject(globalProjectId);
    }
    if (globalFolderId) {
      cy.apiRemoveFolder(globalFolderId);
    }
  });
});
