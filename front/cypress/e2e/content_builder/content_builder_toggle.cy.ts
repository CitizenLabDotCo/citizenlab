import { randomString } from '../../support/commands';

describe('Content builder toggle', () => {
  let projectId = '';
  let projectSlug = '';

  before(() => {
    cy.setAdminLoginCookie();
    cy.getAuthUser().then((user) => {
      const projectTitle = randomString();
      const projectDescriptionPreview = randomString();
      const projectDescription = 'Original project description.';
      const userId = user.body.data.id;

      cy.apiCreateProject({
        type: 'continuous',
        title: projectTitle,
        descriptionPreview: projectDescriptionPreview,
        description: projectDescription,
        publicationStatus: 'published',
        participationMethod: 'ideation',
        assigneeId: userId,
      }).then((project) => {
        projectId = project.body.data.id;
        projectSlug = projectTitle;
        cy.visit(`/projects/${projectSlug}`);
      });
    });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('shows original description by default', () => {
    cy.contains('Original project description.').should('be.visible');
  });

  it('shows original description when content builder is enabled but there is no content yet', () => {
    cy.visit(`/admin/projects/${projectId}/description`);
    cy.get('#e2e-toggle-enable-content-builder')
      .find('input')
      .click({ force: true });
    cy.visit(`/projects/${projectSlug}`);
    cy.contains('Original project description.').should('be.visible');
  });
});
