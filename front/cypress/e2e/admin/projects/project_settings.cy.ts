import { randomString } from '../../../support/commands';

describe('Project settings', () => {
  let projectId: string | null = null;

  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.apiCreateProject({
      title: randomString(),
      description: randomString(),
    }).then((project) => {
      projectId = project.body.data.id;
    });
  });

  describe('Project title', () => {
    it('The title preview links to project title settings', () => {
      cy.visit(`admin/projects/${projectId}`);
      cy.get('[data-cy="e2e-project-title-preview-link-to-settings"]').click();
      cy.get('#e2e-project-title-setting-field').should('exist');
    });
  });

  afterEach(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
  });
});
