import { randomString } from '../../../support/commands';

describe('Admin: edit project', () => {
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;
  let projectSlug: string;
  let link: string = '';

  before(() => {
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      publicationStatus: 'draft',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;
      cy.setAdminLoginCookie();
      cy.visit(`admin/projects/${projectId}`);
      cy.get('#e2e-share-link').click();

      cy.get('#e2e-link')
        .invoke('text')
        .then((text) => {
          link = text;
        });

      cy.logout();
    });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('should not be able to access a draft project without a preview link', () => {
    cy.visit(`projects/${projectSlug}`);
    cy.get('#e2e-not-authorized').should('exist');
  });

  it('should be able to access a draft project with a preview link', () => {
    cy.visit(link);
    cy.url().should('contain', `/projects/${projectSlug}`);
    cy.get('#e2e-project-page').should('contain', projectTitle);
  });

  it('should not access project with invalid preview link', () => {
    cy.setAdminLoginCookie();
    cy.visit(`admin/projects/${projectId}`);
    cy.get('#e2e-share-link').click();
    cy.get('#e2e-refresh-link').click();
    // Wait for the token refresh to actually persist before visiting the
    // old link — a fixed wait raced the request on slow backends, and the
    // old token then still granted access.
    cy.intercept('POST', '**/projects/*/refresh_preview_token').as(
      'refreshToken'
    );
    cy.get('#e2e-refresh-link-accept').click();
    cy.wait('@refreshToken').its('response.statusCode').should('eq', 200);
    cy.logout();

    cy.visit(link);
    cy.get('#e2e-not-authorized').should('exist');
  });
});
