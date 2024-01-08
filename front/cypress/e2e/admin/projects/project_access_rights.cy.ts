import { randomString } from '../../../support/commands';

describe('Admin: access rights', () => {
  const projectTitle = randomString();
  const projectDescription = randomString(1);
  const projectDescriptionPreview = randomString(1);
  let projectId: string | null = null;

  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  it('navigates to the project permissions when the user clicks the "admins only" permissions label', () => {
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
      visibleTo: 'admins',
    }).then((project) => {
      const projectId = project.body.data.id;

      cy.visit('/admin/projects/');
      cy.acceptCookies();
      cy.get('[data-cy="e2e-admins-only-permissions-tag"]').first().click();

      cy.location('pathname').should(
        'eq',
        `/en/admin/projects/${projectId}/settings/access-rights`
      );
    });
  });

  it('navigates to the project permissions when the user clicks the "groups can view" permissions label', () => {
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
      visibleTo: 'groups',
    }).then((project) => {
      const projectId = project.body.data.id;

      cy.visit('/admin/projects/');
      cy.acceptCookies();
      cy.get('[data-cy="e2e-groups-permissions-tag"]').first().click();

      cy.location('pathname').should(
        'eq',
        `/en/admin/projects/${projectId}/settings/access-rights`
      );
    });
  });
});
