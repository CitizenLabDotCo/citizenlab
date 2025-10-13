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

  describe('Project title', () => {
    it('The title preview links to project title settings', () => {
      cy.visit(`admin/projects/${globalProjectId}`);
      cy.dataCy('e2e-project-title-preview-link-to-settings').click();
      cy.get('#e2e-project-title-setting-field').should('exist');
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
