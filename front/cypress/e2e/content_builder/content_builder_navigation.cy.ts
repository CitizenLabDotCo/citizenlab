import { randomString } from '../../support/commands';

describe('Content builder navigation', () => {
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
      });
    });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('navigates to content builder when edit project description link clicked', () => {
    cy.visit(`/admin/projects/${projectId}/description`);
    cy.get('#e2e-toggle-enable-content-builder')
      .find('input')
      .click({ force: true });
    cy.get('#e2e-content-builder-link').click();
    cy.url().should(
      'eq',
      `${
        Cypress.config().baseUrl
      }/en/admin/content-builder/projects/${projectId}/description`
    );
  });

  it('navigates to projects list when project settings goBack clicked', () => {
    cy.visit(`/admin/projects/${projectId}/description`);
    cy.get('#e2e-go-back-button').click();
    cy.url().should('eq', `${Cypress.config().baseUrl}/en/admin/projects/`);
  });

  it('navigates to project settings when content builder goBack clicked', () => {
    cy.visit(`/admin/content-builder/projects/${projectId}/description`);
    cy.get('#e2e-go-back-button').click();
    cy.url().should(
      'eq',
      `${Cypress.config().baseUrl}/en/admin/projects/${projectId}/description`
    );
  });

  it('navigates to live project when view project button clicked', () => {
    cy.visit(`/admin/projects/${projectId}/description`);
    cy.get('#to-project').click();
    cy.url().should(
      'eq',
      `${Cypress.config().baseUrl}/en/projects/${projectSlug}`
    );
  });

  it('navigates to live project in a new tab when view project button in content builder is clicked', () => {
    const projectUrl = `/en/projects/${projectSlug}`;

    cy.intercept('**/content_builder_layouts/project_description/upsert').as(
      'saveContentBuilder'
    );

    cy.apiEnableContentBuilder({ projectId });
    cy.visit(`/admin/content-builder/projects/${projectId}/description`);
    cy.get('#e2e-view-project-button > a')
      .should(($a) => {
        expect($a.attr('href'), 'href').to.equal(projectUrl);
        expect($a.attr('target'), 'target').to.equal('_blank');
        $a.attr('target', '_self');
      })
      .click();
    cy.location('pathname').should('equal', projectUrl);
  });
});
