import { randomString } from '../../../support/commands';

describe('Admin: access rights', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  it('navigates to the project permissions when the user clicks the "admins only" permissions label', () => {
    cy.apiCreateProject({
      title: randomString(),
      descriptionPreview: randomString(),
      description: randomString(),
      publicationStatus: 'published',
      visibleTo: 'admins',
    }).then((project) => {
      const projectId = project.body.data.id;

      cy.visit('/admin/projects/all');
      cy.acceptCookies();
      cy.dataCy('e2e-admins-only-permissions-tag').first().click();

      cy.location('pathname').should(
        'eq',
        `/en/admin/projects/${projectId}/settings/access-rights`
      );
    });
  });

  it('navigates to the project permissions when the user clicks the "groups can view" permissions label', () => {
    cy.apiCreateProject({
      title: randomString(),
      descriptionPreview: randomString(),
      description: randomString(),
      publicationStatus: 'published',
      visibleTo: 'groups',
    }).then((project) => {
      const projectId = project.body.data.id;

      cy.visit('/admin/projects/all');
      cy.dataCy('e2e-groups-permissions-tag').first().click();

      cy.location('pathname').should(
        'eq',
        `/en/admin/projects/${projectId}/settings/access-rights`
      );
    });
  });
});
