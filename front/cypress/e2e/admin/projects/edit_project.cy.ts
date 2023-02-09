import { randomString } from '../../../support/commands';

describe('Admin: edit project', () => {
  const projectTitle = randomString();
  const projectDescription = randomString(30);
  const projectDescriptionPreview = randomString(30);
  let projectId: string;

  beforeEach(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }

    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
      participationMethod: 'ideation',
    }).then((project) => {
      projectId = project.body.data.id;
    });

    cy.setAdminLoginCookie();
    cy.visit('/admin/projects/');
    cy.acceptCookies();
  });

  it('navigates to the project page when the user clicks the edit page', () => {
    // Project should appear on top of the projects list
    cy.get('#e2e-admin-projects-list-unsortable')
      .children()
      .first()
      .contains(projectTitle);
    cy.get('.e2e-admin-edit-publication > a').first().click({ force: true });

    cy.location('pathname').should('eq', `/en/admin/projects/${projectId}`);
  });
});
