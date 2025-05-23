import { randomString } from '../../support/commands';

describe('Project description builder navigation', () => {
  let projectId = '';
  const projectTitle = randomString();

  before(() => {
    cy.setAdminLoginCookie();
    cy.getAuthUser().then((user) => {
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
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('navigates to project description builder when edit project description link clicked', () => {
    cy.visit(`/admin/projects/${projectId}/settings/description`);
    cy.acceptCookies();
    cy.dataCy('e2e-toggle-enable-project-description-builder').click();
    cy.get('#e2e-project-description-builder-link').should('be.visible');
    cy.get('#e2e-project-description-builder-link').click();
    cy.url().should(
      'eq',
      `${
        Cypress.config().baseUrl
      }/en/admin/project-description-builder/projects/${projectId}/description`
    );
  });

  it.skip('navigates to projects list when project settings goBack clicked', () => {
    cy.visit(`/admin/projects/${projectId}/settings/description`);
    cy.get('#e2e-go-back-button').should('exist');
    cy.get('#e2e-go-back-button').click();
    cy.get('#e2e-projects-admin-container').should('exist');
    cy.url().should('eq', `${Cypress.config().baseUrl}/en/admin/projects/`);
  });

  it('navigates to project settings when content builder goBack clicked', () => {
    cy.visit(`/admin/projects/${projectId}/settings/description`);
    cy.acceptCookies();
    cy.get('#e2e-project-description-builder-link').click({ force: true });
    cy.url().should(
      'eq',
      `${
        Cypress.config().baseUrl
      }/en/admin/project-description-builder/projects/${projectId}/description`
    );
    cy.get('#e2e-go-back-button').should('exist');
    cy.get('#e2e-go-back-button').click({ force: true });
    cy.url().should(
      'eq',
      `${
        Cypress.config().baseUrl
      }/en/admin/projects/${projectId}/settings/description`
    );
  });
});
