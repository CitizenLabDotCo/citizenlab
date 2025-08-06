import { randomString } from '../../../support/commands';

describe('Projects overview: admin (projects)', () => {
  const title = randomString();
  let projectId: string;

  before(() => {
    cy.apiCreateProject({
      title,
      description: randomString(),
    }).then((response) => {
      projectId = response.body.data.id;
    });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('Loads the projects overview page', () => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/projects');
    cy.dataCy('projects-overview-table-row').should('have.length.at.least', 10);
  });

  it('Sorts by created date (desc)', () => {
    cy.setAdminLoginCookie();

    // Visit projects overview
    cy.visit('/admin/projects');

    // Set sort
    cy.dataCy('projects-overview-sort-select').select('recently_created_desc');

    // Assert that the first project is the one we created
    cy.dataCy('projects-overview-table-row').first().contains(title);
  });

  it('Persists filters from projects tab to calendar tab', () => {
    // TODO
  });
});

// describe('Projects overview: admin (folders)', () => {});

// describe('Projects overview: project moderator', () => {

// });

// describe('Projects overview: folder moderator', () => {

// });
