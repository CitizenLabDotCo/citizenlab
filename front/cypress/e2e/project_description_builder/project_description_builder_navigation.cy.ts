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
    cy.visit(`/admin/projects/${projectId}/general`);
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('navigates to project description builder when edit project description link clicked', () => {
    cy.get('#e2e-project-description-builder-link')
      .should('be.visible')
      .click();
    cy.url().should(
      'eq',
      `${
        Cypress.config().baseUrl
      }/en/admin/description-builder/projects/${projectId}/description`
    );
  });

  it('navigates to project settings when content builder goBack clicked', () => {
    cy.get('#e2e-project-description-builder-link')
      .should('be.visible')
      .click();
    cy.url().should(
      'eq',
      `${
        Cypress.config().baseUrl
      }/en/admin/description-builder/projects/${projectId}/description`
    );
    cy.get('#e2e-go-back-button').should('be.visible').click();
    cy.url().should(
      'eq',
      `${Cypress.config().baseUrl}/en/admin/projects/${projectId}/general`
    );
  });
});
