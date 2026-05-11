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
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
    });

    cy.setAdminLoginCookie();
    cy.visit('/admin/projects');
  });

  it('navigates to the project page when the user clicks the edit page', () => {
    // Set sort
    cy.dataCy('projects-overview-sort-select').select('recently_created_desc');

    // Project should appear on top of the projects list. Click it
    const project = cy
      .dataCy('projects-overview-table-row')
      .first()
      .get('td')
      .first();
    project.contains(projectTitle);
    project.click();

    cy.location('pathname').should('eq', `/en/admin/projects/${projectId}`);
  });

  it('changes project publication status', () => {
    // Set sort
    cy.dataCy('projects-overview-sort-select').select('recently_created_desc');

    // Project should appear on top of the projects list. Click it
    const project = cy
      .dataCy('projects-overview-table-row')
      .first()
      .get('td')
      .first();
    project.contains(projectTitle);
    project.click();

    // Project starts 'published'. Open the Change Status modal
    // and move it to archived.
    cy.get('#e2e-publish').click();
    cy.get('.e2e-projectstatus-archived').click();
    cy.get('#e2e-change-status-submit').click();

    cy.visit('/admin/projects?status=%5B"archived"%5D');

    // Set sort again
    cy.dataCy('projects-overview-sort-select').select('recently_created_desc');

    // Project should appear on top of the archived list. Click it
    const project2 = cy
      .dataCy('projects-overview-table-row')
      .first()
      .get('td')
      .first();
    project2.contains(projectTitle);
    project2.click();

    // Move it to draft via the Change Status modal
    cy.get('#e2e-publish').click();
    cy.get('.e2e-projectstatus-draft').click();
    cy.get('#e2e-change-status-submit').click();

    cy.visit('/admin/projects?status=%5B"draft"%5D');

    // Set sort again
    cy.dataCy('projects-overview-sort-select').select('recently_created_desc');

    cy.dataCy('projects-overview-table-row')
      .first()
      .get('td')
      .first()
      .contains(projectTitle);
  });

  after(() => cy.apiRemoveProject(projectId));
});
