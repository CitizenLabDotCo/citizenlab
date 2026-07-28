import { randomString } from '../../support/commands';

describe('Project description builder navigation', () => {
  let projectId = '';
  const projectTitle = randomString();

  before(() => {
    cy.getAdminAuthUser().then((user) => {
      const projectDescriptionPreview = randomString();
      const projectDescription = 'Original project description.';
      const userId = user.body.data.id;

      cy.apiCreateProject({
        title: projectTitle,
        descriptionPreview: projectDescriptionPreview,
        description: projectDescription,
        publicationStatus: 'published',
        assigneeId: userId,
      }).then((project) => {
        projectId = project.body.data.id;
      });
    });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit(`/admin/projects/${projectId}/project-page`);
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('navigates to the project page builder when the edit page content button is clicked', () => {
    cy.get('[data-cy="e2e-edit-page-content"]').click({ force: true });
    cy.url().should(
      'eq',
      `${
        Cypress.config().baseUrl
      }/en/admin/project-page-builder/projects/${projectId}`
    );
  });

  it('navigates back to the project page when content builder goBack clicked', () => {
    cy.get('[data-cy="e2e-edit-page-content"]').click({ force: true });
    cy.url().should(
      'eq',
      `${
        Cypress.config().baseUrl
      }/en/admin/project-page-builder/projects/${projectId}`
    );
    cy.get('#e2e-go-back-button').should('be.visible').click();
    cy.url().should(
      'eq',
      `${Cypress.config().baseUrl}/en/admin/projects/${projectId}/project-page`
    );
  });
});
