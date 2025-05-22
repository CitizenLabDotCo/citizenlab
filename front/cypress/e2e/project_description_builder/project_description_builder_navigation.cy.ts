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

  // Commenting this out as it is very flaky. https://github.com/CitizenLabDotCo/citizenlab/pull/3398#issuecomment-1340646247
  // it('navigates to live project when view project button clicked', () => {
  //   cy.visit(`/admin/projects/${projectId}/description`);
  //   cy.get('#to-project').click();
  //   cy.url().should(
  //     'eq',
  //     `${Cypress.config().baseUrl}/en/projects/${projectSlug}`
  //   );
  // });

  /** Commenting this out as it is very flaky. https://citizenlabco.slack.com/archives/C02PFSWEK6X/p1667892380157819?thread_ts=1667876187.090919&cid=C02PFSWEK6X
  it('navigates to live project in a new tab when view project button in project description builder is clicked', () => {
    const projectUrl = `/en/projects/${projectSlug}`;

    cy.intercept('**\/content_builder_layouts/project_description/upsert').as(
      'saveProjectDescriptionBuilder'
    );

    cy.visit(`/admin/project-description-builder/projects/${projectId}/description`);
    cy.get('#e2e-draggable-about-box').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );

    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveProjectDescriptionBuilder');

    cy.get('#e2e-view-project-button > a').should(
      'have.attr',
      'href',
      projectUrl
    );
    cy.get('#e2e-view-project-button > a').should(
      'have.attr',
      'target',
      '_blank'
    );
    cy.get('#e2e-view-project-button > a').invoke('removeAttr', 'target');

    cy.get('#e2e-view-project-button > a').click();
    cy.location('pathname').should('equal', projectUrl);
  });
  */
});
