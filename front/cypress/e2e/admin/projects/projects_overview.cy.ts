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
    cy.visit('/admin/projects');

    // Set sort
    cy.dataCy('projects-overview-sort-select').select('recently_created_desc');

    // Assert that the first project is the one we created
    cy.dataCy('projects-overview-table-row').first().contains(title);
  });

  it('Persists filters from projects tab to calendar tab', () => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/projects');

    // Add filter
    cy.dataCy('projects-overview-add-filter-button').click();
    cy.dataCy('projects-overview-add-filter-status').click();

    // Open filter, select published
    cy.dataCy('projects-overview-filter-status').click();
    cy.dataCy('multiselect-option-published').click();

    // Switch to calendar tab
    cy.dataCy('projects-overview-calendar-tab').click();

    // Assert that the filter is still there
    cy.dataCy('projects-overview-filter-status').should('exist');
    cy.dataCy('projects-overview-filter-status').contains('Status: Published');
  });
});

describe('Projects overview: admin (folders)', () => {
  const folderTitle = randomString();
  let folderId: string;

  before(() => {
    cy.apiCreateFolder({
      title: folderTitle,
      description: randomString(),
    }).then((response) => {
      folderId = response.body.data.id;
    });
  });

  after(() => {
    cy.apiRemoveFolder(folderId);
  });

  it('Finds folder through search', () => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/projects');
    cy.dataCy('projects-overview-folders-tab').click();

    cy.dataCy('projects-overview-search-input').type(folderTitle);
    cy.dataCy('projects-overview-folder-table-row').should('have.length', 1);
    cy.dataCy('projects-overview-folder-table-row')
      .first()
      .contains(folderTitle);
  });
});

// describe('Projects overview: project moderator', () => {

// });

// describe('Projects overview: folder moderator', () => {

// });
